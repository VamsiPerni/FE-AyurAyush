import { Link } from "react-router";
import { useAuthContext } from "../../contexts/AppContext";
import { AlertTriangle, ArrowLeft } from "lucide-react";

const NotFoundPage = () => {
    const { isLoggedIn } = useAuthContext();
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
            <div className="animate-scale-in">
                <div className="w-24 h-24 bg-error-50 dark:bg-error-900/20 rounded-3xl flex items-center justify-center mb-6 mx-auto">
                    <AlertTriangle size={42} className="text-error-500 dark:text-error-400" />
                </div>
                <h1 className="text-7xl font-black text-gradient mb-2">404</h1>
                <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-2 font-medium">Page Not Found</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-500 mb-8 max-w-sm">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>
                <Link
                    to={isLoggedIn ? "/" : "/login"}
                    className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-medium hover:from-primary-700 hover:to-primary-800 active:from-primary-800 active:to-primary-900 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {isLoggedIn ? "Go to Home" : "Go to Login"}
                </Link>
            </div>
        </div>
    );
};

export { NotFoundPage };
