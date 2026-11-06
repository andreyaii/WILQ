import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Icon } from "../components/Icon";
import {
    formatDate,
    formatTime,
    type BookingStatus,
    useStudentData,
} from "../context/StudentDataContext";

type FilterStatus = "All" | "Pending" | "Approved" | "Completed" | "Cancelled";

function StatusBadge({ status }: { status: BookingStatus }) {
    return <span className={"status status-" + status.toLowerCase()}><i />{status}</span>;
}

export default function Bookings() {
    const navigate = useNavigate();
    const { bookings, getSlot } = useStudentData();
    const [filter, setFilter] = useState<FilterStatus>("All");
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        return [...bookings]
            .filter((booking) => {
                const statusMatches =
                    filter === "All" ||
                    (filter === "Cancelled"
                        ? booking.status === "Cancelled" || booking.status === "Rejected"
                        : booking.status === filter);
                const slot = getSlot(booking.slotId);
                const textMatches =
                    !normalized ||
                    booking.reference.toLowerCase().includes(normalized) ||
                    booking.purpose.toLowerCase().includes(normalized) ||
                    (slot?.instructor ?? "").toLowerCase().includes(normalized);
                return statusMatches && textMatches;
            })
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }, [bookings, filter, query, getSlot]);

    const countFor = (value: FilterStatus) =>
        value === "All"
            ? bookings.length
            : value === "Cancelled"
              ? bookings.filter((booking) => booking.status === "Cancelled" || booking.status === "Rejected").length
              : bookings.filter((booking) => booking.status === value).length;

    const filters: FilterStatus[] = ["All", "Pending", "Approved", "Completed", "Cancelled"];

    return (
        <main className="student-page">
            <div className="page-header">
                <div>
                    <span className="eyebrow">Your consultation history</span>
                    <h1>My bookings</h1>
                    <p>Track request status, review consultation details, and manage eligible bookings.</p>
                </div>
                <button className="primary-button" type="button" onClick={() => navigate("/student/slots")}>
                    <Icon name="calendar" size={17} />
                    Book a consultation
                </button>
            </div>

            <section className="panel booking-list-panel">
                <div className="table-toolbar">
                    <div className="tabs" role="tablist" aria-label="Filter bookings">
                        {filters.map((value) => (
                            <button
                                key={value}
                                type="button"
                                role="tab"
                                aria-selected={filter === value}
                                className={filter === value ? "active" : ""}
                                onClick={() => setFilter(value)}
                            >
                                {value}<span>{countFor(value)}</span>
                            </button>
                        ))}
                    </div>
                    <label className="search-box">
                        <Icon name="file" size={15} />
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search bookings"
                            aria-label="Search bookings"
                        />
                    </label>
                </div>

                {filtered.length > 0 ? (
                    <>
                        <div className="table-scroll">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Booking reference</th>
                                        <th>Consultation</th>
                                        <th>Date &amp; time</th>
                                        <th>Facilitator</th>
                                        <th>Status</th>
                                        <th>Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((booking) => {
                                        const slot = getSlot(booking.slotId);
                                        return (
                                            <tr key={booking.reference}>
                                                <td>
                                                    <strong>{booking.reference}</strong>
                                                    <span>Submitted {new Date(booking.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</span>
                                                </td>
                                                <td>
                                                    <strong>{booking.purpose}</strong>
                                                    <span>{slot?.topic ?? "Consultation slot"}</span>
                                                </td>
                                                <td>
                                                    <strong>{slot ? formatDate(slot.date, { year: undefined }) : "Schedule unavailable"}</strong>
                                                    <span>{slot ? formatTime(slot.startTime) + " – " + formatTime(slot.endTime) : "Check support details"}</span>
                                                </td>
                                                <td><strong>{slot?.instructor ?? "Not assigned"}</strong><span>{slot?.location ?? ""}</span></td>
                                                <td><StatusBadge status={booking.status} /></td>
                                                <td>
                                                    <button className="view-button" type="button" onClick={() => navigate("/student/bookings/" + booking.reference)}>
                                                        View details <Icon name="arrow" size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="table-footer">
                            <span>Showing {filtered.length} of {bookings.length} booking{bookings.length === 1 ? "" : "s"}</span>
                            <button type="button" aria-label="Refresh bookings" onClick={() => {
                                setQuery("");
                                setFilter("All");
                            }}><Icon name="check" size={14} /></button>
                        </div>
                    </>
                ) : (
                    <div className="empty-state panel-empty">
                        <div className="empty-state-icon"><Icon name={bookings.length === 0 ? "file" : "search"} size={23} /></div>
                        <h2>{bookings.length === 0 ? "No bookings yet" : "No matching bookings"}</h2>
                        <p>
                            {bookings.length === 0
                                ? "When you book a consultation, its reference, schedule, and status will appear here."
                                : "Try another status filter or a different search term."}
                        </p>
                        {bookings.length === 0 ? (
                            <button className="primary-button" type="button" onClick={() => navigate("/student/slots")}>
                                View available slots <Icon name="arrow" size={16} />
                            </button>
                        ) : (
                            <button className="secondary-button" type="button" onClick={() => {
                                setQuery("");
                                setFilter("All");
                            }}>Clear filters</button>
                        )}
                    </div>
                )}
            </section>
        </main>
    );
}
