import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import authService from "../services/authService";
import {
    setAccessToken,
    clearAccessToken,
} from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);

    const [loading, setLoading] = useState(true);

    // Login
    const login = async (credentials) => {
        const tokenData = await authService.login(credentials);

        const newAccessToken = tokenData.access_token;

        setAccessToken(newAccessToken);

        if (!newAccessToken) {
            throw new Error("Access token was not returned by the server");
        }

        setAccessToken(newAccessToken);

        const userData = await authService.getCurrentUser(
            newAccessToken
        );

        setUser(userData);

        return userData;
    };

    // Register
    const register = async (userData) => {
        return await authService.register(userData);
    };

    // Logout
    const logout = async () => {
        try {
            await authService.logout();
            clearAccessToken();
        } finally {
            setAccessToken(null);
            setUser(null);
        }
    };

    // Initialize authentication when application loads.
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const tokenData = await authService.refresh();

                const newAccessToken = tokenData.access_token;

                if (!newAccessToken) {
                    throw new Error("Access token missing");
                }
            

                setAccessToken(newAccessToken);

                const userData = await authService.getCurrentUser(
                    newAccessToken
                );

                setUser(userData);

            } catch {
                setAccessToken(null);
                setUser(null);

            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);


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
}   , []);

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