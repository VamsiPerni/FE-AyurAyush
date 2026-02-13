import { Routes, Route } from "react-router";
import { PublicLayout } from "../layouts/PublicLayout";
import { PrivateLayout } from "../layouts/PrivateLayout";
import { ProtectedRoute } from "../components/ProtectedRoute";

import { LoginPage } from "../pages/Auth/LoginPage";
import { SignupPage } from "../pages/Auth/SignupPage";
import { HomePage } from "../pages/Common/HomePage";

import { PatientDashboardPage } from "../pages/Patient/PatientDashboardPage";
import { DoctorDashboardPage } from "../pages/Doctor/DoctorDashboardPage";
import { AdminDashboardPage } from "../pages/Admin/AdminDashboardPage";

import { ChooseRolePage } from "../pages/Common/ChooseRolePage";

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
            </Route>

            <Route element={<PrivateLayout />}>
                <Route
                    path="/choose-role"
                    element={
                        <ProtectedRoute>
                            <ChooseRolePage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/patient/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["patient"]}>
                            <PatientDashboardPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/doctor/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["doctor"]}>
                            <DoctorDashboardPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminDashboardPage />
                        </ProtectedRoute>
                    }
                />
            </Route>
        </Routes>
    );
};

export { AppRoutes };
