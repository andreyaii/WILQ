import { Route, Routes, useNavigate } from "react-router";
import Dashboard from "../pages/Dashboard";
import Landing from "../pages/Landing";

export default function MainContent() {
    const navigate = useNavigate();

    return (
        <Routes>
            <Route
                path="/"
                element={
                    <Landing onLogin={() => navigate("/student/dashboard")} />
                }
            />

            <Route path="/student/dashboard" element={<Dashboard />} />
        </Routes>
    );
}
