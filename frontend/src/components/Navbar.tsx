import { getInitials, useStudentData } from "../context/StudentDataContext";
import Brand from "./Brand";
import { Icon, type IconName } from "./Icon";

export type Route =
    | "/"
    | "/login"
    | "/student/dashboard"
    | "/student/slots"
    | "/student/booking-confirmation"
    | "/student/bookings"
    | "/student/bookings/:bookingId"
    | "/student/profile"
    | "/student/support";

type NavigationProps = {
    route: Route | string;
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
    const { profile } = useStudentData();
    const groupName = profile.groupName.trim() || "Student group";
    const groupSubtitle = [profile.program, profile.section].filter(Boolean).join(" ") || "Group workspace";
    const isActive = (path: Route) =>
        path === "/student/bookings"
            ? route.includes("/student/bookings")
            : route === path ||
              (path === "/student/slots" && route === "/student/booking-confirmation");

    const goTo = (path: Route) => {
        navigate(path);
        onClose();
    };

    return (
        <>
            {mobileOpen && <button className="scrim" type="button" aria-label="Close navigation" onClick={onClose} />}
            <aside className={"sidebar " + (mobileOpen ? "sidebar-open" : "")}>
                <div className="side-top">
                    <Brand dark />
                    <button className="icon-button mobile-close" type="button" onClick={onClose} aria-label="Close menu">
                        <Icon name="close" />
                    </button>
                </div>
                <nav aria-label="Student navigation">
                    <span className="nav-label">Workspace</span>
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            type="button"
                            className={"nav-item " + (isActive(item.path) ? "active" : "")}
                            aria-current={isActive(item.path) ? "page" : undefined}
                            onClick={() => goTo(item.path)}
                        >
                            <Icon name={item.icon} />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="side-help">
                    <div className="help-icon"><Icon name="info" size={18} /></div>
                    <strong>Need assistance?</strong>
                    <p>Get help with booking concerns, schedule changes, or your group account.</p>
                    <button type="button" onClick={() => goTo("/student/support")}>View support details <Icon name="arrow" size={13} /></button>
                </div>
                <div className="side-profile">
                    <div className="avatar">{getInitials(groupName)}</div>
                    <div><strong>{groupName}</strong><span>{groupSubtitle}</span></div>
                    <button type="button" aria-label="Log out" title="Return to login" onClick={() => navigate("/")}>
                        <Icon name="logout" size={18} />
                    </button>
                </div>
            </aside>
        </>
    );
}

export function StudentTopbar({
    onOpen,
    navigate,
}: {
    onOpen: () => void;
    navigate: (route: Route) => void;
}) {
    const { profile } = useStudentData();
    const groupName = profile.groupName.trim() || "Student group";
    const groupSubtitle = [profile.program, profile.section].filter(Boolean).join(" ") || "View profile";
    return (
        <header className="topbar">
            <button className="icon-button menu-button" type="button" onClick={onOpen} aria-label="Open menu">
                <Icon name="menu" />
            </button>
            <div className="top-context">
                <span>Student Group Workspace</span>
                <strong>Consultation booking and queue</strong>
            </div>
            <div className="top-actions">
                <button className="notification" type="button" aria-label="View support details" onClick={() => navigate("/student/support")}>
                    <Icon name="bell" />
                </button>
                <div className="top-divider" />
                <button className="top-profile top-profile-button" type="button" onClick={() => navigate("/student/profile")} aria-label="Open group profile">
                    <div className="avatar">{getInitials(groupName)}</div>
                    <div><strong>{groupName}</strong><span>{groupSubtitle}</span></div>
                    <Icon name="chevron" size={16} />
                </button>
            </div>
        </header>
    );
}
