import axios from "axios";
import { normalizeApiError } from "./apiError";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

// Store the access token in memory.
let accessToken = null;

// Prevent multiple simultaneous refresh requests.
let refreshPromise = null;

export function setApiAccessToken(token) {
    accessToken = token;
}

export function clearApiAccessToken() {
    accessToken = null;
}

// Request interceptor.
api.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(normalizeApiError(error))
);

// Refresh access token using the HttpOnly refresh cookie.
async function refreshAccessToken() {
    if (!refreshPromise) {
        refreshPromise = axios
            .post(
                `${BASE_URL}/auth/refresh`,
                {},
                { withCredentials: true }
            )
            .then((response) => {
                const token = response.data.access_token;

                if (!token) {
                    throw new Error("Access token missing from refresh response.");
                }

                setApiAccessToken(token);

                return token;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
}

function isAuthenticationEndpoint(url = "") {
    return (
        url.includes("/auth/login") ||
        url.includes("/auth/register") ||
        url.includes("/auth/refresh") ||
        url.includes("/auth/logout")
    );
}

// Response interceptor.
api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        // Handle expired access tokens.
        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry &&
            !isAuthenticationEndpoint(originalRequest.url)
        ) {
            originalRequest._retry = true;

            try {
                const newToken = await refreshAccessToken();

                originalRequest.headers =
                    originalRequest.headers || {};

                originalRequest.headers.Authorization =
                    `Bearer ${newToken}`;

                return api(originalRequest);
            } catch (refreshError) {
                clearApiAccessToken();

                return Promise.reject(
                    normalizeApiError({
                        response: {
                            status: 401,
                            data: {
                                detail: "Your session has expired. Please log in again.",
                                code: "SESSION_EXPIRED",
                            },
                        },
                        originalError: refreshError,
                    })
                );
            }
        }

        return Promise.reject(normalizeApiError(error));
    }
);

export default api;