import { useState } from "react";
import { CreditCard, CheckCircle } from "lucide-react";
import { Button } from "../ui/Button";
import { paymentService } from "../../services/paymentService";
import {
    showErrorToast,
    showSuccessToast,
} from "../../utils/toastMessageHelper";

const loadRazorpayScript = () =>
    new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

const PaymentButton = ({ appointmentId, amount, onSuccess }) => {
    const [loading, setLoading] = useState(false);

    const handlePay = async () => {
        try {
            setLoading(true);

            const loaded = await loadRazorpayScript();
            if (!loaded) {
                showErrorToast(
                    "Payment gateway failed to load. Check your internet connection.",
                );
                return;
            }

            // Create order server-side
            const orderRes = await paymentService.createOrder(appointmentId);
            const order = orderRes.data;

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "AyurAyush",
                description: "Consultation Fee",
                order_id: order.orderId,
                prefill: order.prefill,
                theme: { color: "#16a34a" },
                handler: async (response) => {
                    try {
                        await paymentService.verifyPayment({
                            appointmentId,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                        });
                        showSuccessToast("Payment successful!");
                        onSuccess?.();
                    } catch {
                        showErrorToast(
                            "Payment verification failed. Contact support if amount was deducted.",
                        );
                    }
                },
                modal: {
                    ondismiss: () => setLoading(false),
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", () => {
                showErrorToast("Payment failed. Please try again.");
                setLoading(false);
            });
            rzp.open();
        } catch (err) {
            showErrorToast(
                err.response?.data?.message || "Failed to initiate payment.",
            );
            setLoading(false);
        }
    };

    return (
        <Button
            icon={CreditCard}
            onClick={handlePay}
            loading={loading}
            variant="primary"
        >
            Pay ₹{amount ?? ""}
        </Button>
    );
};

const PaymentPaidBadge = () => (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/50 text-sm font-semibold">
        <CheckCircle className="w-4 h-4" />
        Paid
    </span>
);

export { PaymentButton, PaymentPaidBadge };
export default PaymentButton;
