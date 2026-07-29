import api from "../api/axios";

export interface PaymentProof {
  _id: string;
  screenshot: string;
  accountDetails: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export const getMyProofs = async (): Promise<{
  success: boolean;
  proofs: PaymentProof[];
}> => {
  const res = await api.get("/payment-proof/my-proofs");
  return res.data;
};

export const deletePaymentProof = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  const res = await api.delete(`/payment-proof/${id}`);
  return res.data;
};

export const getPendingProofCount = async (): Promise<{
  success: boolean;
  count: number;
}> => {
  const res = await api.get("/payment-proof/pending-count");
  return res.data;
};

export const submitPaymentProof = async (data: {
  screenshot: File;
  accountDetails: string;
}): Promise<{
  success: boolean;
  message: string;
}> => {
  const formData = new FormData();
  formData.append("screenshot", data.screenshot);
  formData.append("accountDetails", data.accountDetails);

  const res = await api.post("/payment-proof", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};


