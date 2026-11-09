import { useEffect, useRef, useState } from "react";
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
    const { profile, logout } = useStudentData();
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

    const handleLogout = () => {
        logout();
        navigate("/login");
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
                    <button type="button" aria-label="Log out" title="Log out" onClick={handleLogout}>
                        <Icon name="logout" size={18} />
                    </button>
                </div>
            </aside>
        </>
    );
}

const sampleNotifications = [
    {
        id: "notif-1",
        title: "Session Rescheduled",
        message: "Your instructor has paused the consultation session. Your booking is moved to 2:30 PM.",
        time: "10 mins ago",
        unread: true,
    },
    {
        id: "notif-2",
        title: "Queue Notification",
        message: "Consultation queue is now active. Please be prepared when your reference number is called.",
        time: "1 hour ago",
        unread: false,
    },
];

export function StudentTopbar({
    onOpen,
    navigate: _navigate,
}: {
    onOpen: () => void;
    navigate: (route: Route) => void;
}) {
    const { profile } = useStudentData();
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setNotificationsOpen(false);
            }
        }
        if (notificationsOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [notificationsOpen]);

    const groupName = profile.groupName.trim() || "Student group";
    const groupSubtitle = [profile.program, profile.section].filter(Boolean).join(" ") || "Student group";

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
                <div className="notification-wrapper" ref={notifRef}>
                    <button
                        className={"notification " + (notificationsOpen ? "active" : "")}
                        type="button"
                        aria-label="View notifications"
                        aria-expanded={notificationsOpen}
                        onClick={() => setNotificationsOpen((prev) => !prev)}
                    >
                        <Icon name="bell" />
                        <span className="notif-dot" />
                    </button>
                    {notificationsOpen && (
                        <div className="notification-popup" role="dialog" aria-label="Notifications">
                            <div className="notification-header">
                                <strong>Notifications</strong>
                                <span className="notification-badge">1 unread</span>
                            </div>
                            <div className="notification-list">
                                {sampleNotifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={"notification-item " + (notif.unread ? "unread" : "")}
                                    >
                                        <div className="notification-item-dot" />
                                        <div className="notification-item-content">
                                            <div className="notification-item-header">
                                                <strong>{notif.title}</strong>
                                                <small>{notif.time}</small>
                                            </div>
                                            <p>{notif.message}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="notification-footer">
                                <button type="button" onClick={() => setNotificationsOpen(false)}>
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="top-divider" />
                <div className="top-profile">
                    <div className="avatar">{getInitials(groupName)}</div>
                    <div><strong>{groupName}</strong><span>{groupSubtitle}</span></div>
                </div>
            </div>
        </header>
    );
}
