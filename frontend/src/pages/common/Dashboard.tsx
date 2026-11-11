import { useMemo } from "react";
import { useNavigate } from "react-router";
import { Icon } from "../../components/Icon.tsx";
import {
    formatDate,
    formatTime,
    getInitials,
    useStudentData,
    type BookingStatus,
} from "../../context/StudentDataContext.tsx";

function StatusBadge({ status }: { status: BookingStatus }) {
    return <span className={"status status-" + status.toLowerCase()}><i />{status}</span>;
}

export default function Dashboard() {
    const navigate = useNavigate();
    const { bookings, slots, profile, getSlot } = useStudentData();

    const activeBookings = bookings.filter((booking) => booking.status === "Pending" || booking.status === "Approved");
    const completed = bookings.filter((booking) => booking.status === "Completed").length;
    const upcoming = useMemo(() => activeBookings
        .map((booking) => ({ booking, slot: getSlot(booking.slotId) }))
        .filter((item) => item.slot && new Date(item.slot.date + "T" + item.slot.startTime + ":00").getTime() > Date.now())
        .sort((a, b) => {
            const left = String(a.slot?.date ?? "") + String(a.slot?.startTime ?? "");
            const right = String(b.slot?.date ?? "") + String(b.slot?.startTime ?? "");
            return left.localeCompare(right);
        })[0],
        [bookings, slots]);

    const availableCount = slots.filter((slot) =>
        new Date(slot.date + "T" + slot.startTime + ":00").getTime() > Date.now()
    ).length;
    const displayName = profile.groupName.trim() || "Your group";
    const today = new Date().toLocaleDateString("en-PH", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });
    const recent = [...bookings].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3);

    return (
        <main className="student-page dashboard-page">
            <div className="page-header">
                <div>
                    <span className="eyebrow">{today}</span>
                    <h1>Good day, {displayName}</h1>
                    <p>Here’s a quick look at your group’s consultation activity and next steps.</p>
                </div>
                <button className="primary-button" type="button" onClick={() => navigate("/student/slots")}>
                    <Icon name="calendar" size={18} />
                    Book a consultation
                </button>
            </div>

            <section className="stats-grid" aria-label="Booking summary">
                {[
                    { label: "Total bookings", value: String(bookings.length).padStart(2, "0"), note: "All requests in this workspace", icon: "file" as const, tone: "blue" },
                    { label: "Pending review", value: String(bookings.filter((booking) => booking.status === "Pending").length).padStart(2, "0"), note: "Awaiting a decision", icon: "clock" as const, tone: "amber" },
                    { label: "Approved", value: String(bookings.filter((booking) => booking.status === "Approved").length).padStart(2, "0"), note: "Upcoming consultations", icon: "check" as const, tone: "green" },
                    { label: "Completed", value: String(completed).padStart(2, "0"), note: "Marked as completed", icon: "trend" as const, tone: "violet" },
                ].map((stat) => (
                    <article className="stat-card" key={stat.label}>
                        <div className={"stat-icon " + stat.tone}><Icon name={stat.icon} /></div>
                        <div>
                            <span>{stat.label}</span>
                            <strong>{stat.value}</strong>
                            <small>{stat.note}</small>
                        </div>
                    </article>
                ))}
            </section>

            <section className="dashboard-grid">
                <article className="panel upcoming-panel">
                    <div className="panel-heading">
                        <div>
                            <span className="eyebrow">Next consultation</span>
                            <h2>{upcoming?.slot ? formatDate(upcoming.slot.date) : "No upcoming booking"}</h2>
                        </div>
                        {upcoming && <StatusBadge status={upcoming.booking.status} />}
                    </div>

                    {upcoming?.slot ? (
                        <>
                            <div className="schedule-block">
                                <div className="date-tile">
                                    <span>{new Date(upcoming.slot.date + "T00:00:00").toLocaleDateString("en-PH", { month: "short" }).toUpperCase()}</span>
                                    <strong>{new Date(upcoming.slot.date + "T00:00:00").getDate()}</strong>
                                    <small>{new Date(upcoming.slot.date + "T00:00:00").toLocaleDateString("en-PH", { weekday: "short" }).toUpperCase()}</small>
                                </div>
                                <div className="schedule-info">
                                    <h3>{upcoming.slot.topic}</h3>
                                    <p><Icon name="clock" size={16} />{formatTime(upcoming.slot.startTime)} – {formatTime(upcoming.slot.endTime)}</p>
                                    <p><Icon name="user" size={16} />{upcoming.slot.instructor}</p>
                                    <p><Icon name="grid" size={16} />{upcoming.slot.location}</p>
                                </div>
                            </div>
                            <div className="queue-strip dashboard-queue-strip">
                                <div><span>Booking reference</span><strong className="dashboard-reference">{upcoming.booking.reference}</strong></div>
                                <div><span>Current status</span><strong>{upcoming.booking.status}</strong></div>
                            </div>
                            <div className="panel-footer">
                                <span><Icon name="info" size={16} />Queue details appear when the facilitator starts a session.</span>
                                <button className="text-button" type="button" onClick={() => navigate("/student/bookings/" + upcoming.booking.reference)}>View details <Icon name="arrow" size={16} /></button>
                            </div>
                        </>
                    ) : (
                        <div className="empty-state compact-empty">
                            <div className="empty-state-icon"><Icon name="calendar" size={23} /></div>
                            <h3>Nothing scheduled yet</h3>
                            <p>Browse available consultation times and book a slot for your group.</p>
                            <button className="primary-button" type="button" onClick={() => navigate("/student/slots")}>View available slots <Icon name="arrow" size={16} /></button>
                        </div>
                    )}
                </article>

                <article className="panel activity-panel">
                    <div className="panel-heading">
                        <div><span className="eyebrow">Booking updates</span><h2>Recent activity</h2></div>
                        <button className="text-button" type="button" onClick={() => navigate("/student/bookings")}>View all</button>
                    </div>
                    <div className="activity-list">
                        {recent.length > 0 ? recent.map((booking) => {
                            const isCompleted = booking.status === "Completed";
                            const isCancelled = booking.status === "Cancelled" || booking.status === "Rejected";
                            const title = booking.status === "Pending"
                                ? "Booking submitted"
                                : booking.status === "Approved"
                                    ? "Booking approved"
                                    : booking.status === "Completed"
                                        ? "Consultation completed"
                                        : booking.status === "Cancelled"
                                            ? "Booking cancelled"
                                            : "Booking rejected";
                            return (
                                <div className="activity-item" key={booking.reference}>
                                    <div className={"activity-dot " + (isCompleted ? "green" : isCancelled ? "gray" : "blue")}><Icon name={isCancelled ? "info" : isCompleted || booking.status === "Approved" ? "check" : "file"} size={16} /></div>
                                    <div>
                                        <strong>{title}</strong>
                                        <p>{booking.reference} · {booking.purpose}</p>
                                        <span>{new Date(booking.updatedAt).toLocaleString("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="empty-state compact-empty">
                                <div className="empty-state-icon"><Icon name="file" size={22} /></div>
                                <h3>No activity yet</h3>
                                <p>Your booking updates will appear here.</p>
                            </div>
                        )}
                    </div>
                    <div className="activity-summary">
                        <span><Icon name="calendar" size={16} />{availableCount} upcoming time slots in the preview</span>
                        <button className="text-button" type="button" onClick={() => navigate("/student/profile")}>
                            <span className="avatar small-avatar">{getInitials(displayName)}</span>
                            Complete group profile
                        </button>
                    </div>
                </article>
            </section>
        </main>
    );
}
