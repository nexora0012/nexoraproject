import { useEffect, useState } from 'react';

import AdminLayout from '../../layouts/AdminLayout';
import {
  getReferralSettings,
  updateReferralSettings,
  getAllReferrals,
} from '../../services/referralService';

export default function ReferralSettingsPage() {
  const [enabled, setEnabled] = useState(true);
  const [rewardType, setRewardType] = useState('flat');
  const [rewardValue, setRewardValue] = useState(50);
  const [minPurchaseAmount, setMinPurchaseAmount] = useState(0);
  const [newUserBonus, setNewUserBonus] = useState(0);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [settingsRes, referralsRes] = await Promise.all([
        getReferralSettings(),
        getAllReferrals(),
      ]);

      const s = settingsRes.data;
      setEnabled(s.enabled);
      setRewardType(s.rewardType);
      setRewardValue(s.rewardValue);
      setMinPurchaseAmount(s.minPurchaseAmount);
      setNewUserBonus(s.newUserBonus);

      setReferrals(referralsRes.referrals || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateReferralSettings({
        enabled,
        rewardType,
        rewardValue: Number(rewardValue),
        minPurchaseAmount: Number(minPurchaseAmount),
        newUserBonus: Number(newUserBonus),
      });
      alert('Referral settings updated successfully');
    } catch (error) {
      console.error(error);
      alert('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="plans-message">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="plans-page">
        <div className="plans-header">
          <div>
            <h1>Refer &amp; Earn</h1>
            <p>Configure referral rewards and view all referrals.</p>
          </div>
        </div>

        <div className="plan-table-wrapper" style={{ padding: 20, marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 14 }}>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              style={{ marginRight: 8 }}
            />
            Enable Referral Program
          </label>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>Reward Type</label>
            <select
              value={rewardType}
              onChange={(e) => setRewardType(e.target.value)}
              style={{ padding: 8, borderRadius: 6, width: '100%', maxWidth: 300 }}
            >
              <option value="flat">Flat Amount (₹)</option>
              <option value="percentage">Percentage of Purchase (%)</option>
            </select>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>
              Reward Value ({rewardType === 'flat' ? '₹' : '%'})
            </label>
            <input
              type="number"
              value={rewardValue}
              onChange={(e) => setRewardValue(Number(e.target.value))}
              style={{ padding: 8, borderRadius: 6, width: '100%', maxWidth: 300 }}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>
              Minimum Purchase Amount (₹) to qualify
            </label>
            <input
              type="number"
              value={minPurchaseAmount}
              onChange={(e) => setMinPurchaseAmount(Number(e.target.value))}
              style={{ padding: 8, borderRadius: 6, width: '100%', maxWidth: 300 }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>
              New User Welcome Bonus (₹, optional)
            </label>
            <input
              type="number"
              value={newUserBonus}
              onChange={(e) => setNewUserBonus(Number(e.target.value))}
              style={{ padding: 8, borderRadius: 6, width: '100%', maxWidth: 300 }}
            />
          </div>

          <button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        <h2 style={{ marginBottom: 12 }}>All Referrals</h2>

        {referrals.length === 0 ? (
          <div className="plans-empty">
            <h3>No referrals yet</h3>
          </div>
        ) : (
          <div className="plan-table-wrapper">
            <table className="plan-table">
              <thead>
                <tr>
                  <th>New User</th>
                  <th>Referred By</th>
                  <th>Joined</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <strong>{r.fullName}</strong>
                      <br />
                      {r.email}
                    </td>
                    <td>
                      {r.referredBy?.fullName}
                      <br />
                      {r.referredBy?.email}
                    </td>
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span
                        className={
                          r.referralRewardGiven
                            ? 'status-badge active'
                            : 'status-badge inactive'
                        }
                      >
                        {r.referralRewardGiven ? 'Rewarded' : 'Pending'}
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