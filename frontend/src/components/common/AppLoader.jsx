import { Wallet, TrendingUp } from "lucide-react";
import styles from "./AppLoader.module.css";

function AppLoader() {
    return (
        <div className={styles.loaderContainer}>
            <div className={styles.loaderContent}>

                <div className={styles.logoWrapper}>
                    <div className={styles.logo}>
                        <Wallet size={30} strokeWidth={2.2} />
                    </div>

                    <div className={styles.trendIcon}>
                        <TrendingUp size={16} />
                    </div>
                </div>

                <h1 className={styles.brand}>
                    Expense<span>Flow</span>
                </h1>

                <p className={styles.tagline}>
                    Manage your money smarter.
                </p>

                <div className={styles.progressWrapper}>
                    <div className={styles.progressTrack}>
                        <div className={styles.progressBar} />
                    </div>

                    <p className={styles.loadingText}>
                        Preparing your financial dashboard
                    </p>
                </div>

                <div className={styles.footer}>
                    Securely managing your finances
                </div>

            </div>
        </div>
    );
}

export default AppLoader;