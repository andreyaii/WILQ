import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

const STORAGE_KEY = "wilq.student-workspace.v2";
const LEGACY_STORAGE_KEY = "wilq.student-workspace.v1";

export type BookingStatus =
    | "Pending"
    | "Approved"
    | "Completed"
    | "Cancelled"
    | "Rejected";

export type ConsultationSlot = {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    topic: string;
    instructor: string;
    location: string;
    capacity: number;
};

export type Booking = {
    id: string;
    reference: string;
    slotId: string;
    purpose: string;
    notes: string;
    status: BookingStatus;
    createdAt: string;
    updatedAt: string;
};

export type StudentProfile = {
    groupName: string;
    groupCode: string;
    program: string;
    section: string;
    representative: string;
    email: string;
    contactNumber: string;
};

type WorkspaceState = {
    slots: ConsultationSlot[];
    bookings: Booking[];
    profile: StudentProfile;
};

type StudentDataValue = WorkspaceState & {
    selectedSlotId: string | null;
    setSelectedSlotId: (slotId: string | null) => void;
    getSlot: (slotId: string) => ConsultationSlot | undefined;
    getBooking: (reference: string) => Booking | undefined;
    getRemainingSeats: (slot: ConsultationSlot) => number;
    createBooking: (
        slotId: string,
        purpose: string,
        notes: string,
    ) => Booking;
    cancelBooking: (reference: string) => void;
    updateProfile: (updates: Partial<StudentProfile>) => void;
};

const StudentDataContext = createContext<StudentDataValue | null>(null);

function localDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
}

function buildSampleSlots(): ConsultationSlot[] {
    const businessDays: string[] = [];
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    for (let attempts = 0; businessDays.length < 8 && attempts < 24; attempts += 1) {
        cursor.setDate(cursor.getDate() + 1);
        const weekday = cursor.getDay();
        if (weekday !== 0 && weekday !== 6) {
            businessDays.push(localDateKey(cursor));
        }
    }

    const times = [
        { startTime: "07:30", endTime: "08:05" },
        { startTime: "08:05", endTime: "08:40" },
        { startTime: "08:40", endTime: "09:15" },
        { startTime: "09:15", endTime: "09:50" },
        { startTime: "09:50", endTime: "10:25" },
        { startTime: "10:25", endTime: "11:00" },
        { startTime: "11:00", endTime: "11:35" },
        { startTime: "11:35", endTime: "12:10" },
        { startTime: "13:20", endTime: "13:55" },
        { startTime: "13:55", endTime: "14:30" },
        { startTime: "14:30", endTime: "15:05" },
        { startTime: "15:05", endTime: "15:40" },
        { startTime: "15:40", endTime: "16:15" },
        { startTime: "16:15", endTime: "16:50" },
        { startTime: "16:50", endTime: "17:25" },
        { startTime: "17:25", endTime: "18:00" },
    ];

    return businessDays.flatMap((date) =>
        times.map((time) => ({
            id: "slot-" + date + "-" + time.startTime.replace(":", ""),
            date,
            startTime: time.startTime,
            endTime: time.endTime,
            topic: "Capstone Project Consultation",
            instructor: "Engr. Laviste",
            location: "WIL, CIT-U TBI",
            capacity: 4,
        })),
    );
}

function defaultState(): WorkspaceState {
    return {
        slots: buildSampleSlots(),
        bookings: [],
        profile: {
            groupName: "Group Pixel",
            groupCode: "2526-sem2-cs342-01",
            program: "BSIT",
            section: "F1",
            representative: "",
            email: "",
            contactNumber: "",
        },
    };
}

function addUpcomingSlots(state: WorkspaceState): WorkspaceState {
    const today = localDateKey(new Date());
    const futureCount = state.slots.filter((slot) => slot.date >= today).length;
    if (futureCount >= 8) {
        return state;
    }

    const existingIds = new Set(state.slots.map((slot) => slot.id));
    const additions = buildSampleSlots().filter(
        (slot) => slot.date >= today && !existingIds.has(slot.id),
    );
    if (additions.length === 0) {
        return state;
    }

    return {
        ...state,
        slots: [...state.slots, ...additions].sort((a, b) =>
            (a.date + a.startTime).localeCompare(b.date + b.startTime),
        ),
    };
}

function readStoredState(): WorkspaceState {
    const fallback = defaultState();
    if (typeof window === "undefined") {
        return fallback;
    }

    try {
        let raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
        }
        if (!raw) {
            return fallback;
        }

        const parsed = JSON.parse(raw) as Partial<WorkspaceState>;
        const rawSlots = Array.isArray(parsed.slots) ? parsed.slots : fallback.slots;
        // If stored slots were from the old schedule (missing 07:30 morning slots), use fresh slots
        const hasNewSlots = rawSlots.some((s) => s.startTime === "07:30");
        const slots = hasNewSlots ? rawSlots : fallback.slots;

        const profile: StudentProfile = {
            ...fallback.profile,
            ...(parsed.profile ?? {}),
            groupCode: parsed.profile?.groupCode || "2526-sem2-cs342-01",
            section: parsed.profile?.section === "3A" ? "F1" : (parsed.profile?.section || "F1"),
        };

        const loaded: WorkspaceState = {
            slots,
            bookings: Array.isArray(parsed.bookings) ? parsed.bookings : [],
            profile,
        };
        return addUpcomingSlots(loaded);
    } catch {
        return fallback;
    }
}

function isActiveBooking(booking: Booking) {
    return booking.status !== "Cancelled" && booking.status !== "Rejected";
}

export function formatDate(date: string, options?: Intl.DateTimeFormatOptions) {
    const value = new Date(date + "T00:00:00");
    return value.toLocaleDateString("en-PH", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        ...options,
    });
}

export function formatTime(time: string) {
    const parts = time.split(":");
    const value = new Date();
    value.setHours(Number(parts[0]), Number(parts[1]), 0, 0);
    return value.toLocaleTimeString("en-PH", {
        hour: "numeric",
        minute: "2-digit",
    });
}

export function getInitials(value: string) {
    const initials = value
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
    return initials || "WG";
}

export function StudentDataProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<WorkspaceState>(readStoredState);
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch {
            // Keep the current session usable when browser storage is unavailable.
        }
    }, [state]);

    useEffect(() => {
        const handleStorage = (event: StorageEvent) => {
            if (event.key !== STORAGE_KEY || !event.newValue) {
                return;
            }
            try {
                const parsed = JSON.parse(event.newValue) as WorkspaceState;
                if (
                    Array.isArray(parsed.slots) &&
                    Array.isArray(parsed.bookings) &&
                    parsed.profile
                ) {
                    setState(addUpcomingSlots(parsed));
                }
            } catch {
                // Ignore malformed updates from another tab.
            }
        };

        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, []);

    const value = useMemo<StudentDataValue>(() => {
        const getSlot = (slotId: string) =>
            state.slots.find((slot) => slot.id === slotId);

        const getBooking = (reference: string) =>
            state.bookings.find(
                (booking) =>
                    booking.reference === reference || booking.id === reference,
            );

        const getRemainingSeats = (slot: ConsultationSlot) => {
            const reserved = state.bookings.filter(
                (booking) =>
                    booking.slotId === slot.id && isActiveBooking(booking),
            ).length;
            return Math.max(0, slot.capacity - reserved);
        };

        const createBooking = (
            slotId: string,
            purpose: string,
            notes: string,
        ) => {
            const slot = getSlot(slotId);
            if (!slot) {
                throw new Error("That consultation slot could not be found. Please choose another slot.");
            }

            const startsAt = new Date(slot.date + "T" + slot.startTime + ":00");
            if (startsAt.getTime() <= Date.now()) {
                throw new Error("That consultation time has already passed. Please choose a future slot.");
            }

            if (getRemainingSeats(slot) < 1) {
                throw new Error("That slot is full. Please choose another available time.");
            }

            const activeBooking = state.bookings.find(isActiveBooking);
            if (activeBooking) {
                if (activeBooking.slotId === slotId) {
                    throw new Error("Your group already has an active booking for this slot.");
                }
                throw new Error("Your group already has an active booking. Review or cancel it before choosing another time.");
            }

            const year = new Date().getFullYear();
            const sequence = String(state.bookings.length + 1).padStart(4, "0");
            const reference = "WILQ-" + year + "-" + sequence;
            const timestamp = new Date().toISOString();
            const booking: Booking = {
                id: reference,
                reference,
                slotId,
                purpose: purpose.trim(),
                notes: notes.trim(),
                status: "Pending",
                createdAt: timestamp,
                updatedAt: timestamp,
            };

            setState((current) => ({
                ...current,
                bookings: [booking, ...current.bookings],
            }));
            setSelectedSlotId(null);
            return booking;
        };

        const cancelBooking = (reference: string) => {
            const booking = getBooking(reference);
            if (!booking || !["Pending", "Approved"].includes(booking.status)) {
                throw new Error("Only pending or approved bookings can be cancelled.");
            }

            const timestamp = new Date().toISOString();
            setState((current) => ({
                ...current,
                bookings: current.bookings.map((item) =>
                    item.reference === booking.reference
                        ? { ...item, status: "Cancelled", updatedAt: timestamp }
                        : item,
                ),
            }));
        };

        const updateProfile = (updates: Partial<StudentProfile>) => {
            setState((current) => ({
                ...current,
                profile: { ...current.profile, ...updates },
            }));
        };

        return {
            ...state,
            selectedSlotId,
            setSelectedSlotId,
            getSlot,
            getBooking,
            getRemainingSeats,
            createBooking,
            cancelBooking,
            updateProfile,
        };
    }, [state, selectedSlotId]);

    return (
        <StudentDataContext.Provider value={value}>
            {children}
        </StudentDataContext.Provider>
    );
}

export function useStudentData() {
    const context = useContext(StudentDataContext);
    if (!context) {
        throw new Error("useStudentData must be used inside StudentDataProvider.");
    }
    return context;
}
