import { Route, Routes, useNavigate } from "react-router";
import Dashboard from "../pages/common/Dashboard.tsx";
import Landing from "../pages/common/Landing.tsx";

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
