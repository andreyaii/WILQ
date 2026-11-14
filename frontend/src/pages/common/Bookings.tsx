import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Icon } from "../../components/Icon.tsx";
import {
    type BookingStatus,
    formatDate,
    formatTime,
    useStudentData,
} from "../../context/StudentDataContext.tsx";

type FilterStatus = "All" | "Pending" | "Approved" | "Completed" | "Cancelled";
const PAGE_SIZE = 6;

function StatusBadge({ status }: { status: BookingStatus }) {
    return (
        <span className={"status status-" + status.toLowerCase()}>
            <i />
            {status}
        </span>
    );
}

export default function Bookings() {
    const navigate = useNavigate();
    const { bookings, getSlot } = useStudentData();
    const [filter, setFilter] = useState<FilterStatus>("All");
    const [query, setQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const filtered = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        return [...bookings]
            .filter((booking) => {
                const statusMatches =
                    filter === "All" ||
                    (filter === "Cancelled"
                        ? booking.status === "Cancelled" ||
                          booking.status === "Rejected"
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

    useEffect(() => {
        setCurrentPage(1);
    }, []);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const paginatedBookings = filtered.slice(
        startIndex,
        startIndex + PAGE_SIZE,
    );
    const displayedStart = filtered.length === 0 ? 0 : startIndex + 1;
    const displayedEnd = Math.min(startIndex + PAGE_SIZE, filtered.length);

    const countFor = (value: FilterStatus) =>
        value === "All"
            ? bookings.length
            : value === "Cancelled"
              ? bookings.filter(
                    (booking) =>
                        booking.status === "Cancelled" ||
                        booking.status === "Rejected",
                ).length
              : bookings.filter((booking) => booking.status === value).length;

    const filters: FilterStatus[] = [
        "All",
        "Pending",
        "Approved",
        "Completed",
        "Cancelled",
    ];

    return (
        <main className="student-page">
            <div className="page-header">
                <div>
                    <span className="eyebrow">Your consultation history</span>
                    <h1>My bookings</h1>
                    <p>
                        Track request status, review consultation details, and
                        manage eligible bookings.
                    </p>
                </div>
                <button
                    className="primary-button"
                    type="button"
                    onClick={() => navigate("/student/slots")}
                >
                    <Icon name="calendar" size={17} />
                    Book a consultation
                </button>
            </div>

            <section className="panel booking-list-panel">
                <div className="table-toolbar">
                    <div
                        className="tabs"
                        role="tablist"
                        aria-label="Filter bookings"
                    >
                        {filters.map((value) => (
                            <button
                                key={value}
                                type="button"
                                role="tab"
                                aria-selected={filter === value}
                                className={filter === value ? "active" : ""}
                                onClick={() => setFilter(value)}
                            >
                                {value}
                                <span>{countFor(value)}</span>
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
                                        <th className="status-col">
                                            Booking status
                                        </th>
                                        <th>Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedBookings.map((booking) => {
                                        const slot = getSlot(booking.slotId);
                                        return (
                                            <tr key={booking.reference}>
                                                <td>
                                                    <strong>
                                                        {booking.reference}
                                                    </strong>
                                                    <span>
                                                        Submitted{" "}
                                                        {new Date(
                                                            booking.createdAt,
                                                        ).toLocaleDateString(
                                                            "en-PH",
                                                            {
                                                                month: "short",
                                                                day: "numeric",
                                                                year: "numeric",
                                                            },
                                                        )}
                                                    </span>
                                                </td>
                                                <td>
                                                    <strong>
                                                        {booking.purpose}
                                                    </strong>
                                                    <span>
                                                        {slot?.topic ??
                                                            "Consultation slot"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <strong>
                                                        {slot
                                                            ? formatDate(
                                                                  slot.date,
                                                                  {
                                                                      year: undefined,
                                                                  },
                                                              )
                                                            : "Schedule unavailable"}
                                                    </strong>
                                                    <span>
                                                        {slot
                                                            ? formatTime(
                                                                  slot.startTime,
                                                              ) +
                                                              " – " +
                                                              formatTime(
                                                                  slot.endTime,
                                                              )
                                                            : "Check support details"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <strong>
                                                        {slot?.instructor ??
                                                            "Not assigned"}
                                                    </strong>
                                                    <span>
                                                        {slot?.location ?? ""}
                                                    </span>
                                                </td>
                                                <td className="status-cell">
                                                    <StatusBadge
                                                        status={booking.status}
                                                    />
                                                </td>
                                                <td>
                                                    <button
                                                        className="view-button"
                                                        type="button"
                                                        onClick={() =>
                                                            navigate(
                                                                "/student/bookings/" +
                                                                    booking.reference,
                                                            )
                                                        }
                                                    >
                                                        View details{" "}
                                                        <Icon
                                                            name="arrow"
                                                            size={14}
                                                        />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="table-footer">
                            <span>
                                Showing {displayedStart}–{displayedEnd} of{" "}
                                {filtered.length} booking
                                {filtered.length === 1 ? "" : "s"}
                            </span>
                            <div className="pagination-controls">
                                <button
                                    type="button"
                                    aria-label="Previous page"
                                    disabled={currentPage === 1}
                                    onClick={() =>
                                        setCurrentPage((p) =>
                                            Math.max(1, p - 1),
                                        )
                                    }
                                >
                                    ‹
                                </button>
                                {Array.from(
                                    { length: totalPages },
                                    (_, i) => i + 1,
                                ).map((page) => (
                                    <button
                                        key={page}
                                        type="button"
                                        className={
                                            currentPage === page ? "active" : ""
                                        }
                                        onClick={() => setCurrentPage(page)}
                                        aria-current={
                                            currentPage === page
                                                ? "page"
                                                : undefined
                                        }
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    aria-label="Next page"
                                    disabled={currentPage === totalPages}
                                    onClick={() =>
                                        setCurrentPage((p) =>
                                            Math.min(totalPages, p + 1),
                                        )
                                    }
                                >
                                    ›
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="empty-state panel-empty">
                        <div className="empty-state-icon">
                            <Icon
                                name={bookings.length === 0 ? "file" : "search"}
                                size={23}
                            />
                        </div>
                        <h2>
                            {bookings.length === 0
                                ? "No bookings yet"
                                : "No matching bookings"}
                        </h2>
                        <p>
                            {bookings.length === 0
                                ? "When you book a consultation, its reference, schedule, and status will appear here."
                                : "Try another status filter or a different search term."}
                        </p>
                        {bookings.length === 0 ? (
                            <button
                                className="primary-button"
                                type="button"
                                onClick={() => navigate("/student/slots")}
                            >
                                View available slots{" "}
                                <Icon name="arrow" size={16} />
                            </button>
                        ) : (
                            <button
                                className="secondary-button"
                                type="button"
                                onClick={() => {
                                    setQuery("");
                                    setFilter("All");
                                }}
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                )}
            </section>
        </main>
    );
}
