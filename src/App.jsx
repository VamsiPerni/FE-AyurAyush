import { AppRoutes } from "./routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import { useAuthContext } from "./contexts/AppContext";
import "react-toastify/dist/ReactToastify.css";
import { GlobalLoader } from "./components/ui/GlobalLoader";

const App = () => {
    const { loading } = useAuthContext();

    if (loading) {
        return <GlobalLoader />;
    }
    return (
        <>
            <AppRoutes />
            <ToastContainer />
        </>
    );
};

export default App;
