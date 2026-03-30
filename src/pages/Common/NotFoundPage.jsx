import { Link } from "react-router";
import { useAuthContext } from "../../contexts/AppContext";
import { AlertTriangle } from "lucide-react";

const NotFoundPage = () => {
    const { isLoggedIn } = useAuthContext();
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
            <div className="w-20 h-20 bg-error-50 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle size={36} className="text-error-600" />
            </div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">404</h1>
            <p className="text-neutral-500 mb-6">
                The page you're looking for doesn't exist.
            </p>
            {isLoggedIn ? (
                <Link
                    to="/"
                    className="inline-flex items-center justify-center h-10 px-5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 active:bg-primary-800 transition-colors"
                >
                    Go to Home
                </Link>
            ) : (
                <Link
                    to="/login"
                    className="inline-flex items-center justify-center h-10 px-5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 active:bg-primary-800 transition-colors"
                >
                    Go to Login
                </Link>
            )}
        </div>
    );
};

export { NotFoundPage };
