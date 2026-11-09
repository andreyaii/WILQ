import { type ReactNode, type SubmitEvent, useState } from "react";
import { useStudentData } from "../context/StudentDataContext";

type LandingProps = {
    onLogin: () => void;
};

function FieldIcon({ children }: { children: ReactNode }) {
    return <span className="landing-field-icon">{children}</span>;
}

function UserIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
        >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
    );
}

function UsersIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

function LockIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
        >
            <rect x="4" y="10" width="16" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
    );
}

function EyeIcon({ hidden }: { hidden: boolean }) {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
            <circle cx="12" cy="12" r="2.5" />
            {hidden && <path d="m4 4 16 16" />}
        </svg>
    );
}

function ArrowIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
    );
}

export default function Landing({ onLogin }: LandingProps) {
    const { login, register, requestPasswordReset } = useStudentData();
    const [mode, setMode] = useState<"login" | "signup" | "forgot-password">("login");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Form fields
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [groupName, setGroupName] = useState("");
    const [forgotIdentifier, setForgotIdentifier] = useState("");

    // Feedback
    const [error, setError] = useState("");
    const [forgotSuccess, setForgotSuccess] = useState("");
    const [signupSuccess, setSignupSuccess] = useState("");

    const switchMode = (newMode: "login" | "signup" | "forgot-password") => {
        setMode(newMode);
        setError("");
        setForgotSuccess("");
        setSignupSuccess("");
    };

    const submit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        if (mode === "login") {
            const result = login(username, password);
            if (result.success) {
                onLogin();
            } else {
                setError(result.error || "Failed to log in.");
            }
        } else if (mode === "signup") {
            if (password !== confirmPassword) {
                setError("Passwords do not match. Please verify both password fields.");
                return;
            }

            const result = register({
                username,
                password,
                groupName,
            });

            if (result.success) {
                setSignupSuccess("Account created successfully! Please log in to continue.");
                setMode("login");
                setPassword("");
                setConfirmPassword("");
                setError("");
            } else {
                setError(result.error || "Registration failed.");
            }
        } else if (mode === "forgot-password") {
            if (!forgotIdentifier.trim()) {
                setError("Please enter your registered username or email.");
                return;
            }
            const result = requestPasswordReset(forgotIdentifier);
            setForgotSuccess(result.message);
        }
    };

    return (
        <div className="landing-page">
            <main className="landing-main">
                <section
                    className="landing-auth"
                    aria-labelledby="login-heading"
                >
                    <div className="landing-auth-logo" aria-label="WILQ">
                        <span />
                        <span />
                        <span />
                    </div>
                    <h1 id="login-heading">
                        {mode === "login"
                            ? "Log in to your account"
                            : mode === "signup"
                              ? "Create your account"
                              : "Reset your password"}
                    </h1>
                    <p>
                        {mode === "login"
                            ? "Welcome back. Enter your group credentials to manage consultations and queue updates."
                            : mode === "signup"
                              ? "Create your student group account to begin managing consultation bookings."
                              : "Enter your registered username or email address and we will help you recover access."}
                    </p>

                    {mode !== "forgot-password" && (
                        <div className="landing-context-bar">
                            <button
                                type="button"
                                className={mode === "signup" ? "active" : ""}
                                onClick={() => switchMode("signup")}
                            >
                                Sign up
                            </button>
                            <button
                                type="button"
                                className={mode === "login" ? "active" : ""}
                                onClick={() => switchMode("login")}
                            >
                                Log in
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="landing-alert landing-alert-error" role="alert">
                            <span>{error}</span>
                        </div>
                    )}

                    {signupSuccess && mode === "login" && (
                        <div className="landing-alert landing-alert-success" role="status">
                            <span>{signupSuccess}</span>
                        </div>
                    )}

                    {forgotSuccess && mode === "forgot-password" ? (
                        <div className="landing-alert landing-alert-success" role="status">
                            <p>{forgotSuccess}</p>
                            <button
                                type="button"
                                className="landing-alert-action"
                                onClick={() => switchMode("login")}
                            >
                                Return to log in
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={submit}>
                            {mode === "signup" && (
                                <>
                                    <label htmlFor="landing-groupname">Group name *</label>
                                    <div className="landing-input">
                                        <FieldIcon>
                                            <UsersIcon />
                                        </FieldIcon>
                                        <input
                                            id="landing-groupname"
                                            name="groupname"
                                            value={groupName}
                                            onChange={(e) => setGroupName(e.target.value)}
                                            placeholder="e.g. Group Alpha"
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            {mode !== "forgot-password" ? (
                                <>
                                    <label htmlFor="landing-username">Username *</label>
                                    <div className="landing-input">
                                        <FieldIcon>
                                            <UserIcon />
                                        </FieldIcon>
                                        <input
                                            id="landing-username"
                                            name="username"
                                            autoComplete="username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="Enter your username"
                                            required
                                        />
                                    </div>

                                    <label htmlFor="landing-password">Password *</label>
                                    <div className="landing-input">
                                        <FieldIcon>
                                            <LockIcon />
                                        </FieldIcon>
                                        <input
                                            id="landing-password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete={mode === "login" ? "current-password" : "new-password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder={mode === "login" ? "Enter your password" : "At least 6 characters"}
                                            required
                                            minLength={mode === "signup" ? 6 : undefined}
                                        />
                                        <button
                                            type="button"
                                            className="landing-password-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            <EyeIcon hidden={showPassword} />
                                        </button>
                                    </div>

                                    {mode === "signup" && (
                                        <>
                                            <label htmlFor="landing-confirm-password">
                                                Confirm password *
                                            </label>
                                            <div className="landing-input">
                                                <FieldIcon>
                                                    <LockIcon />
                                                </FieldIcon>
                                                <input
                                                    id="landing-confirm-password"
                                                    name="confirm-password"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    autoComplete="new-password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="Confirm your password"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="landing-password-toggle"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                                >
                                                    <EyeIcon hidden={showConfirmPassword} />
                                                </button>
                                            </div>
                                        </>
                                    )}

                                    {mode === "login" && (
                                        <div className="landing-options">
                                            <label className="landing-checkbox">
                                                <input type="checkbox" defaultChecked />
                                                <span>Remember me</span>
                                            </label>
                                            <button
                                                type="button"
                                                className="landing-link"
                                                onClick={() => switchMode("forgot-password")}
                                            >
                                                Forgot password?
                                            </button>
                                        </div>
                                    )}

                                    <button className="landing-submit" type="submit">
                                        {mode === "login" ? "Log in" : "Create account"}
                                        <ArrowIcon />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <label htmlFor="landing-forgot-id">Username or Email *</label>
                                    <div className="landing-input">
                                        <FieldIcon>
                                            <UserIcon />
                                        </FieldIcon>
                                        <input
                                            id="landing-forgot-id"
                                            name="forgot-id"
                                            value={forgotIdentifier}
                                            onChange={(e) => setForgotIdentifier(e.target.value)}
                                            placeholder="Enter your username or email"
                                            required
                                        />
                                    </div>

                                    <button className="landing-submit" type="submit">
                                        Send reset instructions
                                        <ArrowIcon />
                                    </button>

                                    <button
                                        type="button"
                                        className="landing-back-link"
                                        onClick={() => switchMode("login")}
                                    >
                                        ← Back to log in
                                    </button>
                                </>
                            )}
                        </form>
                    )}

                    <div className="landing-support">
                        <span>Need help accessing your group account?</span>
                        <button type="button">Contact the WIL office</button>
                    </div>
                </section>
            </main>
        </div>
    );
}
