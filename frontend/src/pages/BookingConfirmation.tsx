import { type SubmitEvent, useState } from "react";
import { useNavigate } from "react-router";
import { Icon } from "../components/Icon";
import {
    formatDate,
    formatTime,
    useStudentData,
} from "../context/StudentDataContext";

export default function BookingConfirmation() {
    const navigate = useNavigate();
    const {
        selectedSlotId,
        getSlot,
        getRemainingSeats,
        createBooking,
        setSelectedSlotId,
    } = useStudentData();
    const slot = selectedSlotId ? getSlot(selectedSlotId) : undefined;
    const [purpose, setPurpose] = useState("Capstone Consultation");
    const [notes, setNotes] = useState("");
    const [error, setError] = useState("");

    const submit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!slot) {
            setError("Please choose an available slot before confirming.");
            return;
        }

        try {
            const booking = createBooking(slot.id, purpose, notes);
            navigate("/student/bookings/" + booking.reference);
        } catch (reason) {
            setError(
                reason instanceof Error
                    ? reason.message
                    : "The booking could not be saved.",
            );
        }
    };

    return (
        <main className="student-page">
            <div className="page-header">
                <div>
                    <span className="eyebrow">Review your request</span>
                    <h1>Confirm booking</h1>
                    <p>
                        Review the selected consultation slot and tell us what
                        your group needs help with.
                    </p>
                </div>
                <button
                    className="secondary-button"
                    type="button"
                    onClick={() => navigate("/student/slots")}
                >
                    <Icon name="arrow" size={16} />
                    Back to slots
                </button>
            </div>

            <div className="stepper" aria-label="Booking steps">
                <div className="step done">
                    <i>
                        <Icon name="check" size={13} />
                    </i>
                    <span>Select a slot</span>
                </div>
                <b className="done" />
                <div className="step active">
                    <i>2</i>
                    <span>Booking details</span>
                </div>
                <b />
                <div className="step">
                    <i>3</i>
                    <span>Confirmation</span>
                </div>
            </div>

            {!slot ? (
                <section className="panel empty-state page-empty">
                    <div className="empty-state-icon">
                        <Icon name="calendar" size={24} />
                    </div>
                    <h2>No slot selected</h2>
                    <p>
                        Choose a date and time from the available schedule to
                        continue.
                    </p>
                    <button
                        className="primary-button"
                        type="button"
                        onClick={() => navigate("/student/slots")}
                    >
                        Browse available slots
                        <Icon name="arrow" size={16} />
                    </button>
                </section>
            ) : (
                <div className="review-layout">
                    <section className="panel confirm-card">
                        <div className="review-hero">
                            <div className="large-icon">
                                <Icon name="calendar" size={22} />
                            </div>
                            <div>
                                <span className="eyebrow">
                                    Selected consultation
                                </span>
                                <h2>{slot.topic}</h2>
                                <p>
                                    {formatDate(slot.date)} ·{" "}
                                    {formatTime(slot.startTime)} –{" "}
                                    {formatTime(slot.endTime)}
                                </p>
                            </div>
                        </div>
                        <div className="detail-grid">
                            <div>
                                <span>Facilitator</span>
                                <strong>{slot.instructor}</strong>
                            </div>
                            <div>
                                <span>Location</span>
                                <strong>{slot.location}</strong>
                            </div>
                            <div>
                                <span>Initial status</span>
                                <strong>Pending review</strong>
                            </div>
                        </div>

                        {error && (
                            <div className="form-error" role="alert">
                                <Icon name="info" size={16} />
                                {error}
                            </div>
                        )}

                        <form onSubmit={submit}>
                            <div className="notes-field">
                                <label htmlFor="booking-purpose">
                                    Consultation type
                                </label>
                                <select
                                    id="booking-purpose"
                                    value={purpose}
                                    onChange={(event) =>
                                        setPurpose(event.target.value)
                                    }
                                    required
                                >
                                    <option>Capstone Consultation</option>
                                    <option>Capstone Proposal Review</option>
                                    <option>Progress Review</option>
                                    <option>Technical Issue</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="notes-field">
                                <label htmlFor="booking-notes">
                                    What would your group like to discuss?{" "}
                                    <em>Optional</em>
                                </label>
                                <textarea
                                    id="booking-notes"
                                    value={notes}
                                    onChange={(event) =>
                                        setNotes(event.target.value)
                                    }
                                    maxLength={1000}
                                    placeholder="Add a short note to help the facilitator prepare."
                                />
                                <small>{notes.length}/1000 characters</small>
                            </div>
                            <div className="confirmation-actions">
                                <button
                                    className="secondary-button"
                                    type="button"
                                    onClick={() => {
                                        setSelectedSlotId(null);
                                        navigate("/student/slots");
                                    }}
                                >
                                    Change slot
                                </button>
                                <button
                                    className="primary-button"
                                    type="submit"
                                    disabled={getRemainingSeats(slot) < 1}
                                >
                                    Submit booking
                                    <Icon name="arrow" size={16} />
                                </button>
                            </div>
                        </form>
                    </section>

                    <aside className="panel instructions">
                        <div className="large-icon">
                            <Icon name="info" size={20} />
                        </div>
                        <h2>Before you submit</h2>
                        <ul>
                            <li>
                                Make sure the selected date and time work for
                                your whole group.
                            </li>
                            <li>
                                Include enough detail for the facilitator to
                                understand your concern.
                            </li>
                            <li>
                                Your booking will appear under My Bookings with
                                a reference number.
                            </li>
                            <li>
                                Pending bookings may require review before the
                                consultation is confirmed.
                            </li>
                        </ul>
                    </aside>
                </div>
            )}
        </main>
    );
}
