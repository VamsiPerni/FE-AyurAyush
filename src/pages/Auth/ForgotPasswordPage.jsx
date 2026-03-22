import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Mail } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { authService } from "../../services/authService";
import {
    showErrorToast,
    showSuccessToast,
} from "../../utils/toastMessageHelper";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            const result = await authService.forgotPassword(email);

            showSuccessToast(
                result?.message ||
                    "OTP sent to your email. Please continue to reset password.",
            );

            navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        } catch (err) {
            showErrorToast(
                err.response?.data?.message ||
                    `Unable to process forgot password: ${err.message}`,
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
                        <Mail size={28} className="text-[#065A82]" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Forgot Password
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Enter your email to receive an OTP
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                    />

                    <Button type="submit" className="w-full" loading={loading}>
                        Send OTP
                    </Button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Remember your password?{" "}
                    <Link
                        to="/login"
                        className="text-[#065A82] font-medium hover:underline"
                    >
                        Back to login
                    </Link>
                </p>
            </Card>
        </div>
    );
};

export { ForgotPasswordPage };
