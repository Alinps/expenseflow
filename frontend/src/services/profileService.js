import api from "./api";

const profileService = {
    async getProfile() {
        const response = await api.get("/users/me");
        return response.data;
    },
};

export default profileService;