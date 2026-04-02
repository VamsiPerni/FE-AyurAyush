import { Link } from "react-router";
import { useAuthContext } from "../../contexts/AppContext";
import { Button } from "../../components/ui/Button";
import {
    Stethoscope,
    MessageSquare,
    CalendarCheck,
    ShieldCheck,
    ArrowRight,
} from "lucide-react";

const features = [
    {
        icon: MessageSquare,
        title: "AI Health Chatbot",
        desc: "Get instant health assessments powered by Google Gemini AI with emergency detection.",
        iconBg: "bg-success-50",
        iconColor: "text-success-600",
    },
    {
        icon: CalendarCheck,
        title: "Smart Scheduling",
        desc: "Book appointments with real-time slot availability and admin approval workflow.",
        iconBg: "bg-primary-50",
        iconColor: "text-primary-600",
    },
    {
        icon: ShieldCheck,
        title: "Emergency Detection",
        desc: "AI-powered urgency classification with priority queue for critical cases.",
        iconBg: "bg-error-50",
        iconColor: "text-error-600",
    },
];

const HomePage = () => {
    const { isLoggedIn, roles } = useAuthContext();

    const getDashboardLink = () => {
        if (!isLoggedIn || !roles?.length) return "/login";
        if (roles.length === 1) return `/${roles[0]}/dashboard`;
        return "/choose-role";
    };

    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="bg-linear-to-br from-primary-600 via-primary-500 to-success-600 text-white">
                <div className="max-w-6xl mx-auto px-4 py-20 md:py-28 text-center">
                    <div className="w-20 h-20 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Stethoscope size={40} className="text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        AyurAyush
                    </h1>
                    <p className="text-lg md:text-xl text-white/85 max-w-2xl mx-auto mb-8">
                        AI-powered Hospital Management System. Smart health
                        assessments, seamless appointment booking, and
                        comprehensive care management.
                    </p>
                    <div className="flex gap-4 justify-center">
                        {isLoggedIn ? (
                            <Link to={getDashboardLink()}>
                                <Button
                                    size="lg"
                                    variant="secondary"
                                    className="bg-primary-800 text-white border-primary-300 hover:bg-primary-900"
                                >
                                    Go to Dashboard <ArrowRight size={16} />
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link to="/signup">
                                    <Button
                                        size="lg"
                                        className="bg-primary-800 text-white border border-primary-300 hover:bg-primary-900"
                                    >
                                        Get Started <ArrowRight size={16} />
                                    </Button>
                                </Link>
                                <Link to="/login">
                                    <Button
                                        size="lg"
                                        variant="secondary"
                                        className="border-primary-100 text-white bg-white/10 hover:bg-white/20"
                                    >
                                        Sign In
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="max-w-6xl mx-auto px-4 py-16">
                <h2 className="text-2xl font-bold text-neutral-900 text-center mb-10">
                    Why AyurAyush?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((f) => (
                        <div
                            key={f.title}
                            className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition"
                        >
                            <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.iconBg}`}
                            >
                                <f.icon size={24} className={f.iconColor} />
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                                {f.title}
                            </h3>
                            <p className="text-sm text-neutral-600">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-neutral-100 py-6 text-center text-sm text-neutral-500">
                &copy; {new Date().getFullYear()} AyurAyush — AI-Powered
                Healthcare
            </footer>
        </div>
    );
};

export { HomePage };
