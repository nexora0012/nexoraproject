import { useEffect, useState } from "react";
import { getPaymentHistory } from "../../services/paymentService";
import type { Payment } from "../../services/paymentService";

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setError("");
      const res = await getPaymentHistory();
      if (res.success) {
        setPayments(res.payments || []);
      }
    } catch (err: any) {
      setError("Unable to load payment history.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount?: number) =>
    `₹${Number(amount || 0).toFixed(2)}`;

  const formatDate = (value?: string) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "Success":
        return "status-credited";
      case "Pending":
        return "status-pending";
      case "Failed":
        return "status-failed";
      case "Refunded":
        return "status-processing";
      case "Created":
        return "status-pending";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        Loading payment history...
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <h2 className="empty-state-title">Unable to load payments</h2>
        <p className="empty-state-text">{error}</p>
        <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={loadPayments}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 style={{ color: "#fff", margin: 0, fontSize: 24 }}>Payment History</h1>
          <p style={{ color: "#94a3b8", marginTop: 4 }}>
            View all your payments and transactions
          </p>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💳</div>
          <h2 className="empty-state-title">No payments yet</h2>
          <p className="empty-state-text">
            Your payment history will appear here after you subscribe to a plan.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Plan</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id}>
                  <td>
                    <strong style={{ color: "#fff" }}>
                      {payment.plan?.title || "N/A"}
                    </strong>
                  </td>
                  <td style={{ fontWeight: 700, color: "#fff" }}>
                    {formatCurrency(payment.amount)}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${
                        payment.method === "Wallet" ? "status-active" : "status-processing"
                      }`}
                    >
                      {payment.method}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadge(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td style={{ color: "#94a3b8", fontSize: 13 }}>
                    {formatDate(payment.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
