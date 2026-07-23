import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import { searchTransactions } from "../../services/walletService";

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

export default function Wallet() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");

  const loadTransactions = async () => {
    try {
      setLoading(true);

      const response = await searchTransactions(search, type);

      setTransactions(response.transactions || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [search, type]);

  return (
    <AdminLayout>
      <h1>Wallet Transactions</h1>

      <div
        style={{
          display: "flex",
          gap: "10px",
          margin: "20px 0",
        }}
      >
        <input
          placeholder="Search User"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option>All</option>
          <option>Credit</option>
          <option>Debit</option>
        </select>
      </div>

      <div style={{ margin: "20px 0" }}>
        <Link to="/wallet/credit">
          <button>Credit Wallet</button>
        </Link>

        <Link to="/wallet/debit">
          <button style={{ marginLeft: "10px" }}>
            Debit Wallet
          </button>
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="plan-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((tx) => (
              <tr key={tx._id}>
                <td>{tx.user?.name || "-"}</td>
                <td>{tx.user?.email || "-"}</td>
                <td>{tx.type}</td>
                <td>₹{tx.amount}</td>
                <td>
                  {new Date(tx.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}