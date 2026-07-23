import { Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import Users from "../pages/users/Users";
import Plans from "../pages/plans/Plans";
import Wallet from "../pages/wallet/Wallet";
import Settings from "../pages/settings/Settings";
import Announcements from "../pages/announcements/Announcements";
import AddAnnouncement from "../pages/announcements/AddAnnouncement";
import EditAnnouncement from "../pages/announcements/EditAnnouncement";

import AddPlan from "../pages/plans/AddPlan";
import EditPlan from "../pages/plans/EditPlan";

import CreditWallet from "../pages/wallet/CreditWallet";
import DebitWallet from "../pages/wallet/DebitWallet";
import Returns from '../pages/returns/Returns';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/users" element={<Users />} />

      <Route path="/plans" element={<Plans />} />
      <Route path="/plans/add" element={<AddPlan />} />
      <Route path="/plans/edit/:id" element={<EditPlan />} />

      <Route path="/wallet" element={<Wallet />} />
      <Route path="/wallet/credit" element={<CreditWallet />} />
      <Route path="/wallet/debit" element={<DebitWallet />} />

      <Route path="/announcements" element={<Announcements />} />
      <Route
        path="/announcements/add"
        element={<AddAnnouncement />}
      />
      <Route
        path="/announcements/edit"
        element={<EditAnnouncement />}
      />

      <Route path="/settings" element={<Settings />} />
      <Route path="/returns" element={<Returns />}/>
    </Routes>
  );
}