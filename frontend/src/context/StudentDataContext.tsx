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
const ACCOUNTS_STORAGE_KEY = "wilq.auth.accounts.v2";
const SESSION_STORAGE_KEY = "wilq.auth.session.v2";

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
    contactNumber?: string;
};

export type UserAccount = {
    id: string;
    username: string;
    email: string;
    password: string;
    groupName: string;
    groupCode: string;
    program: string;
    section: string;
    representative?: string;
    contactNumber?: string;
};

export type RegisterData = {
    username: string;
    password: string;
    groupName: string;
    email?: string;
    program?: string;
    section?: string;
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
    // Auth methods and state
    currentUser: UserAccount | null;
    isAuthenticated: boolean;
    login: (usernameOrEmail: string, password: string) => { success: boolean; error?: string };
    register: (data: RegisterData) => { success: boolean; error?: string };
    logout: () => void;
    resetPassword: (currentPassword: string, newPassword: string) => { success: boolean; error?: string };
    requestPasswordReset: (usernameOrEmail: string) => { success: boolean; message: string };
};

const DEFAULT_ACCOUNTS: UserAccount[] = [
    {
        id: "user-default-1",
        username: "grouppixel",
        email: "pixel@cit.edu",
        password: "password123",
        groupName: "Group Pixel",
        groupCode: "2526-sem2-cs342-01",
        program: "BSIT",
        section: "F1",
        representative: "Alex Rivera",
        contactNumber: "",
    },
];

function readStoredAccounts(): UserAccount[] {
    if (typeof window === "undefined") return DEFAULT_ACCOUNTS;
    try {
        const raw = window.localStorage.getItem(ACCOUNTS_STORAGE_KEY);
        if (!raw) return DEFAULT_ACCOUNTS;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ACCOUNTS;
    } catch {
        return DEFAULT_ACCOUNTS;
    }
}

function readStoredSession(accounts: UserAccount[]): UserAccount | null {
    if (typeof window === "undefined") return accounts[0] ?? null;
    try {
        const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
        if (raw === "logged_out") {
            return null;
        }
        if (raw) {
            const found = accounts.find(
                (a) => a.id === raw || a.username.toLowerCase() === raw.toLowerCase(),
            );
            if (found) return found;
        }
        return accounts[0] ?? null;
    } catch {
        return accounts[0] ?? null;
    }
}

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
    const [accounts, setAccounts] = useState<UserAccount[]>(readStoredAccounts);
    const [currentUser, setCurrentUser] = useState<UserAccount | null>(() =>
        readStoredSession(readStoredAccounts()),
    );

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch {
            // Keep the current session usable when browser storage is unavailable.
        }
    }, [state]);

    useEffect(() => {
        try {
            window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
        } catch {
            // storage fallback
        }
    }, [accounts]);

    useEffect(() => {
        try {
            if (currentUser) {
                window.localStorage.setItem(SESSION_STORAGE_KEY, currentUser.id);
            } else {
                window.localStorage.setItem(SESSION_STORAGE_KEY, "logged_out");
            }
        } catch {
            // storage fallback
        }
    }, [currentUser]);

    useEffect(() => {
        const handleStorage = (event: StorageEvent) => {
            if (event.key === STORAGE_KEY && event.newValue) {
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
            }
            if (event.key === ACCOUNTS_STORAGE_KEY && event.newValue) {
                try {
                    const parsed = JSON.parse(event.newValue) as UserAccount[];
                    if (Array.isArray(parsed)) {
                        setAccounts(parsed);
                    }
                } catch {
                    // ignore
                }
            }
            if (event.key === SESSION_STORAGE_KEY) {
                if (event.newValue === "logged_out") {
                    setCurrentUser(null);
                } else if (event.newValue) {
                    const found = accounts.find((a) => a.id === event.newValue);
                    if (found) setCurrentUser(found);
                }
            }
        };

        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, [accounts]);

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

            if (currentUser) {
                const updatedUser: UserAccount = {
                    ...currentUser,
                    groupName: updates.groupName ?? currentUser.groupName,
                    program: updates.program ?? currentUser.program,
                    section: updates.section ?? currentUser.section,
                    representative: updates.representative ?? currentUser.representative,
                    email: updates.email ?? currentUser.email,
                };
                setCurrentUser(updatedUser);
                setAccounts((curr) =>
                    curr.map((acc) => (acc.id === currentUser.id ? updatedUser : acc)),
                );
            }
        };

        const login = (usernameOrEmail: string, password: string) => {
            const cleanId = usernameOrEmail.trim().toLowerCase();
            const cleanPass = password.trim();

            const found = accounts.find(
                (acc) =>
                    (acc.username.toLowerCase() === cleanId || acc.email.toLowerCase() === cleanId) &&
                    acc.password === cleanPass,
            );

            if (!found) {
                return {
                    success: false,
                    error: "Invalid username or password. Check your credentials or sign up.",
                };
            }

            setCurrentUser(found);
            setState((current) => ({
                ...current,
                profile: {
                    ...current.profile,
                    groupName: found.groupName,
                    groupCode: found.groupCode,
                    program: found.program,
                    section: found.section,
                    representative: found.representative || current.profile.representative,
                    email: found.email,
                },
            }));

            return { success: true };
        };

        const register = (data: RegisterData) => {
            const cleanUser = data.username.trim();
            const cleanPass = data.password.trim();
            const cleanGroup = data.groupName.trim();

            if (!cleanUser || !cleanPass || !cleanGroup) {
                return { success: false, error: "Please provide a group name, username, and password." };
            }

            if (cleanUser.length < 3) {
                return { success: false, error: "Username must be at least 3 characters." };
            }

            if (cleanPass.length < 6) {
                return { success: false, error: "Password must be at least 6 characters long." };
            }

            const exists = accounts.some(
                (acc) => acc.username.toLowerCase() === cleanUser.toLowerCase(),
            );
            if (exists) {
                return { success: false, error: "That username is already taken. Please choose another." };
            }

            const email = data.email?.trim() || `${cleanUser.toLowerCase()}@cit.edu`;
            const program = data.program?.trim() || "BSIT";
            const section = data.section?.trim() || "F1";
            const groupCode = `2526-sem2-${cleanUser.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "grp"}-01`;

            const newAccount: UserAccount = {
                id: "user-" + Date.now(),
                username: cleanUser,
                email,
                password: cleanPass,
                groupName: cleanGroup,
                groupCode,
                program,
                section,
                representative: "",
                contactNumber: "",
            };

            setAccounts((current) => [...current, newAccount]);

            return { success: true };
        };

        const logout = () => {
            setCurrentUser(null);
            try {
                window.localStorage.setItem(SESSION_STORAGE_KEY, "logged_out");
            } catch {
                // ignore
            }
        };

        const resetPassword = (currentPassword: string, newPassword: string) => {
            if (!currentUser) {
                return { success: false, error: "You must be signed in to change your password." };
            }

            if (currentUser.password !== currentPassword.trim()) {
                return { success: false, error: "Current password does not match our records." };
            }

            if (newPassword.trim().length < 6) {
                return { success: false, error: "New password must be at least 6 characters long." };
            }

            if (currentPassword.trim() === newPassword.trim()) {
                return { success: false, error: "New password must be different from current password." };
            }

            const updatedUser: UserAccount = {
                ...currentUser,
                password: newPassword.trim(),
            };

            setAccounts((curr) =>
                curr.map((acc) => (acc.id === currentUser.id ? updatedUser : acc)),
            );
            setCurrentUser(updatedUser);

            return { success: true };
        };

        const requestPasswordReset = (usernameOrEmail: string) => {
            const cleanId = usernameOrEmail.trim().toLowerCase();
            const found = accounts.find(
                (acc) => acc.username.toLowerCase() === cleanId || acc.email.toLowerCase() === cleanId,
            );

            if (found) {
                return {
                    success: true,
                    message: `Password reset instructions have been generated for ${found.email}. (Demo note: Your current active password is '${found.password}'. You can also reset it in the Profile page.)`,
                };
            }

            return {
                success: true,
                message: `Password reset instructions have been simulated for ${usernameOrEmail}. If this account is registered with the WIL office, you will receive reset instructions shortly.`,
            };
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
            currentUser,
            isAuthenticated: Boolean(currentUser),
            login,
            register,
            logout,
            resetPassword,
            requestPasswordReset,
        };
    }, [state, selectedSlotId, accounts, currentUser]);

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
