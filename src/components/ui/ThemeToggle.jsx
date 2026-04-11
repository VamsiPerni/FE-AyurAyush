import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

const ThemeToggle = ({ className = "", size = "md" }) => {
    const { isDark, toggleTheme } = useTheme();

    const sizes = {
        sm: "w-8 h-8",
        md: "w-9 h-9",
        lg: "w-10 h-10",
    };

    const iconSizes = {
        sm: "w-3.5 h-3.5",
        md: "w-4 h-4",
        lg: "w-5 h-5",
    };

    return (
        <button
            onClick={toggleTheme}
            className={`
                ${sizes[size]}
                relative inline-flex items-center justify-center rounded-xl
                transition-all duration-300 ease-out
                bg-neutral-100 hover:bg-neutral-200 text-neutral-600
                dark:bg-dark-elevated dark:hover:bg-dark-hover dark:text-neutral-300
                hover:scale-105 active:scale-95
                focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
                dark:focus-visible:ring-offset-dark-surface
                ${className}
            `}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            <span className={`absolute transition-all duration-300 ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`}>
                <Sun className={iconSizes[size]} />
            </span>
            <span className={`absolute transition-all duration-300 ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`}>
                <Moon className={iconSizes[size]} />
            </span>
        </button>
    );
};

export { ThemeToggle };
export default ThemeToggle;
