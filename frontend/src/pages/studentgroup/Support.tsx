import { useNavigate } from "react-router";
import { Icon } from "../../components/Icon.tsx";

const items = [
    {
        title: "Booking or schedule concern",
        text: "Keep your booking reference, group name, selected date, and time ready when asking the WIL office for help.",
    },
    {
        title: "Change, cancellation, or delay",
        text: "Check My Bookings for the latest status first. If a consultation is delayed, paused, or ended early, confirm the updated schedule with the office or facilitator.",
    },
    {
        title: "Group account access",
        text: "Ask the WIL office or the person who issued your group credentials to assist with access. Never send your password in a support request.",
    },
];

export default function Support() {
    const navigate = useNavigate();

    return (
        <main className="student-page">
            <div className="page-header">
                <div>
                    <span className="eyebrow">Help center</span>
                    <h1>Support details</h1>
                    <p>Find the right information before you follow up on a booking or group account issue.</p>
                </div>
                <button className="secondary-button" type="button" onClick={() => navigate("/student/dashboard")}>
                    <Icon name="arrow" size={16} />Back to dashboard
                </button>
            </div>

            <section className="panel support-intro">
                <div className="support-intro-icon"><Icon name="info" size={23} /></div>
                <div>
                    <span className="eyebrow">Student group assistance</span>
                    <h2>Approach the WIL office</h2>
                    <p>Office Hours 8:00AM - 5:00PM</p>
                </div>
            </section>

            <div className="support-grid">
                {items.map((item, index) => (
                    <article className="panel support-card" key={item.title}>
                        <div className="support-card-number">0{index + 1}</div>
                        <h2>{item.title}</h2>
                        <p>{item.text}</p>
                        {index === 0 && <button className="text-button" type="button" onClick={() => navigate("/student/bookings")}>Open my bookings <Icon name="arrow" size={15} /></button>}
                        {index === 2 && <button className="text-button" type="button" onClick={() => navigate("/student/profile")}>Review group profile <Icon name="arrow" size={15} /></button>}
                    </article>
                ))}
            </div>

            <section className="panel support-faq">
                <div className="panel-heading">
                    <div><span className="eyebrow">Quick answers</span><h2>Before reaching out</h2></div>
                </div>
                <details>
                    <summary>Why is my booking still pending?</summary>
                    <p>Pending means no approval decision has been recorded in this workspace. Contact the WIL office to confirm the status in the official schedule.</p>
                </details>
                <details>
                    <summary>Where can I find my booking reference?</summary>
                    <p>Open My Bookings and choose View details. Include the reference when following up on a specific request.</p>
                </details>
                <details>
                    <summary>How do I reschedule or cancel my consultation?</summary>
                    <p>You can cancel an active booking directly from the My Bookings page. Once cancelled, you may select another available slot that suits your group.</p>
                </details>
            </section>

            <p className="workspace-disclaimer">Support details are informational. Verify contact numbers, email addresses, and office hours through official WIL channels.</p>
        </main>
    );
}
