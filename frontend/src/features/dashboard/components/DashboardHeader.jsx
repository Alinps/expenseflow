import styles from "../styles/Dashboard.module.css";

function DashboardHeader({ user, monthName }) {
    return (
        <div className={styles.dashboardHeader}>
            <div>
                <h1>Welcome back, {user?.name || "User"}!</h1>

                <p>
                    Here's your financial overview for {monthName}.
                </p>
            </div>

            <div className={styles.dateBadge}>
                {monthName}
            </div>
        </div>
    );
}

export default DashboardHeader;