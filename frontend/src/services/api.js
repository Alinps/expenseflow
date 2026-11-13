import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

let accessToken = null;

export function setAccessToken(token) {
    accessToken = token;
}

export function clearAccessToken() {
    accessToken = null;
}

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

// Attach access token to outgoing requests.
api.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Prevent multiple simultaneous refresh requests.
let refreshPromise = null;

api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status !== 401 ||
            !originalRequest ||
            originalRequest._retry ||
            originalRequest.url?.includes("/auth/login") ||
            originalRequest.url?.includes("/auth/register") ||
            originalRequest.url?.includes("/auth/refresh") ||
            originalRequest.url?.includes("/auth/logout")
        ) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            if (!refreshPromise) {
                refreshPromise = axios
                    .post(
                        `${BASE_URL}/auth/refresh`,
                        {},
                        { withCredentials: true }
                    )
                    .then((response) => {
                        const newToken = response.data.access_token;

                        if (!newToken) {
                            throw new Error("Access token missing");
                        }

                        setAccessToken(newToken);

                        return newToken;
                    })
                    .finally(() => {
                        refreshPromise = null;
                    });
            }

            const newToken = await refreshPromise;

            originalRequest.headers.Authorization =
                `Bearer ${newToken}`;

            return api(originalRequest);

        } catch (refreshError) {
            clearAccessToken();

            window.dispatchEvent(
                new Event("auth:session-expired")
            );

            return Promise.reject(refreshError);
        }
    }
);

export default api;