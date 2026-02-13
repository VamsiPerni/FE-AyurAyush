import { useState } from "react";
import { PuffLoader } from "react-spinners";
import {
    showErrorToast,
    showSuccessToast,
} from "../../utils/toastMessageHelper";
import { Link, useNavigate } from "react-router";

const SignupPage = () => {
    const [loading, setLoading] = useState(false);
    const [sendingOTP, setSendingOTP] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);

    const navigate = useNavigate();

    const handleCheckAndSendOtp = async (email) => {
        try {
            setSendingOTP(true);

            // 1️⃣ Check if email exists
            const checkResponse = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/auth/check-email?email=${email}`,
            );

            const checkResult = await checkResponse.json();

            if (checkResult.exists) {
                showErrorToast("User already exists! Please login.");
                return;
            }

            // 2️⃣ Send OTP
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/otps`,
                {
                    method: "POST",
                    body: JSON.stringify({ email }),
                    headers: {
                        "content-type": "application/json",
                    },
                },
            );

            if (response.status === 201) {
                showSuccessToast("OTP sent to your email!");
                setIsOtpSent(true);
            } else {
                const result = await response.json();
                showErrorToast(result.message);
            }
        } catch (err) {
            showErrorToast(`Unable to send OTP: ${err.message}`);
        } finally {
            setSendingOTP(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isOtpSent) return;

        try {
            setLoading(true);

            const name = e.target.name.value;
            const email = e.target.email.value;
            const phone = e.target.phone.value;
            const gender = e.target.gender.value;
            const dob = e.target.dob.value;
            const password = e.target.password.value;
            const otp = e.target.otp.value;

            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/auth/signup`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        name,
                        email,
                        phone,
                        gender,
                        dob,
                        password,
                        otp,
                    }),
                    headers: {
                        "content-type": "application/json",
                    },
                },
            );

            const result = await response.json();

            if (response.status === 201) {
                showSuccessToast("Signup Success!");
                navigate("/login");
            } else {
                showErrorToast(result.message);
            }
        } catch (err) {
            showErrorToast(`Unable to signup: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
                <input
                    name="name"
                    placeholder="Name"
                    required
                    className="border px-2 py-1 rounded-md"
                />

                <div className="flex gap-2">
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        required
                        readOnly={isOtpSent}
                        className="border px-2 py-1 rounded-md flex-1"
                    />
                    {!isOtpSent && (
                        <button
                            type="button"
                            onClick={(e) =>
                                handleCheckAndSendOtp(e.target.form.email.value)
                            }
                            className="bg-blue-600 text-white px-3 rounded-md"
                        >
                            {sendingOTP ? "..." : "Get OTP"}
                        </button>
                    )}
                </div>

                {isOtpSent && (
                    <>
                        <input
                            name="otp"
                            placeholder="Enter OTP"
                            required
                            className="border px-2 py-1 rounded-md"
                        />

                        <input
                            name="password"
                            type="password"
                            placeholder="Password"
                            required
                            className="border px-2 py-1 rounded-md"
                        />
                    </>
                )}

                <input
                    name="phone"
                    placeholder="Phone"
                    required
                    className="border px-2 py-1 rounded-md"
                />

                <input
                    name="gender"
                    placeholder="Gender"
                    required
                    className="border px-2 py-1 rounded-md"
                />

                <input
                    name="dob"
                    type="date"
                    required
                    className="border px-2 py-1 rounded-md"
                />

                {loading ? (
                    <div className="flex justify-center">
                        <PuffLoader size={40} />
                    </div>
                ) : (
                    isOtpSent && (
                        <button className="bg-amber-600 text-white py-1 rounded-md hover:bg-amber-700 transition">
                            Signup
                        </button>
                    )
                )}
            </form>

            <Link to="/login" className="underline text-blue-600 mt-4">
                Already have an account? Login here
            </Link>
        </div>
    );
};

export { SignupPage };
