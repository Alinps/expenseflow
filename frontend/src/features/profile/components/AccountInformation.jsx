import styles from "../styles/Profile.module.css";

function AccountInformation({ profile }) {
    const formatDate = (date) => {
        if (!date) return "Not available";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    return (
        <div className={styles.accountCard}>
            <h3>Account Information</h3>

            <div className={styles.infoRow}>
                <span>User ID</span>
                <strong>{profile.id || "Not available"}</strong>
            </div>

            <div className={styles.infoRow}>
                <span>Email</span>
                <strong>{profile.email || "Not available"}</strong>
            </div>

            <div className={styles.infoRow}>
                <span>Account Created</span>
                <strong>
                    {formatDate(profile.created_at)}
                </strong>
            </div>

            <div className={styles.infoRow}>
                <span>Account Status</span>
                <strong>
                    {profile.is_active === undefined
                        ? "Not available"
                        : profile.is_active
                            ? "Active"
                            : "Inactive"}
                </strong>
            </div>
        </div>
    );
}

export default AccountInformation;