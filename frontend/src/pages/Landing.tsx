import { type FormEvent, type ReactNode, useState } from "react";

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
    const [showPassword, setShowPassword] = useState(false);
    const [mode, setMode] = useState<"login" | "signup">("login");

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onLogin();
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
                            : "Create your account"}
                    </h1>
                    <p>
                        {mode === "login"
                            ? "Welcome back. Enter your group credentials to manage consultations and queue updates."
                            : "Create your student group account to begin managing consultation bookings."}
                    </p>

                    <div className="landing-context-bar">
                        <button
                            type="button"
                            className={mode === "signup" ? "active" : ""}
                            onClick={() => setMode("signup")}
                        >
                            Sign up
                        </button>
                        <button
                            type="button"
                            className={mode === "login" ? "active" : ""}
                            onClick={() => setMode("login")}
                        >
                            Log in
                        </button>
                    </div>

                    <form onSubmit={submit}>
                        <label htmlFor="landing-username">Username</label>
                        <div className="landing-input">
                            <FieldIcon>
                                <UserIcon />
                            </FieldIcon>
                            <input
                                id="landing-username"
                                name="username"
                                autoComplete="username"
                                placeholder="Enter your username"
                                required
                            />
                        </div>

                        <label htmlFor="landing-password">Password</label>
                        <div className="landing-input">
                            <FieldIcon>
                                <LockIcon />
                            </FieldIcon>
                            <input
                                id="landing-password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                placeholder="Enter your password"
                                required
                            />
                            <button
                                type="button"
                                className="landing-password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                <EyeIcon hidden={showPassword} />
                            </button>
                        </div>

                        {mode === "signup" && (
                            <>
                                <label htmlFor="landing-confirm-password">
                                    Confirm password
                                </label>
                                <div className="landing-input">
                                    <FieldIcon>
                                        <LockIcon />
                                    </FieldIcon>
                                    <input
                                        id="landing-confirm-password"
                                        name="confirm-password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        autoComplete="new-password"
                                        placeholder="Confirm your password"
                                        required
                                    />
                                </div>
                            </>
                        )}

                        {mode === "login" && (
                            <div className="landing-options">
                                <label className="landing-checkbox">
                                    <input type="checkbox" />
                                    <span>Remember me</span>
                                </label>
                                <button type="button" className="landing-link">
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        <button className="landing-submit" type="submit">
                            {mode === "login" ? "Log in" : "Create account"}
                            <ArrowIcon />
                        </button>
                    </form>

                    <div className="landing-support">
                        <span>Need help accessing your group account?</span>
                        <button type="button">Contact the NAS office</button>
                    </div>
                </section>
            </main>
        </div>
    );
}
