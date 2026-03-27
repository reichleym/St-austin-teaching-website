interface ButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'outline' | 'white' | 'icon' | 'whiteOutline';
    icon?: React.ReactNode;
    className?: string;
    [key: string]: any;
}

export default function Button({
    children,
    variant = 'primary',
    icon,
    className = '',
    ...rest
}: ButtonProps) {
    const baseStyles = 'text-[15px] leading-tight font-medium hover:opacity-80 px-6 py-2.5 rounded transition-colors duration-200 cursor-pointer flex items-center';

    const variantStyles = {
        primary: 'bg-[#1E73BE] text-white',
        white: 'bg-white text-[#1E73BE]',
        icon: 'bg-white text-[#1E73BE] gap-3',
        outline: 'bg-transparent border border-[#1E73BE] text-[#1E73BE] hover:opacity-100 hover:bg-[#1E73BE] hover:text-white',
        whiteOutline: 'bg-transparent border border-[#fff] text-[#fff] hover:opacity-100 hover:bg-[#fff] hover:text-[#1E73BE]',
    };

    const combinedClass = ` ${baseStyles} ${className} ${variantStyles[variant]}`;

    return (
        <button className={combinedClass} {...rest}>
            {children}
            {icon && <span className="flex items-center">{icon}</span>}
        </button>
    );
}