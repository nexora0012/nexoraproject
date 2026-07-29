import api from "../api/axios";

export interface ReferredUser {
  fullName: string;
  joinedAt: string;
  status: "Rewarded" | "Pending";
}

export interface ReferralSummary {
  success: boolean;
  referralCode: string;
  totalEarned: number;
  referredUsers: ReferredUser[];
}

export const getMyReferralSummary = async (): Promise<ReferralSummary> => {
  const res = await api.get("/referral/my-summary");
  return res.data;
};
