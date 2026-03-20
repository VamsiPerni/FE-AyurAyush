import { useState } from "react";
import {
    showErrorToast,
    showSuccessToast,
} from "../../utils/toastMessageHelper";
import { Link, useNavigate } from "react-router";
import { axiosInstance } from "../../axios/axiosInstance";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { UserPlus } from "lucide-react";

const SignupPage = () => {
    const [loading, setLoading] = useState(false);
    const [sendingOTP, setSendingOTP] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        gender: "",
        dob: "",
        password: "",
        otp: "",
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCheckAndSendOtp = async () => {
        if (!form.email) {
            showErrorToast("Please enter your email first");
            return;
        }

        try {
            setSendingOTP(true);

            const checkResponse = await axiosInstance.get(
                `/auth/check-email?email=${encodeURIComponent(form.email)}`,
            );

            if (checkResponse.data.exists) {
                showErrorToast("User already exists! Please login.");
                return;
            }

            await axiosInstance.post("/otps", { email: form.email });
            showSuccessToast("OTP sent to your email!");
            setIsOtpSent(true);
        } catch (err) {
            showErrorToast(
                err.response?.data?.message ||
                    `Unable to send OTP: ${err.message}`,
            );
        } finally {
            setSendingOTP(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isOtpSent) return;

        try {
            setLoading(true);

            await axiosInstance.post("/auth/signup", {
                name: form.name,
                email: form.email,
                phone: form.phone,
                gender: form.gender,
                dob: form.dob,
                password: form.password,
                otp: form.otp,
            });

            showSuccessToast("Signup Success!");
            navigate("/login");
        } catch (err) {
            showErrorToast(
                err.response?.data?.message ||
                    `Unable to signup: ${err.message}`,
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
            <Card className="w-full max-w-md">
                <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-[#065A82]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <UserPlus size={28} className="text-[#065A82]" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Create Account
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Join AyurAyush today
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Full Name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                    />

                    <div className="flex gap-2 items-end">
                        <div className="flex-1">
                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                required
                                readOnly={isOtpSent}
                            />
                        </div>
                        {!isOtpSent && (
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={handleCheckAndSendOtp}
                                loading={sendingOTP}
                                className="mb-[2px]"
                            >
                                Get OTP
                            </Button>
                        )}
                    </div>

                    {isOtpSent && (
                        <>
                            <Input
                                label="OTP"
                                name="otp"
                                value={form.otp}
                                onChange={handleChange}
                                placeholder="Enter 6-digit OTP"
                                required
                            />

                            <Input
                                label="Password"
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                            />
                        </>
                    )}

                    <Input
                        label="Phone"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+91 XXXXX XXXXX"
                        required
                    />

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">
                            Gender <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="gender"
                            value={form.gender}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1C7293]/30 focus:border-[#1C7293] outline-none"
                        >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <Input
                        label="Date of Birth"
                        name="dob"
                        type="date"
                        value={form.dob}
                        onChange={handleChange}
                        required
                    />

                    {isOtpSent && (
                        <Button
                            type="submit"
                            className="w-full"
                            loading={loading}
                        >
                            Create Account
                        </Button>
                    )}
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-[#065A82] font-medium hover:underline"
                    >
                        Sign in here
                    </Link>
                </p>
            </Card>
        </div>
    );
};

export { SignupPage };
