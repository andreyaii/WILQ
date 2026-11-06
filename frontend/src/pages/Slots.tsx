import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Icon } from "../components/Icon";
import {
    formatDate,
    formatTime,
    type ConsultationSlot,
    useStudentData,
} from "../context/StudentDataContext";

function slotHasPassed(slot: ConsultationSlot) {
    return new Date(slot.date + "T" + slot.startTime + ":00").getTime() <= Date.now();
}

export default function Slots() {
    const navigate = useNavigate();
    const {
        slots,
        bookings,
        selectedSlotId,
        setSelectedSlotId,
        getRemainingSeats,
        getSlot,
    } = useStudentData();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey =
        today.getFullYear() +
        "-" +
        String(today.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(today.getDate()).padStart(2, "0");

    const dates = Array.from(
        new Set(slots.filter((slot) => slot.date >= todayKey).map((slot) => slot.date)),
    ).slice(0, 6);
    const [selectedDate, setSelectedDate] = useState(dates[0] ?? "");

    useEffect(() => {
        if (!dates.includes(selectedDate)) {
            setSelectedDate(dates[0] ?? "");
        }
    }, [selectedDate, dates.join("|")]);

    const selectedSlot = selectedSlotId ? getSlot(selectedSlotId) : undefined;
    const activeBooking = bookings.find((booking) =>
        booking.status === "Pending" || booking.status === "Approved"
    );
    const slotsForDate = slots.filter(
        (slot) =>
            slot.date === selectedDate &&
            !slotHasPassed(slot) &&
            getRemainingSeats(slot) > 0,
    );

    const dateLabel = (date: string) => ({
        weekday: new Date(date + "T00:00:00").toLocaleDateString("en-PH", {
            weekday: "short",
        }),
        day: new Date(date + "T00:00:00").getDate(),
        month: new Date(date + "T00:00:00").toLocaleDateString("en-PH", {
            month: "short",
        }),
    });

    return (
        <main className="student-page">
            <div className="page-header">
                <div>
                    <span className="eyebrow">Consultation schedule</span>
                    <h1>Available slots</h1>
                    <p>Choose a date and time for your group’s next consultation.</p>
                </div>
                <button
                    className="secondary-button"
                    type="button"
                    onClick={() => navigate("/student/bookings")}
                >
                    <Icon name="file" size={17} />
                    My bookings
                </button>
            </div>

            <div className="notice-banner">
                <Icon name="info" size={17} />
                <span>
                    Preview schedule: selections and bookings save in this browser. They are not yet sent to a live NAS schedule.
                </span>
            </div>

            <div className="slots-layout">
                <section className="panel slot-picker">
                    <div className="slot-toolbar">
                        <div>
                            <span className="eyebrow">Step 1 of 2</span>
                            <h2>Select a date</h2>
                        </div>
                        <div className="legend">
                            <span><i className="available" /> Available</span>
                            <span><i /> Unavailable</span>
                        </div>
                    </div>

                    {dates.length > 0 ? (
                        <div className="date-row" aria-label="Available dates">
                            {dates.map((date) => {
                                const label = dateLabel(date);
                                const hasAvailability = slots.some(
                                    (slot) =>
                                        slot.date === date &&
                                        !slotHasPassed(slot) &&
                                        getRemainingSeats(slot) > 0,
                                );
                                return (
                                    <button
                                        type="button"
                                        key={date}
                                        className={selectedDate === date ? "selected" : ""}
                                        disabled={!hasAvailability}
                                        aria-pressed={selectedDate === date}
                                        onClick={() => {
                                            setSelectedDate(date);
                                            if (selectedSlot && selectedSlot.date !== date) {
                                                setSelectedSlotId(null);
                                            }
                                        }}
                                    >
                                        <span>{label.weekday}</span>
                                        <strong>{label.day}</strong>
                                        <small>{label.month}</small>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="empty-state compact-empty">
                            <div className="empty-state-icon"><Icon name="calendar" size={22} /></div>
                            <h3>No future slots listed</h3>
                            <p>Check support details for guidance while the consultation schedule is being updated.</p>
                            <button className="secondary-button" type="button" onClick={() => navigate("/student/support")}>
                                View support details
                            </button>
                        </div>
                    )}

                    <div className="availability-heading">
                        <div>
                            <span className="eyebrow">Step 2 of 2</span>
                            <h2>{selectedDate ? formatDate(selectedDate) : "Select a date first"}</h2>
                        </div>
                    </div>

                    {activeBooking && (
                        <div className="inline-empty active-booking-notice">
                            <Icon name="info" size={17} />
                            <span>
                                Your group already has an active booking ({activeBooking.reference}). Review it before making another booking.
                                <button className="text-button" type="button" onClick={() => navigate("/student/bookings/" + activeBooking.reference)}>View current booking <Icon name="arrow" size={14} /></button>
                            </span>
                        </div>
                    )}

                    {slotsForDate.length > 0 ? (
                        <div className="time-grid">
                            {slots
                                .filter((slot) => slot.date === selectedDate)
                                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                                .map((slot) => {
                                    const remaining = getRemainingSeats(slot);
                                    const disabled = remaining < 1 || slotHasPassed(slot) || Boolean(activeBooking);
                                    return (
                                        <button
                                            type="button"
                                            key={slot.id}
                                            className={selectedSlotId === slot.id ? "selected" : ""}
                                            disabled={disabled}
                                            aria-pressed={selectedSlotId === slot.id}
                                            onClick={() => setSelectedSlotId(slot.id)}
                                        >
                                            <Icon name="clock" size={16} />
                                            <span className="slot-time-label">
                                                <strong>{formatTime(slot.startTime)}</strong>
                                                <small>{remaining} seat{remaining === 1 ? "" : "s"} left</small>
                                            </span>
                                            {selectedSlotId === slot.id && <Icon name="check" size={16} />}
                                        </button>
                                    );
                                })}
                        </div>
                    ) : (
                        <div className="inline-empty">
                            <Icon name="info" size={17} />
                            <span>No open times remain on this date. Please choose another date.</span>
                        </div>
                    )}

                    <div className="availability-note">
                        <Icon name="info" size={16} />
                        <span>Bookings are reserved as pending until reviewed. Please double-check the date and time before continuing.</span>
                    </div>
                </section>

                <aside className="panel selection-card">
                    <span className="eyebrow">Booking summary</span>
                    <h2>Your selected slot</h2>
                    {selectedSlot ? (
                        <>
                            <div className="summary-calendar">
                                <div>
                                    <span>{new Date(selectedSlot.date + "T00:00:00").toLocaleDateString("en-PH", { month: "short" }).toUpperCase()}</span>
                                    <strong>{new Date(selectedSlot.date + "T00:00:00").getDate()}</strong>
                                </div>
                                <p>
                                    <strong>{selectedSlot.topic}</strong>
                                    <span>{formatDate(selectedSlot.date, { weekday: "long", year: undefined })}</span>
                                </p>
                            </div>
                            <div className="summary-list">
                                <div>
                                    <Icon name="clock" size={17} />
                                    <span>Time<strong>{formatTime(selectedSlot.startTime)} – {formatTime(selectedSlot.endTime)}</strong></span>
                                </div>
                                <div>
                                    <Icon name="user" size={17} />
                                    <span>Facilitator<strong>{selectedSlot.instructor}</strong></span>
                                </div>
                                <div>
                                    <Icon name="grid" size={17} />
                                    <span>Location<strong>{selectedSlot.location}</strong></span>
                                </div>
                                <div>
                                    <Icon name="users" size={17} />
                                    <span>Availability<strong>{getRemainingSeats(selectedSlot)} seat(s) remaining</strong></span>
                                </div>
                            </div>
                            <button
                                className="primary-button full"
                                type="button"
                                disabled={getRemainingSeats(selectedSlot) < 1 || slotHasPassed(selectedSlot)}
                                onClick={() => navigate("/student/booking-confirmation")}
                            >
                                Continue to booking
                                <Icon name="arrow" size={17} />
                            </button>
                            <p className="selection-footnote">Your slot is not reserved until you submit the booking.</p>
                        </>
                    ) : (
                        <div className="summary-placeholder">
                            <div className="empty-state-icon"><Icon name="calendar" size={22} /></div>
                            <p>Pick an available time to review the details here.</p>
                            <button className="secondary-button full" type="button" onClick={() => navigate("/student/bookings")}>
                                View my bookings
                            </button>
                        </div>
                    )}
                </aside>
            </div>
        </main>
    );
}
