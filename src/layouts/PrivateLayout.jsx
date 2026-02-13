import { Outlet } from "react-router";
import { Navbar } from "../components/Navbar";

const PrivateLayout = () => {
    return (
        <div className="min-h-screen">
            <Navbar />
            <Outlet />
        </div>
    );
};

export { PrivateLayout };
