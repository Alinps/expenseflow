import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import authService from "../services/authService";

import {
    setAccessToken as setApiAccessToken,
    clearAccessToken,
} from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);

    const [accessToken, setAccessToken] = useState(null);

    const [loading, setLoading] = useState(true);


    // LOGIN
    const login = async (credentials) => {

        try {

            const tokenData = await authService.login(credentials);

            const newAccessToken = tokenData.access_token;

            if (!newAccessToken) {
                throw new Error("Access token was not returned by the server");
            }

            // Store token in Axios service
            setApiAccessToken(newAccessToken);

            // Update React state
            setAccessToken(newAccessToken);

            // Fetch authenticated user
            const userData = await authService.getCurrentUser(
                newAccessToken
            );

            setUser(userData);

            return userData;

        } catch (error) {

            console.error("Login failed:", error);

            clearAccessToken();

            setAccessToken(null);

            setUser(null);

            throw error;
        }
    };


    // REGISTER
    const register = async (userData) => {

        return await authService.register(userData);

    };


    // LOGOUT
    const logout = async () => {

        try {

            await authService.logout();

        } finally {

            clearAccessToken();

            setAccessToken(null);

            setUser(null);
        }
    };


    // INITIALIZE AUTHENTICATION
    useEffect(() => {

        const initializeAuth = async () => {

            try {

                const tokenData = await authService.refresh();

                const newAccessToken = tokenData.access_token;

                if (!newAccessToken) {
                    throw new Error("Access token missing");
                }

                setApiAccessToken(newAccessToken);

                setAccessToken(newAccessToken);

                const userData = await authService.getCurrentUser(
                    newAccessToken
                );

                setUser(userData);

            } catch (error) {

                console.error("Authentication initialization failed:", error);

                clearAccessToken();

                setAccessToken(null);

                setUser(null);

            } finally {

                setLoading(false);
            }
        };

        initializeAuth();

    }, []);


    // HANDLE SESSION EXPIRATION
    useEffect(() => {

        const handleSessionExpired = () => {

            clearAccessToken();

            setAccessToken(null);

            setUser(null);
        };

        window.addEventListener(
            "auth:session-expired",
            handleSessionExpired
        );

        return () => {

            window.removeEventListener(
                "auth:session-expired",
                handleSessionExpired
            );
        };

    }, []);


    const value = {

        user,

        accessToken,

        loading,

        isAuthenticated: Boolean(user && accessToken),

        login,

        register,

        logout,

    };


    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {

    const context = useContext(AuthContext);

    if (!context) {

        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}