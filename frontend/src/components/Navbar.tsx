import Brand from "./Brand";
import { Icon, type IconName } from "./Icon";

export type Route =
    | "/login"
    | "/student/dashboard"
    | "/student/slots"
    | "/student/booking-confirmation"
    | "/student/bookings"
    | "/student/bookings/CS-2025-041"
    | "/student/profile";

type NavigationProps = {
    route: Route;
    navigate: (route: Route) => void;
};

type SidebarProps = NavigationProps & {
    mobileOpen: boolean;
    onClose: () => void;
};

const navItems: { label: string; path: Route; icon: IconName }[] = [
    { label: "Dashboard", path: "/student/dashboard", icon: "grid" },
    { label: "Available Slots", path: "/student/slots", icon: "calendar" },
    { label: "My Bookings", path: "/student/bookings", icon: "file" },
    { label: "Profile", path: "/student/profile", icon: "user" },
];

export function StudentSidebar({
    route,
    navigate,
    mobileOpen,
    onClose,
}: SidebarProps) {
    const isActive = (path: Route) =>
        path === "/student/bookings"
            ? route.includes("/student/bookings")
            : route === path ||
              (path === "/student/slots" &&
                  route === "/student/booking-confirmation");

    const goTo = (path: Route) => {
        navigate(path);
        onClose();
    };

    return (
        <>
            {mobileOpen && <div className="scrim" onClick={onClose} />}
            <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
                <div className="side-top">
                    <Brand dark />
                    <button
                        className="icon-button mobile-close"
                        onClick={onClose}
                        aria-label="Close menu"
                    >
                        <Icon name="close" />
                    </button>
                </div>
                <nav>
                    <span className="nav-label">Workspace</span>
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            className={`nav-item ${isActive(item.path) ? "active" : ""}`}
                            onClick={() => goTo(item.path)}
                        >
                            <Icon name={item.icon} />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="side-help">
                    <div className="help-icon">
                        <Icon name="info" size={18} />
                    </div>
                    <strong>Need assistance?</strong>
                    <p>Contact the NAS office for booking concerns.</p>
                    <button>View support details</button>
                </div>
                <div className="side-profile">
                    <div className="avatar">GP</div>
                    <div>
                        <strong>Group Pixel</strong>
                        <span>BSIT 3A</span>
                    </div>
                    <button
                        aria-label="Log out"
                        onClick={() => navigate("/login")}
                    >
                        <Icon name="logout" size={18} />
                    </button>
                </div>
            </aside>
        </>
    );
}

export function StudentTopbar({ onOpen }: { onOpen: () => void }) {
    return (
        <header className="topbar">
            <button
                className="icon-button menu-button"
                onClick={onOpen}
                aria-label="Open menu"
            >
                <Icon name="menu" />
            </button>
            <div className="top-context">
                <span>Student Group Workspace</span>
                <strong>Academic Year 2024–2025</strong>
            </div>
            <div className="top-actions">
                <button className="notification" aria-label="Notifications">
                    <Icon name="bell" />
                    <i />
                </button>
                <div className="top-divider" />
                <div className="top-profile">
                    <div className="avatar">GP</div>
                    <div>
                        <strong>Group Pixel</strong>
                        <span>BSIT 3A</span>
                    </div>
                    <Icon name="chevron" size={16} />
                </div>
            </div>
        </header>
    );
}
