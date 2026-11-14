import { type SubmitEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import BookingStepper from "../../components/BookingStepper.tsx";
import { Icon } from "../../components/Icon.tsx";
import {
    formatDate,
    formatTime,
    useStudentData,
} from "../../context/StudentDataContext.tsx";
import { type BookingDraft, isBookingDraft } from "./bookingWorkflow.ts";

export default function BookingConfirmation({
    isReview = false,
}: {
    isReview?: boolean;
}) {
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedSlotId, getSlot, createBooking } = useStudentData();
    const slot = selectedSlotId ? getSlot(selectedSlotId) : undefined;
    const initialDraft = isBookingDraft(location.state)
        ? location.state
        : undefined;
    const [purpose, setPurpose] = useState(
        initialDraft?.purpose ?? "Capstone Consultation",
    );
    const [notes, setNotes] = useState(initialDraft?.notes ?? "");
    const [error, setError] = useState("");
    const draft: BookingDraft = { purpose, notes };

    const continueToReview = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!slot) {
            setError("Please choose an available slot before continuing.");
            return;
        }

        setError("");
        navigate("/student/booking-confirmation/review", { state: draft });
    };

    const confirmBooking = () => {
        if (!slot) {
            setError("Please choose an available slot before confirming.");
            return;
        }

        try {
            const booking = createBooking(slot.id, purpose, notes);
            navigate(
                "/student/bookings/" + encodeURIComponent(booking.reference),
            );
        } catch (reason) {
            setError(
                reason instanceof Error
                    ? reason.message
                    : "The booking could not be saved.",
            );
        }
    };

    const goToStep = (step: 1 | 2) => {
        navigate(
            step === 1 ? "/student/slots" : "/student/booking-confirmation",
            {
                state: draft,
            },
        );
    };

    return (
        <main className="student-page">
            <div className="page-header">
                <div>
                    <span className="eyebrow">
                        {isReview ? "Final review" : "Review your request"}
                    </span>
                    <h1>
                        {isReview ? "Confirm your booking" : "Booking details"}
                    </h1>
                    <p>
                        {isReview
                            ? "Check your booking details. You can go back to make changes before confirming."
                            : "Review the selected consultation slot and tell us what your group needs help with."}
                    </p>
                </div>
                <button
                    className="secondary-button"
                    type="button"
                    onClick={() => goToStep(isReview ? 2 : 1)}
                >
                    <Icon name="arrow" size={16} />
                    {isReview ? "Back to details" : "Back to slots"}
                </button>
            </div>

            <BookingStepper
                currentStep={isReview ? 3 : 2}
                onStepClick={goToStep}
            />

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
                                <span>Consultation type</span>
                                <strong>{purpose}</strong>
                            </div>
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

                        {isReview ? (
                            <>
                                {notes && (
                                    <div className="notes-field readonly-notes">
                                        <label>
                                            What your group would like to
                                            discuss
                                        </label>
                                        <p>{notes}</p>
                                    </div>
                                )}
                                <div className="confirmation-actions">
                                    <button
                                        className="secondary-button"
                                        type="button"
                                        onClick={() => goToStep(2)}
                                    >
                                        Edit booking details
                                    </button>
                                    <button
                                        className="primary-button"
                                        type="button"
                                        onClick={confirmBooking}
                                    >
                                        Confirm booking
                                        <Icon name="check" size={16} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <form onSubmit={continueToReview}>
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
                                        <option>
                                            Capstone Proposal Review
                                        </option>
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
                                    <small>
                                        {notes.length}/1000 characters
                                    </small>
                                </div>
                                <div className="confirmation-actions">
                                    <button
                                        className="secondary-button"
                                        type="button"
                                        onClick={() => goToStep(1)}
                                    >
                                        Change slot
                                    </button>
                                    <button
                                        className="primary-button"
                                        type="submit"
                                    >
                                        Continue to confirmation
                                        <Icon name="arrow" size={16} />
                                    </button>
                                </div>
                            </form>
                        )}
                    </section>

                    <aside className="panel instructions">
                        <div className="large-icon">
                            <Icon name="info" size={20} />
                        </div>
                        <h2>
                            {isReview
                                ? "Before you confirm"
                                : "Before you continue"}
                        </h2>
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
                                {isReview
                                    ? "You can return to the previous steps to change your slot or details."
                                    : "You can review and confirm the request before it is submitted."}
                            </li>
                            {isReview && (
                                <li>
                                    Your booking will be submitted as pending
                                    review.
                                </li>
                            )}
                        </ul>
                    </aside>
                </div>
            )}
        </main>
    );
}
