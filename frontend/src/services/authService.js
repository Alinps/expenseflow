import api from "./api";

const authService = {
    async register(userData) {
        const response = await api.post(
            "/auth/register",
            userData
        );

        return response.data;
    },

    async login(credentials) {
        const response = await api.post(
            "/auth/login",
            credentials
        );

        return response.data;
    },

    async refresh() {
        const response = await api.post(
            "/auth/refresh"
        );

        return response.data;
    },

    async logout() {
        const response = await api.post(
            "/auth/logout"
        );

        return response.data;
    },

    async getCurrentUser(accessToken) {
        const response = await api.get(
            "/users/me",
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        return response.data;
    },
};

export default authService;