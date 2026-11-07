import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Icon } from "../components/Icon";
import {
    type BookingStatus,
    formatDate,
    formatTime,
    useStudentData,
} from "../context/StudentDataContext";

function StatusBadge({ status }: { status: BookingStatus }) {
    return (
        <span className={"status status-" + status.toLowerCase()}>
            <i />
            {status}
        </span>
    );
}

function timestamp(value: string) {
    return new Date(value).toLocaleString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export default function BookingDetails() {
    const navigate = useNavigate();
    const { bookingId = "" } = useParams();
    const { getSlot, getBooking, cancelBooking } = useStudentData();
    const booking = getBooking(decodeURIComponent(bookingId));
    const slot = booking ? getSlot(booking.slotId) : undefined;
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    if (!booking) {
        return (
            <main className="student-page">
                <div className="page-header">
                    <div>
                        <span className="eyebrow">Booking details</span>
                        <h1>Booking not found</h1>
                        <p>
                            This reference may not exist in the current browser
                            workspace.
                        </p>
                    </div>
                </div>
                <section className="panel empty-state page-empty">
                    <div className="empty-state-icon">
                        <Icon name="file" size={23} />
                    </div>
                    <h2>We couldn’t find that booking</h2>
                    <p>Return to My Bookings to choose a valid reference.</p>
                    <button
                        className="primary-button"
                        type="button"
                        onClick={() => navigate("/student/bookings")}
                    >
                        Go to my bookings
                    </button>
                </section>
            </main>
        );
    }

    const canCancel =
        booking.status === "Pending" || booking.status === "Approved";
    const timelineLabel =
        booking.status === "Pending"
            ? "Awaiting review"
            : booking.status === "Approved"
              ? "Booking approved"
              : booking.status === "Completed"
                ? "Consultation completed"
                : booking.status === "Cancelled"
                  ? "Booking cancelled"
                  : "Booking rejected";

    const handleCancel = () => {
        setError("");
        setMessage("");
        if (!window.confirm("Cancel booking " + booking.reference + "?")) {
            return;
        }
        try {
            cancelBooking(booking.reference);
            setMessage(
                "Booking cancelled. Its slot is available for another group in this browser preview.",
            );
        } catch (reason) {
            setError(
                reason instanceof Error
                    ? reason.message
                    : "The booking could not be cancelled.",
            );
        }
    };

    return (
        <main className="student-page">
            <div className="page-header detail-title">
                <div>
                    <span className="eyebrow">
                        Booking reference · {booking.reference}
                    </span>
                    <h1>Booking details</h1>
                    <p>
                        Review the consultation schedule and current booking
                        status.
                    </p>
                </div>
                <button
                    className="secondary-button"
                    type="button"
                    onClick={() => navigate("/student/bookings")}
                >
                    <Icon name="arrow" size={16} />
                    Back to my bookings
                </button>
            </div>

            <div className="details-layout">
                <div>
                    <section className="panel booking-detail-card">
                        <div className="detail-card-heading">
                            <div className="large-icon">
                                <Icon name="calendar" size={22} />
                            </div>
                            <div>
                                <h2>{booking.purpose}</h2>
                                <p>
                                    {slot?.topic ?? "Consultation slot"} ·{" "}
                                    {booking.reference}
                                </p>
                            </div>
                            <div className="detail-status">
                                <StatusBadge status={booking.status} />
                            </div>
                        </div>
                        <div className="detail-grid compact">
                            <div>
                                <span>Date</span>
                                <strong>
                                    {slot
                                        ? formatDate(slot.date)
                                        : "Not available"}
                                </strong>
                            </div>
                            <div>
                                <span>Time</span>
                                <strong>
                                    {slot
                                        ? formatTime(slot.startTime) +
                                          " – " +
                                          formatTime(slot.endTime)
                                        : "Not available"}
                                </strong>
                            </div>
                            <div>
                                <span>Facilitator</span>
                                <strong>
                                    {slot?.instructor ?? "Not assigned"}
                                </strong>
                            </div>
                            <div>
                                <span>Location</span>
                                <strong>
                                    {slot?.location ?? "Check with WIL"}
                                </strong>
                            </div>
                            <div>
                                <span>Submitted</span>
                                <strong>{timestamp(booking.createdAt)}</strong>
                            </div>
                            <div>
                                <span>Last updated</span>
                                <strong>{timestamp(booking.updatedAt)}</strong>
                            </div>
                        </div>
                        {booking.notes && (
                            <div className="notes-field readonly-notes">
                                <label>Notes from your group</label>
                                <p>{booking.notes}</p>
                            </div>
                        )}
                    </section>

                    <section className="panel updates-card">
                        <span className="eyebrow">Status history</span>
                        <h2>Booking updates</h2>
                        <div className="timeline">
                            <div>
                                <i>
                                    <Icon name="check" size={14} />
                                </i>
                                <section>
                                    <strong>Booking submitted</strong>
                                    <p>
                                        Your group submitted this consultation
                                        request.
                                    </p>
                                    <span>{timestamp(booking.createdAt)}</span>
                                </section>
                            </div>
                            <div className="current">
                                <i>
                                    <Icon
                                        name={
                                            booking.status === "Cancelled" ||
                                            booking.status === "Rejected"
                                                ? "info"
                                                : "clock"
                                        }
                                        size={14}
                                    />
                                </i>
                                <section>
                                    <strong>{timelineLabel}</strong>
                                    <p>
                                        {booking.status === "Pending"
                                            ? "No approval decision has been recorded yet."
                                            : booking.status === "Approved"
                                              ? "Your booking has been marked approved in this workspace."
                                              : booking.status === "Completed"
                                                ? "This consultation has been marked completed."
                                                : booking.status === "Cancelled"
                                                  ? "Your group cancelled this booking."
                                                  : "This booking has been marked rejected."}
                                    </p>
                                    <span>{timestamp(booking.updatedAt)}</span>
                                </section>
                            </div>
                        </div>
                    </section>
                </div>

                <aside>
                    <section className="panel queue-card">
                        <span className="live-label">
                            <i /> Booking status
                        </span>
                        <h2>{booking.status}</h2>
                        <p>
                            {booking.status === "Pending"
                                ? "The request is waiting for review. Queue information is not available until a facilitator session is running."
                                : booking.status === "Approved"
                                  ? "Keep this reference handy. Live queue details will appear when a facilitator starts the session."
                                  : "This booking is no longer waiting for a consultation."}
                        </p>
                        <div className="queue-number">
                            <span>Booking reference</span>
                            <strong className="reference-number">
                                {booking.reference}
                            </strong>
                        </div>
                        {canCancel && (
                            <button
                                className="danger-button full"
                                type="button"
                                onClick={handleCancel}
                            >
                                <Icon name="close" size={16} />
                                Cancel booking
                            </button>
                        )}
                        {message && (
                            <p className="form-success" role="status">
                                {message}
                            </p>
                        )}
                        {error && (
                            <p className="form-error" role="alert">
                                {error}
                            </p>
                        )}
                        <button
                            className="secondary-button full support-action"
                            type="button"
                            onClick={() => navigate("/student/support")}
                        >
                            <Icon name="info" size={16} />
                            View support details
                        </button>
                    </section>

                    <section className="panel instructions">
                        <h2>What happens next?</h2>
                        <ul>
                            <li>
                                Keep the booking reference for any follow-up.
                            </li>
                            <li>Check My Bookings for status changes.</li>
                            <li>
                                Use Support details if your schedule looks
                                incorrect.
                            </li>
                        </ul>
                    </section>
                </aside>
            </div>
        </main>
    );
}
