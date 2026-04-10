import { useNavigate } from "react-router";
import { useAuthContext } from "../../contexts/AppContext";
import { Stethoscope, User, Shield } from "lucide-react";

const roleConfig = {
    patient: {
        icon: User,
        label: "Patient",
        desc: "Book appointments & consult",
        iconBg: "bg-success-50",
        iconColor: "text-success-600",
        borderHover: "hover:border-success-200",
    },
    doctor: {
        icon: Stethoscope,
        label: "Doctor",
        desc: "Manage patients & schedules",
        iconBg: "bg-primary-50",
        iconColor: "text-primary-600",
        borderHover: "hover:border-primary-200",
    },
    admin: {
        icon: Shield,
        label: "Admin",
        desc: "Hospital management",
        iconBg: "bg-warning-50",
        iconColor: "text-warning-600",
        borderHover: "hover:border-warning-200",
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
            <div className="text-center space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
                        Choose Your Role
                    </h1>
                    <p className="text-sm text-neutral-500 mt-1">
                        You have multiple roles. Select one to continue.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="mt-4 inline-flex items-center rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors duration-200 hover:bg-neutral-50"
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
                                className={`w-48 p-6 bg-white rounded-2xl border-2 border-neutral-100 shadow-sm hover:shadow-md transition-all duration-200 group text-center ${config.borderHover}`}
                            >
                                <div
                                    className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${config.iconBg}`}
                                >
                                    <Icon
                                        size={28}
                                        className={config.iconColor}
                                    />
                                </div>
                                <p className="font-semibold text-neutral-900 text-lg">
                                    {config.label}
                                </p>
                                <p className="text-xs text-neutral-500 mt-1">
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
