import { axiosInstance } from "../axios/axiosInstance";

export const superAdminService = {
    getDashboard: async () => {
        const res = await axiosInstance.get("/super-admin/dashboard");
        return res.data;
    },

    listSubAdmins: async () => {
        const res = await axiosInstance.get("/super-admin/sub-admins");
        return res.data;
    },

    createSubAdmin: async (payload) => {
        const res = await axiosInstance.post("/super-admin/sub-admins", payload);
        return res.data;
    },

    updateSubAdmin: async (profileId, payload) => {
        const res = await axiosInstance.put(
            `/super-admin/sub-admins/${encodeURIComponent(profileId)}`,
            payload,
        );
        return res.data;
    },

    deactivateSubAdmin: async (profileId) => {
        const res = await axiosInstance.delete(
            `/super-admin/sub-admins/${encodeURIComponent(profileId)}`,
        );
        return res.data;
    },
};
