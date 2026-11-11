import { useEffect, useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router";
import { Icon } from "../../components/Icon.tsx";
import { getInitials, type StudentProfile, useStudentData } from "../../context/StudentDataContext.tsx";

export default function Profile() {
    const navigate = useNavigate();
    const { profile, updateProfile, bookings, resetPassword } = useStudentData();
    const [draft, setDraft] = useState<StudentProfile>(profile);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");

    // Password reset modal state
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [showPasswords, setShowPasswords] = useState(false);
    const [resetError, setResetError] = useState("");
    const [resetSuccess, setResetSuccess] = useState("");

    useEffect(() => {
        setDraft(profile);
    }, [profile]);

    // Close modal on Escape key
    useEffect(() => {
        if (!isResetModalOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsResetModalOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isResetModalOpen]);

    const update = (field: keyof StudentProfile, value: string) => {
        setDraft((current) => ({ ...current, [field]: value }));
        setSaved(false);
        setError("");
    };

    const submit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        const groupName = draft.groupName.trim();
        const groupCode = draft.groupCode.trim();
        const program = draft.program.trim();
        const section = draft.section.trim();
        if (!groupName || !program || !section) {
            setError("Group name, program, and section are required.");
            return;
        }
        updateProfile({ ...draft, groupName, groupCode, program, section });
        setSaved(true);
        setError("");
    };

    const handlePasswordReset = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        setResetError("");
        setResetSuccess("");

        if (newPassword !== confirmNewPassword) {
            setResetError("New passwords do not match. Please verify both fields.");
            return;
        }

        const result = resetPassword(currentPassword, newPassword);
        if (result.success) {
            setResetSuccess("Group account password has been updated successfully.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
        } else {
            setResetError(result.error || "Failed to update password.");
        }
    };

    const openResetModal = () => {
        setResetError("");
        setResetSuccess("");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setIsResetModalOpen(true);
    };

    return (
        <main className="student-page">
            <div className="page-header">
                <div>
                    <span className="eyebrow">Group information</span>
                    <h1>Profile</h1>
                    <p>Keep your group and representative details up to date for consultation follow-ups.</p>
                </div>
            </div>

            <div className="notice-banner">
                <Icon name="info" size={17} />
                <span>Profile changes are stored in this browser preview only and are not sent to the WIL office.</span>
            </div>

            <div className="profile-layout">
                <section className="panel profile-card">
                    <div className="profile-hero">
                        <div className="avatar large">{getInitials(draft.groupName)}</div>
                        <div>
                            <h2>{draft.groupName || "Your group"}</h2>
                            <p>{draft.program || "Program not set"} · {draft.section || "Section not set"} · {draft.groupCode || "2526-sem2-cs342-01"}</p>
                            <span><i /> Student group workspace</span>
                        </div>
                    </div>
                    <form onSubmit={submit}>
                        <div className="profile-fields">
                            <label htmlFor="profile-group">Group name *
                                <div><Icon name="users" size={16} /><input id="profile-group" value={draft.groupName} onChange={(event) => update("groupName", event.target.value)} required maxLength={80} /></div>
                            </label>
                            <label htmlFor="profile-group-code">Group code
                                <div className="readonly-field" title="Group code cannot be edited">
                                    <Icon name="hash" size={16} />
                                    <input id="profile-group-code" value={draft.groupCode} readOnly tabIndex={-1} />
                                </div>
                            </label>
                            <label htmlFor="profile-program">Program *
                                <div><Icon name="grid" size={16} /><input id="profile-program" value={draft.program} onChange={(event) => update("program", event.target.value)} required maxLength={40} /></div>
                            </label>
                            <label htmlFor="profile-section">Section *
                                <div><Icon name="hash" size={16} /><input id="profile-section" value={draft.section} onChange={(event) => update("section", event.target.value)} required maxLength={30} /></div>
                            </label>
                            <label htmlFor="profile-representative">Group representative
                                <div><Icon name="user" size={16} /><input id="profile-representative" value={draft.representative} onChange={(event) => update("representative", event.target.value)} maxLength={100} placeholder="Full name" /></div>
                            </label>
                            <label htmlFor="profile-email">Contact email
                                <div><Icon name="mail" size={16} /><input id="profile-email" type="email" value={draft.email} onChange={(event) => update("email", event.target.value)} maxLength={160} placeholder="name@example.com" /></div>
                            </label>
                        </div>
                        {error && <div className="form-error profile-message" role="alert"><Icon name="info" size={16} />{error}</div>}
                        {saved && <div className="form-success profile-message" role="status"><Icon name="check" size={16} />Changes saved.</div>}
                        <div className="profile-footer">
                            <p><Icon name="shield" size={15} />Only the fields above are editable in this preview.</p>
                            <button className="primary-button" type="submit"><Icon name="check" size={16} />Save changes</button>
                        </div>
                    </form>
                </section>

                <aside>
                    <section className="panel security-card">
                        <div className="large-icon"><Icon name="shield" size={21} /></div>
                        <h2>Group account</h2>
                        <p>Use the group account supplied by your administrator. Do not share its password outside your team.</p>
                        <div>
                            <span>Consultation bookings</span>
                            <strong>{bookings.length} record{bookings.length === 1 ? "" : "s"} in this workspace</strong>
                        </div>
                        <button className="secondary-button full" type="button" onClick={() => navigate("/student/bookings")}>
                            <Icon name="file" size={16} />View my bookings
                        </button>
                        <button className="secondary-button full support-action" type="button" onClick={() => navigate("/student/support")}>
                            <Icon name="info" size={16} />Account support
                        </button>
                    </section>

                    <section className="panel danger-zone-card">
                        <div className="danger-zone-header">
                            <Icon name="danger" size={16} />
                            <h3>Danger zone</h3>
                        </div>
                        <p className="danger-zone-desc">
                            Updates credentials for all group members. Requires current password.
                        </p>
                        <button
                            type="button"
                            className="danger-zone-btn"
                            onClick={openResetModal}
                        >
                            Reset password
                        </button>
                    </section>
                </aside>
            </div>

            {/* Centered password reset modal with blurred backdrop */}
            {isResetModalOpen && (
                <div
                    className="modal-backdrop"
                    onClick={() => setIsResetModalOpen(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-reset-title"
                >
                    <div
                        className="password-reset-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <div className="modal-title-wrap">
                                <div className="reset-modal-icon">
                                    <Icon name="lock" size={18} />
                                </div>
                                <div>
                                    <h2 id="modal-reset-title">Reset password</h2>
                                    <p>Change your group account login password</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="modal-close-button"
                                onClick={() => setIsResetModalOpen(false)}
                                aria-label="Close dialog"
                            >
                                <Icon name="close" size={15} />
                            </button>
                        </div>

                        <form onSubmit={handlePasswordReset} className="modal-body">
                            <p className="modal-description">
                                Enter your current password to authenticate, then set a new password for your group account.
                            </p>

                            <div className="reset-field">
                                <label htmlFor="modal-curr-pass">Current password</label>
                                <div className="reset-input">
                                    <Icon name="lock" size={16} />
                                    <input
                                        id="modal-curr-pass"
                                        type={showPasswords ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Enter current password"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="reset-field">
                                <label htmlFor="modal-new-pass">New password</label>
                                <div className="reset-input">
                                    <Icon name="lock" size={16} />
                                    <input
                                        id="modal-new-pass"
                                        type={showPasswords ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="At least 6 characters"
                                        minLength={6}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="reset-field">
                                <label htmlFor="modal-confirm-pass">Confirm new password</label>
                                <div className="reset-input">
                                    <Icon name="lock" size={16} />
                                    <input
                                        id="modal-confirm-pass"
                                        type={showPasswords ? "text" : "password"}
                                        value={confirmNewPassword}
                                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                                        placeholder="Repeat new password"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="reset-toggle-wrap">
                                <button
                                    type="button"
                                    className="text-button"
                                    onClick={() => setShowPasswords(!showPasswords)}
                                >
                                    <Icon name="eye" size={14} />
                                    <span>{showPasswords ? "Hide passwords" : "Show passwords"}</span>
                                </button>
                            </div>

                            {resetError && (
                                <div className="form-error reset-message" role="alert">
                                    <Icon name="info" size={15} />
                                    <span>{resetError}</span>
                                </div>
                            )}

                            {resetSuccess && (
                                <div className="form-success reset-message" role="status">
                                    <Icon name="check" size={15} />
                                    <span>{resetSuccess}</span>
                                </div>
                            )}

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="modal-cancel-btn"
                                    onClick={() => setIsResetModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button className="primary-button reset-submit-btn" type="submit">
                                    <Icon name="lock" size={15} />
                                    Update password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
