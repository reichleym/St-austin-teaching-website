interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: "primary" | "outline" | "white" | "icon" | "whiteOutline";
    size?: "sm" | "md" | "lg";
    icon?: React.ReactNode;
    className?: string;
}

export default function Button({
    children,
    variant = "primary",
    size = "md",
    icon,
    className = "",
    ...rest
}: ButtonProps) {
    const baseStyles =
        "text-center justify-center leading-tight font-medium hover:opacity-80 rounded-[5px] transition-colors duration-200 cursor-pointer flex items-center gap-3";

    const sizeStyles = {
        sm: "text-[14px] px-4 py-2 min-h-[36px]",
        md: "text-[18px] px-6 py-2 min-h-[40px]",
        lg: "text-[18px] px-6 py-3 min-h-[46px]",
    };

    const variantStyles = {
        primary: "bg-[#1E73BE] text-white",
        white: "bg-white text-[#1E73BE]",
        icon: "bg-white text-[#1E73BE] gap-3",
        outline: "bg-transparent border border-[#1E73BE] text-[#1E73BE] hover:opacity-100 hover:bg-[#1E73BE] hover:text-white",
        whiteOutline:
            "bg-transparent border border-[#fff] text-[#fff] hover:opacity-100 hover:bg-[#fff] hover:text-[#1E73BE]",
    };

    const combinedClass = `${baseStyles} ${sizeStyles[size]} ${className} ${variantStyles[variant]}`;

    return (
        <button className={combinedClass} {...rest}>
            {children}
            {icon && <span className="flex items-center">{icon}</span>}
        </button>
    );
}
