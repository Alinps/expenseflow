import { useEffect, useState } from "react";
import { LogOut, UserRound } from "lucide-react";

import profileService from "../../../services/profileService";
import { useAuth } from "../../../context/AuthContext";

import ProfileCard from "../components/ProfileCard";
import AccountInformation from "../components/AccountInformation";

import styles from "../styles/Profile.module.css";

import { useToast } from "../../../hooks/useToast";





function ProfilePage() {
    const { logout } = useAuth();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { showToast } = useToast();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await profileService.getProfile();

                setProfile(data);
            } catch (err) {
                setError(
                    err.response?.data?.detail ||
                    "Unable to load profile information."
                );
                showToast(err.message, "error");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className={styles.loading}>
                Loading profile...
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.error}>
                {error}
            </div>
        );
    }

    if (!profile) return null;

    

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>My Profile</h1>
                    <p>Manage your account information.</p>
                </div>

                <UserRound size={28} />
            </div>

            <ProfileCard profile={profile} />

            <AccountInformation profile={profile} />

            <div className={styles.actions}>
                <button
                    className={styles.logoutButton}
                    onClick={logout}
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </div>
    );
}

export default ProfilePage;