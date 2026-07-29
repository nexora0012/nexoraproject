import api from "../api/axios";

export interface UsdtPaymentData {
  _id?: string;
  image?: string;
  description?: string;
}

export const getUsdtPayment = async (): Promise<{
  success: boolean;
  usdtPayment?: UsdtPaymentData;
  message?: string;
}> => {
  const res = await api.get("/usdt-payment");
  const body = res.data;
  return {
    success: body.success,
    usdtPayment: body.data,
    message: body.message,
  };
};
