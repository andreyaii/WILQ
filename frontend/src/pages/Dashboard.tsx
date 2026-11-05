import type { ReactNode } from "react";
import { useNavigate } from "react-router";

type IconName =
    | "file"
    | "clock"
    | "check"
    | "trend"
    | "calendar"
    | "user"
    | "arrow"
    | "info";

const paths: Record<IconName, ReactNode> = {
    file: (
        <>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6M8 13h8M8 17h6" />
        </>
    ),
    clock: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
        </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    trend: (
        <>
            <path d="m3 17 6-6 4 4 8-9" />
            <path d="M15 6h6v6" />
        </>
    ),
    calendar: (
        <>
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M16 3v4M8 3v4M3 10h18" />
        </>
    ),
    user: (
        <>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
        </>
    ),
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    info: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5M12 8h.01" />
        </>
    ),
};

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {paths[name]}
        </svg>
    );
}

function PageHeader({
    eyebrow,
    title,
    description,
    action,
}: {
    eyebrow?: string;
    title: string;
    description: string;
    action?: ReactNode;
}) {
    return (
        <div className="page-header">
            <div>
                {eyebrow && <span className="eyebrow">{eyebrow}</span>}
                <h1>{title}</h1>
                <p>{description}</p>
            </div>

            {action}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    return (
        <span className={`status status-${status.toLowerCase()}`}>
            <i />
            {status}
        </span>
    );
}

export default function Dashboard() {
    const navigate = useNavigate();

    return (
        <main className="dashboard-page">
            <PageHeader
                eyebrow="Tuesday, May 20"
                title="Good morning, Group Pixel"
                description="Here’s an overview of your consultation activity and upcoming schedule."
                action={
                    <button
                        className="primary-button"
                        onClick={() => navigate("/student/slots")}
                    >
                        <Icon name="calendar" size={18} />
                        Book a consultation
                    </button>
                }
            />

            <section className="stats-grid">
                {[
                    {
                        label: "Total bookings",
                        value: "08",
                        note: "This academic year",
                        icon: "file" as IconName,
                        tone: "blue",
                    },
                    {
                        label: "Pending review",
                        value: "01",
                        note: "Awaiting confirmation",
                        icon: "clock" as IconName,
                        tone: "amber",
                    },
                    {
                        label: "Approved",
                        value: "05",
                        note: "Ready or completed",
                        icon: "check" as IconName,
                        tone: "green",
                    },
                ].map((stat) => (
                    <article className="stat-card" key={stat.label}>
                        <div className={`stat-icon ${stat.tone}`}>
                            <Icon name={stat.icon} />
                        </div>

                        <div>
                            <span>{stat.label}</span>
                            <strong>{stat.value}</strong>
                            <small>{stat.note}</small>
                        </div>
                    </article>
                ))}

                <article className="stat-card activity-card">
                    <div className="stat-icon violet">
                        <Icon name="trend" />
                    </div>

                    <div>
                        <span>Completion rate</span>
                        <strong>88%</strong>
                        <small>7 of 8 consultations</small>
                    </div>
                </article>
            </section>

            <section className="dashboard-grid">
                <article className="panel upcoming-panel">
                    <div className="panel-heading">
                        <div>
                            <span className="eyebrow">Next consultation</span>
                            <h2>Thursday, May 22</h2>
                        </div>

                        <StatusBadge status="Approved" />
                    </div>

                    <div className="schedule-block">
                        <div className="date-tile">
                            <span>MAY</span>
                            <strong>22</strong>
                            <small>THU</small>
                        </div>

                        <div className="schedule-info">
                            <h3>System Architecture Review</h3>

                            <p>
                                <Icon name="clock" size={17} />
                                10:00–10:30 AM
                                <span>•</span>
                                Room 304, IT Building
                            </p>

                            <p>
                                <Icon name="user" size={17} />
                                Prof. Elena Reyes
                            </p>
                        </div>
                    </div>

                    <div className="queue-strip">
                        <div>
                            <span>Your queue number</span>
                            <strong>#03</strong>
                        </div>

                        <div>
                            <span>Currently serving</span>
                            <strong>#01</strong>
                        </div>

                        <div className="progress-info">
                            <span>Estimated wait</span>
                            <strong>~ 25 min</strong>

                            <div className="progress">
                                <i />
                            </div>
                        </div>
                    </div>

                    <div className="panel-footer">
                        <span>
                            <Icon name="info" size={16} />
                            Queue updates will appear here on consultation day.
                        </span>

                        <button
                            className="text-button"
                            onClick={() =>
                                navigate("/student/bookings/CS-2025-041")
                            }
                        >
                            View details
                            <Icon name="arrow" size={16} />
                        </button>
                    </div>
                </article>

                <article className="panel activity-panel">
                    <div className="panel-heading">
                        <div>
                            <span className="eyebrow">Latest updates</span>
                            <h2>Recent activity</h2>
                        </div>

                        <button
                            className="text-button"
                            onClick={() => navigate("/student/bookings")}
                        >
                            View all
                        </button>
                    </div>

                    <div className="activity-list">
                        <div className="activity-item">
                            <div className="activity-dot green">
                                <Icon name="check" size={16} />
                            </div>

                            <div>
                                <strong>Booking approved</strong>
                                <p>
                                    Your May 22 consultation has been approved.
                                </p>
                                <span>2 hours ago</span>
                            </div>
                        </div>

                        <div className="activity-item">
                            <div className="activity-dot blue">
                                <Icon name="file" size={16} />
                            </div>

                            <div>
                                <strong>Booking submitted</strong>
                                <p>Reference CS-2025-038 is under review.</p>
                                <span>May 16, 2025</span>
                            </div>
                        </div>

                        <div className="activity-item">
                            <div className="activity-dot gray">
                                <Icon name="check" size={16} />
                            </div>

                            <div>
                                <strong>Consultation completed</strong>
                                <p>System requirements review was completed.</p>
                                <span>May 8, 2025</span>
                            </div>
                        </div>
                    </div>
                </article>
            </section>
        </main>
    );
}
