import { useEffect, useState } from "react";

import AdminLayout from "../../layouts/AdminLayout";
import { getUsers } from "../../services/userService";

interface User {
  _id: string;
  fullName: string;
  email: string;
  mobile: string;
  walletBalance?: number;
  isActive: boolean;
  createdAt?: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getUsers();
      setUsers(response.users || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <AdminLayout>
      <div className="plans-page">
        <div className="plans-header">
          <div>
            <h1>User Management</h1>
            <p>View and manage all registered users.</p>
          </div>
        </div>

        {loading ? (
          <div className="plans-message">Loading users...</div>
        ) : error ? (
          <div className="plans-message">{error}</div>
        ) : users.length === 0 ? (
          <div className="plans-empty">
            <h3>No users found</h3>
            <p>Once people sign up in the app, they will appear here.</p>
          </div>
        ) : (
          <div className="plan-table-wrapper">
            <table className="plan-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Wallet Balance</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <strong>{user.fullName}</strong>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.mobile}</td>
                    <td>₹{Number(user.walletBalance || 0).toFixed(2)}</td>
                    <td>
                      <span
                        className={
                          user.isActive ? "status-badge active" : "status-badge inactive"
                        }
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}