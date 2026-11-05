import { Route, Routes, useNavigate } from 'react-router'
import Landing from '../pages/Landing'
import Dashboard from '../pages/Dashboard'

export default function MainContent() {
    const navigate = useNavigate()

    return (
        <Routes>
            <Route
                path="/"
                element={<Landing onLogin={() => navigate('/student/dashboard')} />}
            />

            <Route
                path="/student/dashboard"
                element={<Dashboard />}
            />
        </Routes>
    )
}