import { useEffect, useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router";
import { Icon } from "../components/Icon";
import { getInitials, type StudentProfile, useStudentData } from "../context/StudentDataContext";

export default function Profile() {
    const navigate = useNavigate();
    const { profile, updateProfile, bookings } = useStudentData();
    const [draft, setDraft] = useState<StudentProfile>(profile);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        setDraft(profile);
    }, [profile]);

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
                                <div><Icon name="hash" size={16} /><input id="profile-group-code" value={draft.groupCode} onChange={(event) => update("groupCode", event.target.value)} maxLength={60} /></div>
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
                        {saved && <div className="form-success profile-message" role="status"><Icon name="check" size={16} />Profile changes saved in this browser.</div>}
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
                </aside>
            </div>
        </main>
    );
}
