import { Routes, Route } from "react-router";
import { PublicLayout } from "../layouts/PublicLayout";
import { PrivateLayout } from "../layouts/PrivateLayout";
import { ProtectedRoute } from "../components/ProtectedRoute";

import { LoginPage } from "../pages/Auth/LoginPage";
import { SignupPage } from "../pages/Auth/SignupPage";
import { ForgotPasswordPage } from "../pages/Auth/ForgotPasswordPage";
import { ResetPasswordPage } from "../pages/Auth/ResetPasswordPage";
import { ChangePasswordPage } from "../pages/Auth/ChangePasswordPage";
import { HomePage } from "../pages/Common/HomePage";
import { NotFoundPage } from "../pages/Common/NotFoundPage";
import { ChooseRolePage } from "../pages/Common/ChooseRolePage";

import { PatientDashboardPage } from "../pages/Patient/PatientDashboardPage";
import { ChatbotPage } from "../pages/Patient/ChatbotPage";
import { BookAppointmentPage } from "../pages/Patient/BookAppointmentPage";
import { MyAppointmentsPage } from "../pages/Patient/MyAppointmentsPage";
import { AppointmentDetailsPage } from "../pages/Patient/AppointmentDetailsPage";
import { PatientProfilePage } from "../pages/Patient/PatientProfilePage";

import { DoctorDashboardPage } from "../pages/Doctor/DoctorDashboardPage";
import { TodayAppointmentsPage } from "../pages/Doctor/TodayAppointmentsPage";
import { AllAppointmentsPage } from "../pages/Doctor/AllAppointmentsPage";
import { AppointmentDetailPage } from "../pages/Doctor/AppointmentDetailPage";
import { TreatmentReferencePage } from "../pages/Doctor/TreatmentReferencePage";
import { DoctorProfilePage } from "../pages/Doctor/DoctorProfilePage";

import { AdminDashboardPage } from "../pages/Admin/AdminDashboardPage";
import { AppointmentQueuesPage } from "../pages/Admin/AppointmentQueuesPage";
import { DoctorApplicationsPage } from "../pages/Admin/DoctorApplicationsPage";
import { ManageDoctorsPage } from "../pages/Admin/ManageDoctorsPage";
import { DoctorAvailabilityPage } from "../pages/Admin/DoctorAvailabilityPage";
import { OfflineBookingPage } from "../pages/Admin/OfflineBookingPage";
import { CreateDoctorAccountPage } from "../pages/Admin/CreateDoctorAccountPage";

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route
                    path="/forgot-password"
                    element={<ForgotPasswordPage />}
                />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            <Route element={<PrivateLayout />}>
                <Route
                    path="/change-password"
                    element={
                        <ProtectedRoute allowMustChangePasswordBypass>
                            <ChangePasswordPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/choose-role"
                    element={
                        <ProtectedRoute>
                            <ChooseRolePage />
                        </ProtectedRoute>
                    }
                />

                {/* Patient Routes */}
                <Route
                    path="/patient/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["patient"]}>
                            <PatientDashboardPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/patient/chatbot"
                    element={
                        <ProtectedRoute allowedRoles={["patient"]}>
                            <ChatbotPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/patient/book-appointment"
                    element={
                        <ProtectedRoute allowedRoles={["patient"]}>
                            <BookAppointmentPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/patient/appointments"
                    element={
                        <ProtectedRoute allowedRoles={["patient"]}>
                            <MyAppointmentsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/patient/appointments/:appointmentId"
                    element={
                        <ProtectedRoute allowedRoles={["patient"]}>
                            <AppointmentDetailsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/patient/profile"
                    element={
                        <ProtectedRoute allowedRoles={["patient"]}>
                            <PatientProfilePage />
                        </ProtectedRoute>
                    }
                />

                {/* Doctor Routes */}
                <Route
                    path="/doctor/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["doctor"]}>
                            <DoctorDashboardPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/doctor/today"
                    element={
                        <ProtectedRoute allowedRoles={["doctor"]}>
                            <TodayAppointmentsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/doctor/appointments"
                    element={
                        <ProtectedRoute allowedRoles={["doctor"]}>
                            <AllAppointmentsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/doctor/appointments/:appointmentId"
                    element={
                        <ProtectedRoute allowedRoles={["doctor"]}>
                            <AppointmentDetailPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/doctor/reference"
                    element={
                        <ProtectedRoute allowedRoles={["doctor"]}>
                            <TreatmentReferencePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/doctor/profile"
                    element={
                        <ProtectedRoute allowedRoles={["doctor"]}>
                            <DoctorProfilePage />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Routes */}
                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminDashboardPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/queues"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <AppointmentQueuesPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/doctor-applications"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <DoctorApplicationsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/doctors"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <ManageDoctorsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/doctors/create"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <CreateDoctorAccountPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/create-doctor"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <CreateDoctorAccountPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/doctors/:doctorId/availability"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <DoctorAvailabilityPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/offline-booking"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <OfflineBookingPage />
                        </ProtectedRoute>
                    }
                />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};

export { AppRoutes };
