import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

import styles from "./AppLayout.module.css";

function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const openSidebar = () => {
        setSidebarOpen(true);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    return (
        <div className={styles.appLayout}>
            <Sidebar
                isOpen={sidebarOpen}
                onClose={closeSidebar}
            />

            <div className={styles.mainArea}>
                <Navbar onMenuClick={openSidebar} />

                <main className={styles.content}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AppLayout;