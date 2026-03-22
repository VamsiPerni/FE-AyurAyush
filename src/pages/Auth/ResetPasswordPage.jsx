import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { KeyRound } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { authService } from "../../services/authService";
import {
    showErrorToast,
    showSuccessToast,
} from "../../utils/toastMessageHelper";

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const defaultEmail = useMemo(() => searchParams.get("email") || "", [searchParams]);

    const [form, setForm] = useState({
        email: defaultEmail,
        otp: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.newPassword !== form.confirmPassword) {
            showErrorToast("New password and confirm password do not match");
            return;
        }

        try {
            setLoading(true);

            const result = await authService.resetPassword({
                email: form.email,
                otp: form.otp,
                newPassword: form.newPassword,
            });

            showSuccessToast(
                result?.message ||
                    "Password reset successfully. Please login with new password.",
            );

            navigate("/login");
        } catch (err) {
            showErrorToast(
                err.response?.data?.message ||
                    `Unable to reset password: ${err.message}`,
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <Card className="w-full max-w-md">
                <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-[#065A82]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <KeyRound size={28} className="text-[#065A82]" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Reset Password
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Verify OTP and set a new password
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        required
                    />

                    <Input
                        label="OTP"
                        name="otp"
                        value={form.otp}
                        onChange={handleChange}
                        placeholder="Enter OTP"
                        required
                    />

                    <Input
                        label="New Password"
                        name="newPassword"
                        type="password"
                        value={form.newPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                    />

                    <Input
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                    />

                    <Button type="submit" className="w-full" loading={loading}>
                        Reset Password
                    </Button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Need a new OTP?{" "}
                    <Link
                        to="/forgot-password"
                        className="text-[#065A82] font-medium hover:underline"
                    >
                        Forgot password
                    </Link>
                </p>
            </Card>
        </div>
    );
};

export { ResetPasswordPage };
