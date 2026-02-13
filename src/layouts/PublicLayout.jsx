import { Outlet } from "react-router";
import { Navbar } from "../components/Navbar";

const PublicLayout = () => {
    return (
        <div className="min-h-screen">
            <Navbar />
            <Outlet />
        </div>
    );
};

export { PublicLayout };
