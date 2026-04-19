import { axiosInstance } from "../axios/axiosInstance";

export const superAdminService = {
    getDashboard: async () => {
        try {
            const res = await axiosInstance.get("/super-admin/dashboard");
            return { isSuccess: true, data: res.data.data };
        } catch (error) {
            return { isSuccess: false, message: error.response?.data?.message || "Something went wrong" };
        }
    },

    listSubAdmins: async () => {
        try {
            const res = await axiosInstance.get("/super-admin/sub-admins");
            return { isSuccess: true, data: res.data.data };
        } catch (error) {
            return { isSuccess: false, message: error.response?.data?.message || "Something went wrong" };
        }
    },

    createSubAdmin: async (payload) => {
        try {
            const res = await axiosInstance.post("/super-admin/sub-admins", payload);
            return { isSuccess: true, data: res.data.data };
        } catch (error) {
            return { isSuccess: false, message: error.response?.data?.message || "Something went wrong" };
        }
    },

    updateSubAdmin: async (profileId, payload) => {
        try {
            const res = await axiosInstance.put(
                `/super-admin/sub-admins/${encodeURIComponent(profileId)}`,
                payload,
            );
            return { isSuccess: true, data: res.data.data };
        } catch (error) {
            return { isSuccess: false, message: error.response?.data?.message || "Something went wrong" };
        }
    },

    deactivateSubAdmin: async (profileId) => {
        try {
            const res = await axiosInstance.delete(
                `/super-admin/sub-admins/${encodeURIComponent(profileId)}`,
            );
            return { isSuccess: true, data: res.data.data };
        } catch (error) {
            return { isSuccess: false, message: error.response?.data?.message || "Something went wrong" };
        }
    },
};
