import { Link, useNavigate } from "react-router";
import { useAuthContext } from "../../contexts/AppContext";
import { Button } from "../../components/ui/Button";
import { publicService } from "../../services/publicService";
import {
    Stethoscope,
    MessageSquare,
    CalendarCheck,
    ShieldCheck,
    ArrowRight,
    Bot,
    Activity,
    Clock,
    CheckCircle,
    AlertTriangle,
    User,
    Users,
    LayoutDashboard,
    HeartPulse,
    Leaf,
    Flower2,
    Star,
    ChevronLeft,
    ChevronRight,
    Fingerprint,
    Bell,
    Sparkles,
    PhoneCall,
    MapPin,
    Mail,
    Quote,
    Eye,
    Calendar,
    UserCircle,
    Award,
    Briefcase,
    IndianRupee,
    Waves,
    Feather,
    Brain,
    Zap,
    TrendingUp,
    Globe,
    Lock,
    Headphones,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

// ---------- Mock Data ----------
const reviewsData = [
    {
        id: "r1",
        name: "Rajesh K.",
        location: "Mumbai",
        rating: 5,
        quote: "The AI chatbot was incredibly accurate. My appointment was scheduled within minutes!",
        careType: "Normal",
        age: 42,
    },
    {
        id: "r2",
        name: "Sneha P.",
        location: "Delhi",
        rating: 5,
        quote: "Panchakarma therapy changed my life. The doctors are truly world-class.",
        careType: "Panchakarma",
        age: 35,
    },
    {
        id: "r3",
        name: "Vikram S.",
        location: "Bangalore",
        rating: 4,
        quote: "Emergency detection flagged my symptoms correctly. Fast and reliable system.",
        careType: "Normal",
        age: 58,
    },
    {
        id: "r4",
        name: "Anita M.",
        location: "Chennai",
        rating: 5,
        quote: "Loved the Ayurveda consultation. Very holistic approach to healing.",
        careType: "Ayurveda",
        age: 47,
    },
    {
        id: "r5",
        name: "Rohit V.",
        location: "Pune",
        rating: 5,
        quote: "Admin approval was quick, and I got a slot within 2 hours. Amazing!",
        careType: "Normal",
        age: 29,
    },
];

// ---------- Carousel Hook ----------
const useCarousel = (items, autoScrollInterval = 5000) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [itemsPerView, setItemsPerView] = useState(() => {
        if (typeof window === "undefined") return 1;
        if (window.innerWidth >= 1024) return 4;
        if (window.innerWidth >= 768) return 2;
        return 1;
    });
    const intervalRef = useRef(null);

    const updateItemsPerView = useCallback(() => {
        const width = window.innerWidth;
        if (width >= 1024) setItemsPerView(4);
        else if (width >= 768) setItemsPerView(2);
        else setItemsPerView(1);
    }, []);

    useEffect(() => {
        window.addEventListener("resize", updateItemsPerView);
        return () => window.removeEventListener("resize", updateItemsPerView);
    }, [updateItemsPerView]);

    const totalGroups = Math.max(1, items.length - itemsPerView + 1);
    const maxIndex = totalGroups - 1;

    const next = useCallback(() => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, [maxIndex]);

    const prev = useCallback(() => {
        setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    }, [maxIndex]);

    useEffect(() => {
        if (autoScrollInterval && !isPaused && items.length > itemsPerView) {
            intervalRef.current = setInterval(next, autoScrollInterval);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [next, autoScrollInterval, isPaused, items.length, itemsPerView]);

    const pauseAutoScroll = () => setIsPaused(true);
    const resumeAutoScroll = () => setIsPaused(false);

    const visibleItems = items.slice(currentIndex, currentIndex + itemsPerView);
    const hasControls = items.length > itemsPerView;

    return {
        visibleItems,
        next,
        prev,
        hasControls,
        pauseAutoScroll,
        resumeAutoScroll,
        currentIndex,
        itemsPerView,
    };
};

// ---------- Carousel Controls Component ----------
const CarouselControls = ({ onPrev, onNext, hasControls }) => {
    if (!hasControls) return null;
    return (
        <div className="flex gap-3">
            <button
                onClick={onPrev}
                aria-label="Previous slide"
                className="w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 text-gray-600 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-600 transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
                <ChevronLeft size={20} />
            </button>
            <button
                onClick={onNext}
                aria-label="Next slide"
                className="w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 text-gray-600 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-600 transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
};

// ---------- Section Entrance Animation Wrapper ----------
const Section = ({ children, className = "" }) => {
    return <div className={`animate-fade-in-up ${className}`}>{children}</div>;
};

// ---------- Main HomePage Component ----------
const HomePage = () => {
    const { isLoggedIn, roles, activeRole } = useAuthContext();

    useEffect(() => {
        const styleId = "home-page-animations";
        if (document.getElementById(styleId)) return;

        const styleSheet = document.createElement("style");
        styleSheet.id = styleId;
        styleSheet.textContent = `
    @keyframes fade-in-up {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
    }
    @keyframes float-delayed {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-15px); }
    }
    @keyframes float-slow {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
    }
    @keyframes pulse-slow {
        0%, 100% { opacity: 0.6; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.05); }
    }
    .animate-fade-in-up {
        animation: fade-in-up 0.7s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards;
    }
    .animate-float {
        animation: float 4s ease-in-out infinite;
    }
    .animate-float-delayed {
        animation: float-delayed 4s ease-in-out infinite 1s;
    }
    .animate-float-slow {
        animation: float-slow 5s ease-in-out infinite;
    }
    .animate-pulse-slow {
        animation: pulse-slow 4s ease-in-out infinite;
    }
    .animation-delay-2000 {
        animation-delay: 2s;
    }
    .animation-delay-100 {
        animation-delay: 0.1s;
    }
    .bg-grid-pattern {
        background-image: radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px);
        background-size: 20px 20px;
    }
    .bg-grid-white\\/10 {
        background-image: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
        background-size: 24px 24px;
    }
`;
        document.head.appendChild(styleSheet);
    }, []);

    const getDashboardLink = () => {
        if (!isLoggedIn || !roles?.length) return "/login";
        const role = activeRole || (roles.length === 1 ? roles[0] : null);
        if (!role) return "/choose-role";
        if (role === "sub_admin") return "/sub-admin/dashboard";
        if (role === "admin") return "/super-admin/dashboard";
        return `/${role}/dashboard`;
    };

    return (
        <div className="min-h-screen bg-white dark:bg-dark-surface transition-colors duration-300">
            <HeroSection
                isLoggedIn={isLoggedIn}
                getDashboardLink={getDashboardLink}
            />
            <HowItWorksSection />
            <EmergencySection />
            <CoreFeaturesSection />
            <RoleModulesSection />
            <CarePathsSection />
            <DoctorsScrollerSection />
            <ReviewsScrollerSection />
            <TrustSecuritySection />
            <FinalCTASection
                isLoggedIn={isLoggedIn}
                getDashboardLink={getDashboardLink}
            />
            <FooterSection
                isLoggedIn={isLoggedIn}
                roles={roles}
                activeRole={activeRole}
                getDashboardLink={getDashboardLink}
            />
        </div>
    );
};

// ---------- Hero Section ----------
const HeroSection = ({ isLoggedIn, getDashboardLink }) => (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-linear-to-br from-[#e8f5e9] via-white to-[#f3e5f5] dark:from-dark-surface dark:via-dark-surface dark:to-dark-surface">
        {/* Animated background shapes */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse-slow animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-linear-to-r from-primary-100/10 to-purple-100/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
            <div className="text-center lg:text-left lg:grid lg:grid-cols-2 lg:gap-12 items-center">
                <div className="animate-fade-in-up animation-delay-100">
                    <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 shadow-sm border border-gray-100">
                        <Sparkles size={16} className="text-primary-600" />
                        <span className="text-sm font-medium text-gray-700">
                            AI-Powered Healthcare
                        </span>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-gray-900 dark:text-neutral-100 mb-6 leading-tight">
                        Where Ancient
                        <span className="bg-linear-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                            {" "}
                            Wisdom
                        </span>
                        <br />
                        Meets Modern AI
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-neutral-400 max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
                        AyurAyush combines Ayurveda with AI-driven triage, smart
                        scheduling, and emergency detection — delivering
                        holistic, efficient hospital management.
                    </p>
                    <div className="flex gap-4 justify-center lg:justify-start flex-wrap">
                        {isLoggedIn ? (
                            <Link to={getDashboardLink()}>
                                <Button
                                    size="lg"
                                    className="bg-linear-to-r from-primary-600 to-primary-800 text-white border border-primary-500 hover:from-primary-700 hover:to-primary-900 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5"
                                >
                                    Go to Dashboard{" "}
                                    <ArrowRight size={18} className="ml-1" />
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link to="/signup">
                                    <Button
                                        size="lg"
                                        className="bg-linear-to-r from-primary-600 to-primary-800 text-white border border-primary-500 hover:from-primary-700 hover:to-primary-900 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5"
                                    >
                                        Get Started{" "}
                                        <ArrowRight
                                            size={18}
                                            className="ml-1"
                                        />
                                    </Button>
                                </Link>
                                <Link to="/login">
                                    <Button
                                        size="lg"
                                        variant="secondary"
                                        className="bg-linear-to-r from-neutral-700 to-neutral-900 text-white border border-neutral-600 hover:from-neutral-800 hover:to-black hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5"
                                    >
                                        Sign In
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                    <div className="flex flex-wrap justify-center lg:justify-start gap-6 mt-12">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle
                                size={16}
                                className="text-primary-600"
                            />{" "}
                            OTP Secure
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle
                                size={16}
                                className="text-primary-600"
                            />{" "}
                            Instant Triage
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle
                                size={16}
                                className="text-primary-600"
                            />{" "}
                            Trusted by 50k+
                        </div>
                    </div>
                </div>
                <div className="hidden lg:block relative mt-12 lg:mt-0">
                    <div className="relative w-full h-125">
                        <div className="absolute inset-0 bg-linear-to-r from-primary-400 to-purple-400 rounded-full blur-2xl opacity-20 animate-pulse-slow" />
                        <div className="relative z-10 flex items-center justify-center">
                            <div className="w-80 h-80 bg-linear-to-br from-primary-100 to-purple-100 rounded-full flex items-center justify-center shadow-2xl animate-float">
                                <Stethoscope
                                    size={120}
                                    className="text-primary-600"
                                />
                            </div>
                        </div>
                        {/* Floating elements */}
                        <div className="absolute top-10 right-20 animate-float-delayed">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                                <Brain size={32} className="text-primary-600" />
                            </div>
                        </div>
                        <div className="absolute bottom-20 left-10 animate-float-slow">
                            <div className="w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                                <HeartPulse
                                    size={28}
                                    className="text-red-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

// ---------- How It Works ----------
const steps = [
    {
        icon: Bot,
        title: "AI Consultation",
        desc: "Describe symptoms to our Gemini AI chatbot for instant assessment.",
        color: "primary",
    },
    {
        icon: AlertTriangle,
        title: "Urgency Classification",
        desc: "AI flags emergencies and prioritizes critical cases.",
        color: "orange",
    },
    {
        icon: CalendarCheck,
        title: "Smart Scheduling",
        desc: "Book approved appointments with real-time availability.",
        color: "green",
    },
    {
        icon: Stethoscope,
        title: "Doctor Consult",
        desc: "Complete consultation with digital records & follow-up.",
        color: "purple",
    },
];

const HowItWorksSection = () => (
    <Section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
            <span className="text-primary-600 text-sm font-semibold uppercase tracking-wider">
                Simple Process
            </span>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-neutral-100 mt-3 mb-4">
                How AyurAyush Works
            </h2>
            <p className="text-gray-600 dark:text-neutral-400 max-w-2xl mx-auto">
                From symptom check to recovery — seamless, AI-guided journey
            </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
                <div
                    key={idx}
                    className="group relative bg-white dark:bg-dark-card rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 dark:border-dark-border"
                >
                    <div className="absolute -top-4 -left-4 w-10 h-10 bg-linear-to-br from-primary-500 to-primary-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg">
                        0{idx + 1}
                    </div>
                    <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ${
                            step.color === "primary"
                                ? "bg-primary-50"
                                : step.color === "orange"
                                  ? "bg-orange-50"
                                  : step.color === "green"
                                    ? "bg-green-50"
                                    : "bg-purple-50"
                        }`}
                    >
                        <step.icon
                            size={32}
                            className={
                                step.color === "primary"
                                    ? "text-primary-600"
                                    : step.color === "orange"
                                      ? "text-orange-600"
                                      : step.color === "green"
                                        ? "text-green-600"
                                        : "text-purple-600"
                            }
                        />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-neutral-100 mb-3">
                        {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-neutral-400 leading-relaxed">
                        {step.desc}
                    </p>
                    {idx < steps.length - 1 && (
                        <div className="hidden lg:block absolute -right-4 top-1/2 text-gray-300">
                            <ArrowRight size={24} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    </Section>
);

// ---------- Emergency Section ----------
const EmergencySection = () => (
    <Section className="relative overflow-hidden bg-linear-to-r from-red-50 to-orange-50 py-16">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="max-w-7xl mx-auto px-6 relative">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-5">
                    <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center animate-pulse-slow">
                        <AlertTriangle size={40} className="text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-red-800">
                            24/7 Emergency Detection
                        </h3>
                        <p className="text-red-700 text-lg">
                            Life-threatening symptoms? Our AI instantly flags
                            and routes you to immediate care.
                        </p>
                    </div>
                </div>
                <Button className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                    Emergency Protocol →
                </Button>
            </div>
        </div>
    </Section>
);

// ---------- Core Features ----------
const coreFeatures = [
    {
        icon: MessageSquare,
        title: "AI Health Chatbot",
        desc: "Gemini-powered assessments with emergency detection",
        color: "primary",
        gradient: "from-primary-50 to-primary-100",
    },
    {
        icon: CalendarCheck,
        title: "Smart Scheduling",
        desc: "Real-time availability & admin approval flow",
        color: "blue",
        gradient: "from-blue-50 to-blue-100",
    },
    {
        icon: ShieldCheck,
        title: "Emergency Detection",
        desc: "Urgency classification & priority queue",
        color: "red",
        gradient: "from-red-50 to-red-100",
    },
    {
        icon: Activity,
        title: "Queue Management",
        desc: "Real-time hospital queue & walk-in support",
        color: "purple",
        gradient: "from-purple-50 to-purple-100",
    },
];

const CoreFeaturesSection = () => (
    <Section className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-neutral-100 text-center mb-16">
            Powerful Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreFeatures.map((f) => (
                <div
                    key={f.title}
                    className="group bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 dark:border-dark-border"
                >
                    <div
                        className={`w-14 h-14 rounded-2xl bg-linear-to-br ${f.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                    >
                        <f.icon
                            size={28}
                            className={
                                f.color === "primary"
                                    ? "text-primary-600"
                                    : f.color === "blue"
                                      ? "text-blue-600"
                                      : f.color === "red"
                                        ? "text-red-600"
                                        : "text-purple-600"
                            }
                        />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-neutral-100 mb-3">
                        {f.title}
                    </h3>
                    <p className="text-gray-600 dark:text-neutral-400 leading-relaxed">
                        {f.desc}
                    </p>
                </div>
            ))}
        </div>
    </Section>
);

// ---------- Role Modules ----------
const RoleModulesSection = () => {
    const modules = [
        {
            role: "Patient",
            icon: User,
            features: [
                "AI Chat & Triage",
                "Book Appointments",
                "Track History",
            ],
            color: "primary",
            gradient: "from-primary-500 to-primary-600",
        },
        {
            role: "Doctor",
            icon: Stethoscope,
            features: [
                "Today's Schedule",
                "Manage Appointments",
                "Completion Workflow",
            ],
            color: "green",
            gradient: "from-green-500 to-green-600",
        },
        {
            role: "Admin",
            icon: LayoutDashboard,
            features: [
                "Emergency Queue",
                "Approvals",
                "Doctor Mgmt",
                "Walk-in Booking",
            ],
            color: "purple",
            gradient: "from-purple-500 to-purple-600",
        },
    ];
    return (
        <Section className="bg-gray-50 dark:bg-dark-card py-24">
            <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-4xl font-bold text-gray-900 dark:text-neutral-100 text-center mb-16">
                    Role-Based Dashboards
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {modules.map((m) => (
                        <div
                            key={m.role}
                            className="group bg-white dark:bg-dark-elevated rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 dark:border-dark-border"
                        >
                            <div
                                className={`w-16 h-16 rounded-2xl bg-linear-to-br ${m.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                            >
                                <m.icon size={32} className="text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-neutral-100 mb-4">
                                {m.role}
                            </h3>
                            <ul className="space-y-3">
                                {m.features.map((f) => (
                                    <li
                                        key={f}
                                        className="flex items-center gap-3 text-gray-600 dark:text-neutral-400"
                                    >
                                        <CheckCircle
                                            size={18}
                                            className="text-primary-500"
                                        />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </Section>
    );
};

// ---------- Care Paths ----------
const CarePathsSection = () => {
    const paths = [
        {
            name: "Normal Care",
            icon: HeartPulse,
            desc: "General consultation with modern medicine protocols",
            badge: "Clinical",
            gradient: "from-blue-500 to-blue-600",
        },
        {
            name: "Ayurveda Care",
            icon: Leaf,
            desc: "Holistic herbal treatments & lifestyle guidance",
            badge: "Holistic",
            gradient: "from-green-500 to-green-600",
        },
        {
            name: "Panchakarma",
            icon: Flower2,
            desc: "Deep detox & rejuvenation therapy",
            badge: "Therapy",
            gradient: "from-orange-500 to-orange-600",
        },
    ];
    return (
        <Section className="max-w-7xl mx-auto px-6 py-24">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-neutral-100 text-center mb-16">
                Care Paths Tailored for You
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {paths.map((p) => (
                    <div
                        key={p.name}
                        className="group relative bg-white dark:bg-dark-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 dark:border-dark-border"
                    >
                        <div
                            className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${p.gradient} opacity-10 rounded-bl-full`}
                        />
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div
                                    className={`w-16 h-16 rounded-2xl bg-linear-to-br ${p.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                                >
                                    <p.icon size={32} className="text-white" />
                                </div>
                                <span className="text-xs font-semibold px-3 py-1.5 bg-gray-100 dark:bg-dark-elevated text-gray-700 dark:text-neutral-300 rounded-full">
                                    {p.badge}
                                </span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-neutral-100 mb-3">
                                {p.name}
                            </h3>
                            <p className="text-gray-600 dark:text-neutral-400 leading-relaxed">
                                {p.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </Section>
    );
};

// ---------- Doctors Scroller ----------
const DoctorsScrollerSection = () => {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [loadingDoctors, setLoadingDoctors] = useState(true);

    useEffect(() => {
        publicService
            .getPublicDoctors()
            .then((res) => {
                if (res.isSuccess) setDoctors(res.data?.doctors || []);
            })
            .finally(() => setLoadingDoctors(false));
    }, []);

    const {
        visibleItems,
        next,
        prev,
        hasControls,
        pauseAutoScroll,
        resumeAutoScroll,
    } = useCarousel(doctors, 4000);

    return (
        <Section className="bg-linear-to-br from-primary-50/30 to-purple-50/30 dark:from-dark-card dark:to-dark-card py-24">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex justify-between items-center mb-12 flex-wrap gap-4">
                    <div>
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-neutral-100">
                            Our Specialists
                        </h2>
                        <p className="text-gray-600 dark:text-neutral-400 text-lg mt-2">
                            Verified experts delivering compassionate care
                        </p>
                    </div>
                    <CarouselControls
                        onPrev={prev}
                        onNext={next}
                        hasControls={hasControls}
                    />
                </div>

                {loadingDoctors ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="bg-white dark:bg-dark-elevated rounded-2xl overflow-hidden border border-gray-100 dark:border-dark-border"
                            >
                                <div className="h-48 bg-neutral-100 dark:bg-dark-elevated animate-pulse" />
                                <div className="p-6 space-y-3">
                                    <div className="h-5 w-3/4 bg-neutral-100 dark:bg-dark-elevated rounded animate-pulse" />
                                    <div className="h-4 w-1/2 bg-neutral-100 dark:bg-dark-elevated rounded animate-pulse" />
                                    <div className="h-9 w-full bg-neutral-100 dark:bg-dark-elevated rounded-lg animate-pulse mt-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : doctors.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-neutral-400 py-12">
                        No specialists available at the moment.
                    </p>
                ) : (
                    <div
                        className="overflow-hidden"
                        onMouseEnter={pauseAutoScroll}
                        onMouseLeave={resumeAutoScroll}
                        onFocus={pauseAutoScroll}
                        onBlur={resumeAutoScroll}
                    >
                        <div className="flex gap-6 transition-transform duration-500 ease-out">
                            {visibleItems.map((doc) => {
                                const isAvailable = doc.isActive !== false;
                                return (
                                    <div
                                        key={doc.doctorId}
                                        className="min-w-[calc(100%-1.5rem)] sm:min-w-[calc(50%-0.75rem)] lg:min-w-[calc(25%-1.125rem)] group bg-white dark:bg-dark-elevated rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 dark:border-dark-border overflow-hidden"
                                    >
                                        <div className="relative h-48 bg-linear-to-br from-primary-100 to-purple-100 flex items-center justify-center">
                                            <UserCircle
                                                size={80}
                                                className="text-primary-600 opacity-80"
                                            />
                                            <div
                                                className={`absolute top-4 right-4 text-white text-xs px-2 py-1 rounded-full ${
                                                    isAvailable
                                                        ? "bg-green-500"
                                                        : "bg-neutral-400"
                                                }`}
                                            >
                                                {isAvailable
                                                    ? "Available"
                                                    : "Unavailable"}
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-neutral-100 mb-1">
                                                {doc.name}
                                            </h3>
                                            <p className="text-primary-600 text-sm font-medium mb-4">
                                                {doc.specialization ||
                                                    "General Practice"}
                                            </p>
                                            <div className="flex justify-between text-sm text-gray-600 dark:text-neutral-400 mb-5">
                                                {doc.experience && (
                                                    <span className="flex items-center gap-1">
                                                        <Briefcase size={14} />{" "}
                                                        {doc.experience} yrs
                                                    </span>
                                                )}
                                                {doc.consultationFee && (
                                                    <span className="flex items-center gap-1">
                                                        <IndianRupee
                                                            size={14}
                                                        />{" "}
                                                        {doc.consultationFee}
                                                    </span>
                                                )}
                                            </div>
                                            <Button
                                                variant={
                                                    isAvailable
                                                        ? "primary"
                                                        : "secondary"
                                                }
                                                className="w-full group-hover:shadow-lg transition-all duration-300"
                                                disabled={!isAvailable}
                                                onClick={() => isAvailable && navigate("/patient/chatbot")}
                                            >
                                                {isAvailable
                                                    ? "Book Consultation"
                                                    : "Currently Unavailable"}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </Section>
    );
};

// ---------- Reviews Scroller ----------
const ReviewsScrollerSection = () => {
    const {
        visibleItems,
        next,
        prev,
        hasControls,
        pauseAutoScroll,
        resumeAutoScroll,
    } = useCarousel(reviewsData, 5000);

    const renderStars = (rating) => (
        <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    size={16}
                    className={
                        i < rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                    }
                />
            ))}
        </div>
    );

    return (
        <Section className="max-w-7xl mx-auto px-6 py-24">
            <div className="flex justify-between items-center mb-12 flex-wrap gap-4">
                <div>
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-neutral-100">
                        Patient Experiences
                    </h2>
                    <p className="text-gray-600 dark:text-neutral-400 text-lg mt-2">
                        Real stories of trust and recovery
                    </p>
                </div>
                <CarouselControls
                    onPrev={prev}
                    onNext={next}
                    hasControls={hasControls}
                />
            </div>
            <div
                className="overflow-hidden"
                onMouseEnter={pauseAutoScroll}
                onMouseLeave={resumeAutoScroll}
                onFocus={pauseAutoScroll}
                onBlur={resumeAutoScroll}
            >
                <div className="flex gap-6 transition-transform duration-500 ease-out">
                    {visibleItems.map((review) => (
                        <div
                            key={review.id}
                            className="min-w-[calc(100%-1.5rem)] sm:min-w-[calc(50%-0.75rem)] lg:min-w-[calc(25%-1.125rem)] group bg-white dark:bg-dark-card rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 dark:border-dark-border p-6"
                        >
                            <Quote
                                size={32}
                                className="text-primary-200 mb-4"
                            />
                            {renderStars(review.rating)}
                            <p className="text-gray-700 dark:text-neutral-300 my-4 text-base italic leading-relaxed">
                                "{review.quote}"
                            </p>
                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-dark-border">
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-neutral-100">
                                        {review.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-neutral-400">
                                        {review.location} • Age {review.age}
                                    </p>
                                </div>
                                <span className="text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-dark-elevated text-gray-700 dark:text-neutral-300 font-medium">
                                    {review.careType}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Section>
    );
};

// ---------- Trust & Security ----------
const TrustSecuritySection = () => (
    <Section className="bg-white dark:bg-dark-surface py-24 border-t border-gray-100 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-neutral-100 mb-16">
                Trusted & Secure Healthcare Platform
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="group">
                    <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                        <Fingerprint size={40} className="text-primary-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-neutral-100 mb-2">
                        OTP-Secured Onboarding
                    </h3>
                    <p className="text-gray-600 dark:text-neutral-400">
                        Two-factor verification for all users
                    </p>
                </div>
                <div className="group">
                    <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                        <Lock size={40} className="text-primary-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Protected Health Data
                    </h3>
                    <p className="text-gray-600 dark:text-neutral-400">
                        End-to-end encrypted requests
                    </p>
                </div>
                <div className="group">
                    <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                        <Bell size={40} className="text-primary-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Real-time Notifications
                    </h3>
                    <p className="text-gray-600 dark:text-neutral-400">
                        Reliable appointment & status alerts
                    </p>
                </div>
            </div>
        </div>
    </Section>
);

// ---------- Final CTA ----------
const FinalCTASection = ({ isLoggedIn, getDashboardLink }) => (
    <Section className="relative overflow-hidden bg-linear-to-r from-primary-600 via-primary-700 to-purple-700 py-20">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-5">
                Ready to Experience Smarter Healthcare?
            </h2>
            <p className="text-white/90 text-lg mb-10 max-w-2xl mx-auto">
                Join thousands of patients and doctors using AyurAyush for
                seamless care.
            </p>
            <div className="flex gap-5 justify-center flex-wrap">
                {isLoggedIn ? (
                    <Link to={getDashboardLink()}>
                        <Button
                            size="lg"
                            className="bg-linear-to-r from-primary-600 to-primary-800 text-white border border-primary-500 hover:from-primary-700 hover:to-primary-900 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                            Go to Dashboard{" "}
                            <ArrowRight size={18} className="ml-1" />
                        </Button>
                    </Link>
                ) : (
                    <>
                        <Link to="/signup">
                            <Button
                                size="lg"
                                className="bg-linear-to-r from-primary-600 to-primary-800 text-white border border-primary-500 hover:from-primary-700 hover:to-primary-900 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5"
                            >
                                Get Started{" "}
                                <ArrowRight size={18} className="ml-1" />
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button
                                size="lg"
                                variant="secondary"
                                className="bg-linear-to-r from-neutral-700 to-neutral-900 text-white border border-neutral-500 hover:from-neutral-800 hover:to-black hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5"
                            >
                                Sign In
                            </Button>
                        </Link>
                    </>
                )}
            </div>
        </div>
    </Section>
);

// ---------- Footer ----------
const FooterSection = ({ isLoggedIn, roles, activeRole, getDashboardLink }) => {
    const portalLabel =
        !isLoggedIn ? "Patient Portal" :
        activeRole === "admin" ? "Admin Portal" :
        activeRole === "sub_admin" ? "Sub-Admin Portal" :
        activeRole === "doctor" ? "Doctor Portal" :
        activeRole === "patient" ? "Patient Portal" :
        roles?.length > 1 ? "My Portal" :
        "Patient Portal";
    const portalLink = !isLoggedIn ? "/patient/dashboard" : getDashboardLink();

    return (
        <footer className="bg-gray-900 dark:bg-dark-surface text-gray-400 pt-16 pb-8 border-t border-gray-800 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                <div>
                    <div className="flex items-center gap-2 text-white mb-4">
                        <Stethoscope size={28} className="text-primary-400" />
                        <span className="font-bold text-xl">AyurAyush</span>
                    </div>
                    <p className="text-sm leading-relaxed">
                        AI-powered hospital management bridging Ayurveda and
                        modern clinical workflows.
                    </p>
                </div>
                <div>
                    <h4 className="text-white font-semibold mb-4">
                        Quick Links
                    </h4>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <Link
                                to="/login"
                                className="hover:text-white transition-colors"
                            >
                                Sign In
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/signup"
                                className="hover:text-white transition-colors"
                            >
                                Get Started
                            </Link>
                        </li>
                        <li>
                            <Link
                                to={portalLink}
                                className="hover:text-white transition-colors"
                            >
                                {portalLabel}
                            </Link>
                        </li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-semibold mb-4">Support</h4>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <Link
                                to="/contact"
                                className="hover:text-white transition-colors"
                            >
                                Contact
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/privacy"
                                className="hover:text-white transition-colors"
                            >
                                Privacy Policy
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/terms"
                                className="hover:text-white transition-colors"
                            >
                                Terms of Service
                            </Link>
                        </li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-semibold mb-4">Connect</h4>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-center gap-2">
                            <PhoneCall size={14} /> +91 89788 57943
                        </li>
                        <li className="flex items-center gap-2">
                            <Mail size={14} /> care@ayurayush.tech
                        </li>
                        <li className="flex items-center gap-2">
                            <MapPin size={14} /> LPU, India
                        </li>
                    </ul>
                </div>
            </div>
            <div className="text-center pt-8 border-t border-gray-800 text-sm">
                © {new Date().getFullYear()} AyurAyush — AI-Powered Healthcare.
                All rights reserved.
            </div>
        </div>
    </footer>
    );
};

export { HomePage };
