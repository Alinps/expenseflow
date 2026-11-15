import { NavLink } from "react-router-dom";

import {
    LayoutDashboard,
    ArrowLeftRight,
    Tags,
    Wallet,
    PiggyBank,
    X,
} from "lucide-react";

import styles from "./Sidebar.module.css";

const navigationItems = [
    {
        name: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        name: "Transactions",
        path: "/transactions",
        icon: ArrowLeftRight,
    },
    {
        name: "Categories",
        path: "/categories",
        icon: Tags,
    },
    {
        name: "Budgets",
        path: "/budgets",
        icon: Wallet,
    },
    {
        name: "Savings",
        path: "/savings",
        icon: PiggyBank,
    },
];

function Sidebar({ isOpen, onClose }) {
    return (
        <>
            {isOpen && (
                <div
                    className={styles.overlay}
                    onClick={onClose}
                />
            )}

            <aside
                className={`${styles.sidebar} ${
                    isOpen ? styles.open : ""
                }`}
            >
                <div className={styles.logo}>
                    <div className={styles.logoIcon}>
                        E
                    </div>

                    <span>ExpenseFlow</span>

                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Close navigation"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.menuSection}>
                    <p className={styles.menuLabel}>
                        MENU
                    </p>

                    <nav>
                        {navigationItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end
                                    onClick={onClose}
                                    className={({ isActive }) =>
                                        `${styles.navItem} ${
                                            isActive
                                                ? styles.active
                                                : ""
                                        }`
                                    }
                                >
                                    <Icon size={20} />

                                    <span>{item.name}</span>
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>

                <div className={styles.sidebarFooter}>
                    <p>Personal Finance Manager</p>
                    <span>ExpenseFlow v1.0</span>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;