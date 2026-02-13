import { useNavigate } from "react-router";
import { useAuthContext } from "../../contexts/AppContext";

const ChooseRolePage = () => {
    const navigate = useNavigate();
    const { roles } = useAuthContext();

    return (
        <div className="flex flex-col items-center justify-center h-[80vh] gap-6">
            <h2 className="text-2xl font-bold text-purple-800">
                Select Your Role
            </h2>

            <div className="flex gap-6">
                {roles.map((role) => (
                    <button
                        key={role}
                        onClick={() => navigate(`/${role}/dashboard`)}
                        className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
                    >
                        {role.toUpperCase()}
                    </button>
                ))}
            </div>
        </div>
    );
};

export { ChooseRolePage };
