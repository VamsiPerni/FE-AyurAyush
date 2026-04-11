import { useNavigate } from "react-router";
import { useAuthContext } from "../../contexts/AppContext";
import { Stethoscope, User, Shield, Leaf } from "lucide-react";

const roleConfig = {
    patient: {
        icon: User,
        label: "Patient",
        desc: "Book appointments & consult",
        iconBg: "bg-success-50 dark:bg-success-900/20",
        iconColor: "text-success-600 dark:text-success-400",
        borderHover: "hover:border-success-300 dark:hover:border-success-700/50",
        gradient: "from-green-500 to-emerald-600",
    },
    doctor: {
        icon: Stethoscope,
        label: "Doctor",
        desc: "Manage patients & schedules",
        iconBg: "bg-primary-50 dark:bg-primary-900/20",
        iconColor: "text-primary-600 dark:text-primary-400",
        borderHover: "hover:border-primary-300 dark:hover:border-primary-700/50",
        gradient: "from-primary-500 to-primary-700",
    },
    admin: {
        icon: Shield,
        label: "Admin",
        desc: "Hospital management",
        iconBg: "bg-warning-50 dark:bg-warning-900/20",
        iconColor: "text-warning-600 dark:text-warning-500",
        borderHover: "hover:border-warning-300 dark:hover:border-warning-700/50",
        gradient: "from-amber-500 to-orange-600",
    },
};

const ChooseRolePage = () => {
    const navigate = useNavigate();
    const { roles, handleSetUser, setActiveRole } = useAuthContext();

    const handleRoleSelect = (role) => {
        handleSetUser({ isLoggedIn: true, roles, activeRole: role });
        setActiveRole(role);
        navigate(`/${role}/dashboard`);
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="text-center space-y-8 animate-scale-in">
                <div>
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Leaf className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                        Choose Your Role
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        You have multiple roles. Select one to continue.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="mt-4 inline-flex items-center rounded-xl border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-card px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 transition-colors duration-200 hover:bg-neutral-50 dark:hover:bg-dark-hover"
                    >
                        Home
                    </button>
                </div>

                <div className="flex flex-wrap gap-6 justify-center">
                    {roles.map((role) => {
                        const config = roleConfig[role] || roleConfig.patient;
                        const Icon = config.icon;
                        return (
                            <button
                                key={role}
                                onClick={() => handleRoleSelect(role)}
                                className={`w-48 p-6 bg-white dark:bg-dark-card rounded-2xl border-2 border-neutral-100 dark:border-dark-border shadow-sm hover:shadow-xl dark:hover:shadow-dark-elevated transition-all duration-300 group text-center hover:-translate-y-1 ${config.borderHover}`}
                            >
                                <div
                                    className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-gradient-to-br ${config.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                                >
                                    <Icon
                                        size={28}
                                        className="text-white"
                                    />
                                </div>
                                <p className="font-semibold text-neutral-900 dark:text-neutral-100 text-lg">
                                    {config.label}
                                </p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                    {config.desc}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export { ChooseRolePage };
