import { useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router";
import {
    type Route as AppRoute,
    StudentSidebar,
    StudentTopbar,
} from "../components/Navbar";
import { StudentDataProvider } from "../context/StudentDataContext";
import Bookings from "../pages/common/Bookings";
import Dashboard from "../pages/common/Dashboard";
import Landing from "../pages/common/Landing";
import Profile from "../pages/common/Profile";
import BookingConfirmation from "../pages/studentgroup/BookingConfirmation";
import BookingDetails from "../pages/studentgroup/BookingDetails";
import Slots from "../pages/studentgroup/Slots";
import Support from "../pages/studentgroup/Support";
import ScrollToTop from "./ScrollToTop";

export default function Routing() {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const isStudentPage = location.pathname.startsWith("/student");

    const handleNavigate = (path: AppRoute) => {
        navigate(path);
    };

    return (
        <StudentDataProvider>
            <ScrollToTop />
            {isStudentPage ? (
                <div className="student-layout">
                    <StudentSidebar
                        route={location.pathname}
                        navigate={handleNavigate}
                        mobileOpen={mobileOpen}
                        onClose={() => setMobileOpen(false)}
                    />
                    <div className="student-main">
                        <StudentTopbar
                            onOpen={() => setMobileOpen(true)}
                            navigate={handleNavigate}
                        />
                        <div className="student-content">
                            <Routes>
                                <Route
                                    path="/student/dashboard"
                                    element={<Dashboard />}
                                />
                                <Route
                                    path="/student/slots"
                                    element={<Slots />}
                                />
                                <Route
                                    path="/student/booking-confirmation"
                                    element={<BookingConfirmation />}
                                />
                                <Route
                                    path="/student/booking-confirmation/review"
                                    element={<BookingConfirmation isReview />}
                                />
                                <Route
                                    path="/student/bookings"
                                    element={<Bookings />}
                                />
                                <Route
                                    path="/student/bookings/:bookingId"
                                    element={<BookingDetails />}
                                />
                                <Route
                                    path="/student/profile"
                                    element={<Profile />}
                                />
                                <Route
                                    path="/student/support"
                                    element={<Support />}
                                />
                                <Route path="*" element={<Dashboard />} />
                            </Routes>
                        </div>
                    </div>
                </div>
            ) : (
                <Routes>
                    <Route
                        path="/"
                        element={
                            <Landing
                                onLogin={() => navigate("/student/dashboard")}
                            />
                        }
                    />
                    <Route
                        path="/login"
                        element={
                            <Landing
                                onLogin={() => navigate("/student/dashboard")}
                            />
                        }
                    />
                    <Route
                        path="*"
                        element={
                            <Landing
                                onLogin={() => navigate("/student/dashboard")}
                            />
                        }
                    />
                </Routes>
            )}
        </StudentDataProvider>
    );
}
