import { useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router";
import {
    type Route as AppRoute,
    StudentSidebar,
    StudentTopbar,
} from "../components/Navbar";
import BookingConfirmation from "../pages/BookingConfirmation";
import BookingDetails from "../pages/BookingDetails";
import Bookings from "../pages/Bookings";
import Dashboard from "../pages/Dashboard";
import Landing from "../pages/Landing";
import Profile from "../pages/Profile";
import Slots from "../pages/Slots";
import Support from "../pages/Support";
import { StudentDataProvider, useStudentData } from "../context/StudentDataContext";
import ScrollToTop from "./ScrollToTop";

function RoutingView() {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isAuthenticated } = useStudentData();
    const isStudentPage = location.pathname.startsWith("/student");

    const handleNavigate = (path: AppRoute) => {
        navigate(path);
    };

    if (isStudentPage && !isAuthenticated) {
        return (
            <Routes>
                <Route path="*" element={<Landing onLogin={() => navigate("/student/dashboard")} />} />
            </Routes>
        );
    }

    return (
        <>
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
                                <Route path="/student/dashboard" element={<Dashboard />} />
                                <Route path="/student/slots" element={<Slots />} />
                                <Route path="/student/booking-confirmation" element={<BookingConfirmation />} />
                                <Route path="/student/bookings" element={<Bookings />} />
                                <Route path="/student/bookings/:bookingId" element={<BookingDetails />} />
                                <Route path="/student/profile" element={<Profile />} />
                                <Route path="/student/support" element={<Support />} />
                                <Route path="*" element={<Dashboard />} />
                            </Routes>
                        </div>
                    </div>
                </div>
            ) : (
                <Routes>
                    <Route path="/" element={<Landing onLogin={() => navigate("/student/dashboard")} />} />
                    <Route path="/login" element={<Landing onLogin={() => navigate("/student/dashboard")} />} />
                    <Route path="*" element={<Landing onLogin={() => navigate("/student/dashboard")} />} />
                </Routes>
            )}
        </>
    );
}

export default function Routing() {
    return (
        <StudentDataProvider>
            <RoutingView />
        </StudentDataProvider>
    );
}
