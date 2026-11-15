import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, ChevronDown } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import styles from "./ProfileMenu.module.css";

function ProfileMenu() {
    const [isOpen, setIsOpen] = useState(false);

    const { user, logout } = useAuth();

    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            navigate("/login", { replace: true });
        }
    };

    const userName = user?.name || "User";

    const initial = userName.charAt(0).toUpperCase();

    return (
        <div className={styles.container}>
            <button
                className={styles.profileButton}
                onClick={() => setIsOpen((previous) => !previous)}
                aria-expanded={isOpen}
            >
                <div className={styles.avatar}>
                    {initial}
                </div>

                <div className={styles.userInfo}>
                    <span className={styles.userName}>
                        {userName}
                    </span>

                    <span className={styles.userEmail}>
                        {user?.email || ""}
                    </span>
                </div>

                <ChevronDown size={16} />
            </button>

            {isOpen && (
                <>
                    <div
                        className={styles.backdrop}
                        onClick={() => setIsOpen(false)}
                    />

                    <div className={styles.dropdown}>
                        <div className={styles.dropdownHeader}>
                            <div className={styles.avatar}>
                                {initial}
                            </div>

                            <div>
                                <strong>{userName}</strong>

                                <span>{user?.email}</span>
                            </div>
                        </div>

                        <div className={styles.divider} />

                        <button
                            className={styles.dropdownItem}
                            onClick={() => {
                                setIsOpen(false);
                                navigate("/profile");
                            }}
                        >
                            <User size={17} />
                            <span>My Profile</span>
                        </button>

                        <button
                            className={`${styles.dropdownItem} ${styles.logout}`}
                            onClick={handleLogout}
                        >
                            <LogOut size={17} />
                            <span>Logout</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default ProfileMenu;