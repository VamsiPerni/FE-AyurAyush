import { Leaf } from "lucide-react";

const GlobalLoader = ({ message = "Loading..." }) => {
    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-dark-surface flex flex-col items-center justify-center gap-6 transition-colors duration-300">
            {/* Animated logo */}
            <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg animate-pulse-glow">
                    <Leaf className="w-8 h-8 text-white" />
                </div>
                <div className="absolute inset-0 w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl opacity-20 animate-ping" />
            </div>
            <div className="text-center">
                <h2 className="text-xl font-bold text-gradient mb-1">AyurAyush</h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{message}</p>
            </div>
        </div>
    );
};

export { GlobalLoader };
export default GlobalLoader;
