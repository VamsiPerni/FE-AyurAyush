import { axiosInstance } from "../axios/axiosInstance";

export const otpService = {
  sendOtp: async (email) => {
    const response = await axiosInstance.post("/otps", { email });
    return response.data;
  },
};
