import { useLocation } from "react-router-dom";
import { Menu, Bell } from "lucide-react";

import ProfileMenu from "./ProfileMenu";

import styles from "./Navbar.module.css";

const pageTitles = {
    "/dashboard": "Dashboard",
    "/transactions": "Transactions",
    "/categories": "Categories",
    "/budgets": "Budgets",
    "/savings": "Savings",
};

function Navbar({ onMenuClick }) {
    const location = useLocation();

    const pageTitle =
        pageTitles[location.pathname] || "ExpenseFlow";

    return (
        <header className={styles.navbar}>
            <div className={styles.leftSection}>
                <button
                    className={styles.menuButton}
                    onClick={onMenuClick}
                    aria-label="Open navigation"
                >
                    <Menu size={22} />
                </button>

                <h2>{pageTitle}</h2>
            </div>

            <div className={styles.rightSection}>
                <button
                    className={styles.notificationButton}
                    aria-label="Notifications"
                    title="Notifications"
                >
                    <Bell size={20} />
                </button>

                <ProfileMenu />
            </div>
        </header>
    );
}

export default Navbar;