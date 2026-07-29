import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { getPlans, subscribePlan, createRazorpayOrder, verifyRazorpayPayment } from "../../services/planService";
import type { Plan } from "../../services/planService";
import { useAuth } from "../../context/AuthContext";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function TiltCard({ children }: { children: React.ReactNode }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    cardRef.current.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: 'preserve-3d', transition: 'transform 0.15s ease-out' }}
    >
      {children}
    </div>
  );
}

export default function Plans() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"Wallet" | "Razorpay">("Wallet");
  const [subscribeError, setSubscribeError] = useState("");

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setError("");
      const result = await getPlans();
      setPlans(result.filter((p) => p.status));
    } catch (err: any) {
      setError("Unable to load plans.");
    } finally {
      setLoading(false);
    }
  };

  const openSubscribeModal = (plan: Plan) => {
    setSelectedPlan(plan);
    setPaymentMethod("Wallet");
    setSubscribeError("");
    setShowModal(true);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    setSubscribing(selectedPlan._id);
    setSubscribeError("");

    try {
      if (paymentMethod === "Wallet") {
        const res = await subscribePlan({
          planId: selectedPlan._id,
          paymentMethod: "Wallet",
        });

        if (res.success) {
          alert("Plan subscribed successfully!");
          setShowModal(false);
        } else {
          setSubscribeError(res.message || "Subscription failed.");
        }
      } else {
        // Razorpay flow
        const orderRes = await createRazorpayOrder(selectedPlan._id);

        if (!orderRes.success || !orderRes.order) {
          setSubscribeError(orderRes.message || "Failed to create payment order.");
          return;
        }

        const order = orderRes.order;
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || "",
          amount: order.amount,
          currency: order.currency || "INR",
          name: "Nexora",
          description: selectedPlan.title,
          order_id: order.id,
          handler: async (response: any) => {
            try {
              const verifyRes = await verifyRazorpayPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                planId: selectedPlan._id,
              });

              if (verifyRes.success) {
                alert("Payment successful! Plan subscribed.");
                setShowModal(false);
              } else {
                setSubscribeError(verifyRes.message || "Payment verification failed.");
              }
            } catch (err: any) {
              setSubscribeError(err.response?.data?.message || "Payment verification failed.");
            }
          },
          prefill: {
            name: user?.fullName || "",
            email: user?.email || "",
            contact: user?.mobile || "",
          },
          theme: {
            color: "#2563eb",
          },
          modal: {
            ondismiss: () => {
              setSubscribing(null);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (response: any) => {
          setSubscribeError(response.error?.description || "Payment failed.");
        });
        rzp.open();
      }
    } catch (err: any) {
      setSubscribeError(err.response?.data?.message || "Subscription failed. Please try again.");
    } finally {
      setSubscribing(null);
    }
  };

  const formatCurrency = (amount?: number) =>
    `₹${Number(amount || 0).toFixed(2)}`;

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        Loading plans...
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <h2 className="empty-state-title">Unable to load plans</h2>
        <p className="empty-state-text">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 style={{ color: "#fff", margin: 0, fontSize: 24 }}>Investment Plans</h1>
          <p style={{ color: "#94a3b8", marginTop: 4 }}>
            Choose a plan and start earning returns
          </p>
        </div>
      </div>

      {plans.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h2 className="empty-state-title">No plans available</h2>
          <p className="empty-state-text">Check back later for new investment plans.</p>
        </div>
      ) : (
        <div
          className="plans-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 20,
            maxWidth: 600,
            margin: "0 auto",
          }}
        >
          {plans.map((plan, idx) => (
            <TiltCard key={plan._id}>
            <motion.div
              className="card plan-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.4, 0, 0.2, 1] }}
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              {plan.image && (
                <img
                  src={plan.image}
                  alt={plan.title}
                  style={{
                    width: "100%",
                    height: 160,
                    objectFit: "cover",
                    borderRadius: 12,
                    marginBottom: 16,
                  }}
                />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <h3 style={{ color: "#fff", margin: 0, fontSize: 18, fontWeight: 800 }}>
                    {plan.title}
                  </h3>
                  <span className="status-badge status-active">{plan.category}</span>
                </div>
                {plan.description && (
                  <p style={{ color: "#94a3b8", fontSize: 13, margin: "0 0 16px", lineHeight: 1.5 }}>
                    {plan.description}
                  </p>
                )}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  padding: "16px 0",
                  borderTop: "1px solid #334155",
                  marginBottom: 16,
                }}
              >
                <div>
                  <div style={{ color: "#94a3b8", fontSize: 11 }}>Investment</div>
                  <div style={{ color: "#fff", fontSize: 20, fontWeight: 800, marginTop: 4 }}>
                    {formatCurrency(plan.price)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#94a3b8", fontSize: 11 }}>Duration</div>
                  <div style={{ color: "#fff", fontSize: 20, fontWeight: 800, marginTop: 4 }}>
                    {plan.duration} days
                  </div>
                </div>
                <div>
                  <div style={{ color: "#94a3b8", fontSize: 11 }}>Return Amount</div>
                  <div style={{ color: "#22c55e", fontSize: 20, fontWeight: 800, marginTop: 4 }}>
                    {formatCurrency(plan.returnAmount)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#94a3b8", fontSize: 11 }}>Return %</div>
                  <div style={{ color: "#fcd34d", fontSize: 20, fontWeight: 800, marginTop: 4 }}>
                    {plan.price > 0
                      ? `${((plan.returnAmount / plan.price) * 100).toFixed(1)}%`
                      : "0%"}
                  </div>
                </div>
              </div>
              <button
                className="btn btn-primary"
                style={{ width: "100%" }}
                onClick={() => openSubscribeModal(plan)}
                disabled={subscribing === plan._id}
              >
                {subscribing === plan._id ? "Subscribing..." : "Subscribe Now"}
              </button>
            </motion.div>
            </TiltCard>
          ))}
        </div>
      )}

      {/* Subscribe Modal */}
      {showModal && selectedPlan && (
        <div className="modal-overlay" onClick={() => !subscribing && setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Subscribe to {selectedPlan.title}</h3>
              <button className="modal-close" onClick={() => !subscribing && setShowModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div
                style={{
                  background: "#0f172a",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span style={{ color: "#94a3b8" }}>Plan Price</span>
                  <span style={{ color: "#fff", fontWeight: 700 }}>
                    {formatCurrency(selectedPlan.price)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span style={{ color: "#94a3b8" }}>Duration</span>
                  <span style={{ color: "#fff", fontWeight: 700 }}>
                    {selectedPlan.duration} days
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94a3b8" }}>Return Amount</span>
                  <span style={{ color: "#22c55e", fontWeight: 700 }}>
                    {formatCurrency(selectedPlan.returnAmount)}
                  </span>
                </div>
              </div>

              {subscribeError && (
                <div
                  style={{
                    color: "#fca5a5",
                    background: "#7f1d1d",
                    padding: "10px 14px",
                    borderRadius: 8,
                    fontSize: 13,
                    marginBottom: 16,
                  }}
                >
                  {subscribeError}
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <div className="form-label">Payment Method</div>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                  }}
                >
                  <button
                    className={`btn ${paymentMethod === "Wallet" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setPaymentMethod("Wallet")}
                    style={{ flex: 1 }}
                  >
                    Wallet Balance
                  </button>
                  <button
                    className={`btn ${paymentMethod === "Razorpay" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setPaymentMethod("Razorpay")}
                    style={{ flex: 1 }}
                  >
                    Razorpay
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => !subscribing && setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubscribe}
                disabled={subscribing === selectedPlan._id}
              >
                {subscribing === selectedPlan._id
                  ? "Processing..."
                  : paymentMethod === "Wallet"
                  ? `Pay ${formatCurrency(selectedPlan.price)}`
                  : "Pay with Razorpay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
