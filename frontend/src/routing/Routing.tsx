
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'

import Landing from '../pages/Landing'
import Dashboard from '../pages/Dashboard'

import {
    StudentSidebar,
    StudentTopbar,
    type Route as AppRoute
} from '../components/Navbar'

import ScrollToTop from './ScrollToTop'

export default function Routing() {
    const navigate = useNavigate()
    const location = useLocation()

    const [mobileOpen, setMobileOpen] = useState(false)

    const isStudentPage = location.pathname.startsWith('/student')

    const handleNavigate = (path: AppRoute) => {
        navigate(path)
    }

    return (
        <>
            <ScrollToTop />

            {isStudentPage ? (
                <div className="student-layout">

                    <StudentSidebar
                        route={location.pathname as AppRoute}
                        navigate={handleNavigate}
                        mobileOpen={mobileOpen}
                        onClose={() => setMobileOpen(false)}
                    />

                    <div className="student-main">

                        <StudentTopbar
                            onOpen={() => setMobileOpen(true)}
                        />

                        <div className="student-content">
                            <Routes>
                                <Route
                                    path="/student/dashboard"
                                    element={<Dashboard />}
                                />
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
                                onLogin={() =>
                                    navigate('/student/dashboard')
                                }
                            />
                        }
                    />
                </Routes>
            )}
        </>
    )
}
