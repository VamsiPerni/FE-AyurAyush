import { useNavigate } from "react-router";
import { useAuthContext } from "../../contexts/AppContext";
import { Card } from "../../components/ui/Card";
import { Stethoscope, User, Shield } from "lucide-react";

const roleConfig = {
    patient: {
        icon: User,
        color: "#02C39A",
        label: "Patient",
        desc: "Book appointments & consult",
    },
    doctor: {
        icon: Stethoscope,
        color: "#065A82",
        label: "Doctor",
        desc: "Manage patients & schedules",
    },
    admin: {
        icon: Shield,
        color: "#7C3AED",
        label: "Admin",
        desc: "Hospital management",
    },
};

const ChooseRolePage = () => {
    const navigate = useNavigate();
    const { roles, handleSetUser, isLoggedIn } = useAuthContext();

    const handleRoleSelect = (role) => {
        handleSetUser({ isLoggedIn: true, roles, activeRole: role });
        navigate(`/${role}/dashboard`);
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="text-center space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Choose Your Role
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        You have multiple roles. Select one to continue.
                    </p>
                </div>

                <div className="flex flex-wrap gap-6 justify-center">
                    {roles.map((role) => {
                        const config = roleConfig[role] || roleConfig.patient;
                        const Icon = config.icon;
                        return (
                            <button
                                key={role}
                                onClick={() => handleRoleSelect(role)}
                                className="w-48 p-6 bg-white rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-lg transition hover:border-current group text-center"
                                style={{ "--tw-border-opacity": 1 }}
                            >
                                <div
                                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                                    style={{
                                        backgroundColor: `${config.color}15`,
                                    }}
                                >
                                    <Icon
                                        size={28}
                                        style={{ color: config.color }}
                                    />
                                </div>
                                <p className="font-semibold text-gray-900 text-lg">
                                    {config.label}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
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
