export type BookingDraft = {
    purpose: string;
    notes: string;
};

export function isBookingDraft(value: unknown): value is BookingDraft {
    if (!value || typeof value !== "object") {
        return false;
    }

    const draft = value as Partial<BookingDraft>;
    return typeof draft.purpose === "string" && typeof draft.notes === "string";
}
