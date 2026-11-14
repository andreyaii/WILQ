import { useNavigate } from "react-router";
import { Icon } from "./Icon.tsx";

type BookingStepperProps = {
    currentStep: 1 | 2 | 3;
    onStepClick?: (step: 1 | 2) => void;
};

const steps = ["Select a slot", "Booking details", "Confirmation"] as const;

export default function BookingStepper({ currentStep, onStepClick }: BookingStepperProps) {
    const navigate = useNavigate();

    return (
        <nav className="stepper" aria-label="Booking steps">
            {steps.map((label, index) => {
                const step = index + 1;
                const isDone = step < currentStep;
                const isActive = step === currentStep;
                const connectorDone = index < currentStep;
                const content = isDone
                    ? <Icon name="check" size={13} />
                    : step;

                return (
                    <span className="stepper-item" key={label}>
                        {index > 0 && <b className={connectorDone ? "done" : ""} aria-hidden="true" />}
                        {isDone ? (
                            <button
                                className="step done step-link"
                                type="button"
                                onClick={() => {
                                    if (step === 1) {
                                        if (onStepClick) {
                                            onStepClick(1);
                                        } else {
                                            navigate("/student/slots");
                                        }
                                    } else {
                                        onStepClick?.(2);
                                    }
                                }}
                            >
                                <i>{content}</i>
                                <span>{label}</span>
                            </button>
                        ) : (
                            <span
                                className={"step" + (isDone ? " done" : "") + (isActive ? " active" : "")}
                                aria-current={isActive ? "step" : undefined}
                            >
                                <i>{content}</i>
                                <span>{label}</span>
                            </span>
                        )}
                    </span>
                );
            })}
        </nav>
    );
}
