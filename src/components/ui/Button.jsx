import { PuffLoader } from "react-spinners";

const variants = {
  primary: "bg-[#065A82] hover:bg-[#054a6b] text-white",
  secondary: "bg-[#1C7293] hover:bg-[#165f7a] text-white",
  success: "bg-emerald-500 hover:bg-emerald-600 text-white",
  danger: "bg-red-500 hover:bg-red-600 text-white",
  warning: "bg-amber-500 hover:bg-amber-600 text-white",
  outline:
    "border-2 border-[#065A82] text-[#065A82] hover:bg-[#065A82] hover:text-white",
  ghost: "text-gray-600 hover:bg-gray-100",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  type = "button",
  onClick,
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <PuffLoader size={16} color="currentColor" />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export { Button };
