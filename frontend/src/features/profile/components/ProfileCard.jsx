import styles from "../styles/Profile.module.css";

function ProfileCard({ profile }) {
    const displayName =
        profile.full_name ||
        profile.name ||
        profile.username ||
        "User";

    const initials = displayName
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className={styles.profileCard}>
            <div className={styles.avatar}>
                {initials}
            </div>

            <div className={styles.profileDetails}>
                <h2>{displayName}</h2>
                <p>{profile.email || "No email available"}</p>
            </div>
        </div>
    );
}

export default ProfileCard;