import { useEffect, useState } from "react";

import AdminLayout from "../../layouts/AdminLayout";
import { debitWallet } from "../../services/walletService";
import { getUsers } from "../../services/userService";

interface User {
  _id: string;
  fullName: string;
  email: string;
}

export default function DebitWallet() {
  const [users, setUsers] = useState<User[]>([]);
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const res = await getUsers();
      setUsers(res.users);
    } catch (error) {
      console.error(error);
    }
  }

  const submit = async () => {
    if (!userId) {
      alert("Please select a user");
      return;
    }

    if (amount <= 0) {
      alert("Enter a valid amount");
      return;
    }

    try {
      await debitWallet(userId, amount);

      alert("Wallet Debited Successfully");

      setUserId("");
      setAmount(0);
    } catch (error) {
      console.error(error);
      alert("Unable to debit wallet");
    }
  };

  return (
    <AdminLayout>
      <h1>Debit Wallet</h1>

      <select
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      >
        <option value="">Select User</option>

        {users.map((user) => (
          <option
            key={user._id}
            value={user._id}
          >
            {user.fullName} ({user.email})
          </option>
        ))}
      </select>

      <br />
      <br />

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />

      <br />
      <br />

      <button onClick={submit}>
        Debit Wallet
      </button>
    </AdminLayout>
  );
}