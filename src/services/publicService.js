import { axiosInstance } from "../axios/axiosInstance";

export const publicService = {
    getPublicDoctors: async () => {
        try {
            const res = await axiosInstance.get("/public/doctors");
            return { isSuccess: true, data: res.data.data };
        } catch (error) {
            return {
                isSuccess: false,
                message: error.response?.data?.message || "Something went wrong",
            };
        }
    },
};
