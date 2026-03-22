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
        color: "#02C39A",
    },
    {
        icon: CalendarCheck,
        title: "Smart Scheduling",
        desc: "Book appointments with real-time slot availability and admin approval workflow.",
        color: "#065A82",
    },
    {
        icon: ShieldCheck,
        title: "Emergency Detection",
        desc: "AI-powered urgency classification with priority queue for critical cases.",
        color: "#DC2626",
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
            <section className="bg-gradient-to-br from-[#065A82] via-[#1C7293] to-[#02C39A] text-white">
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
                                    variant="outline"
                                    className="bg-[#0B4F6C] text-[#F5FBFF] border-[#7EC8E3] hover:bg-[#093E55]"
                                >
                                    Go to Dashboard <ArrowRight size={16} />
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link to="/signup">
                                    <Button
                                        size="lg"
                                        className="bg-[#0B4F6C] text-[#F5FBFF] border border-[#7EC8E3] hover:bg-[#093E55]"
                                    >
                                        Get Started <ArrowRight size={16} />
                                    </Button>
                                </Link>
                                <Link to="/login">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="border-[#CFEFFF] text-[#F5FBFF] bg-white/10 hover:bg-white/20"
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
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
                    Why AyurAyush?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((f) => (
                        <div
                            key={f.title}
                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition"
                        >
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                                style={{ backgroundColor: `${f.color}15` }}
                            >
                                <f.icon size={24} style={{ color: f.color }} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {f.title}
                            </h3>
                            <p className="text-sm text-gray-600">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-100 py-6 text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} AyurAyush — AI-Powered
                Healthcare
            </footer>
        </div>
    );
};

export { HomePage };
