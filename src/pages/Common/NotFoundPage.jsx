import { Link } from "react-router";
import { useAuthContext } from "../../contexts/AppContext";
import { AlertTriangle } from "lucide-react";

const NotFoundPage = () => {
  const { isLoggedIn } = useAuthContext();
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle size={36} className="text-red-500" />
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
      <p className="text-gray-500 mb-6">
        The page you're looking for doesn't exist.
      </p>
      {isLoggedIn ? (
        <Link
          to="/"
          className="px-5 py-2 bg-[#065A82] text-white rounded-lg hover:bg-[#065A82]/90 transition text-sm font-medium"
        >
          Go to Home
        </Link>
      ) : (
        <Link
          to="/login"
          className="px-5 py-2 bg-[#065A82] text-white rounded-lg hover:bg-[#065A82]/90 transition text-sm font-medium"
        >
          Go to Login
        </Link>
      )}
    </div>
  );
};

export { NotFoundPage };
