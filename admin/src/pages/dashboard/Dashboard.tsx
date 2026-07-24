import { useEffect, useState } from "react";

import AdminLayout from "../../layouts/AdminLayout";
import StatCard from "../../components/cards/StatCard";

import { getDashboard } from "../../services/dashboardService";

export default function Dashboard() {

    const [stats, setStats] = useState<any>(null);

    useEffect(() => {

        loadDashboard();

    }, []);

    async function loadDashboard() {
        try {
            const data = await getDashboard();
            setStats(data);
        } catch (err) {
            console.log(err);
            setStats({
                totalUsers: 0,
                totalPlans: 0,
                walletBalance: 0,
                pendingWithdrawals: 0,
                recentActivity: [],
                latestUsers: [],
            });
        }
    }

    if (!stats)
        return <AdminLayout>Loading...</AdminLayout>;

    return (

        <AdminLayout>

            <h1>Dashboard</h1>

            <div className="stats-grid">

                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    color="#2563EB"
                />

                <StatCard
                    title="Plans"
                    value={stats.totalPlans}
                    color="#16A34A"
                />

                <StatCard
                    title="Wallet"
                    value={"₹" + stats.walletBalance}
                    color="#EA580C"
                />

                <StatCard
                    title="Withdraw"
                    value={stats.pendingWithdrawals}
                    color="#DC2626"
                />

            </div>

            <div className="dashboard-row">

                <div className="dashboard-box">

                    <h3>Recent Activity</h3>

                    <ul>

                        {stats.recentActivity.map(
                            (item: string, index: number) => (

                                <li key={index}>
                                    {item}
                                </li>

                            )
                        )}

                    </ul>

                </div>

                <div className="dashboard-box">

                    <h3>Latest Users</h3>

                    <ul>

                        {stats.latestUsers.map(
                            (user: any, index: number) => (

                                <li key={index}>
                                    {user.name}
                                </li>

                            )
                        )}

                    </ul>

                </div>

            </div>

        </AdminLayout>

    );
}