import { PuffLoader } from "react-spinners";

const GlobalLoader = () => {
    return (
        <div className="flex items-center justify-center h-screen bg-white">
            <PuffLoader size={60} color="#d97706" />
        </div>
    );
};

export { GlobalLoader };
