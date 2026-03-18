import React from 'react';

const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '', disabled = false, icon: Icon }) => {
    const baseStyle = "flex items-center justify-center w-full py-3.5 px-6 rounded-full font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-[#4318FF] text-white hover:bg-[#3311DB] focus:ring-[#4318FF] shadow-[0_12px_24px_rgba(67,24,255,0.25)] hover:shadow-[0_14px_30px_rgba(67,24,255,0.35)] hover:-translate-y-0.5",
        secondary: "bg-white text-[#4318FF] border border-[#E9EDF7] hover:bg-[#F4F7FE] focus:ring-[#E9EDF7]",
        danger: "bg-red-50 text-red-500 hover:bg-red-100",
        ghost: "bg-transparent text-[#A3AED0] hover:bg-[#F4F7FE] hover:text-[#2B3674]"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyle} ${variants[variant]} ${className}`}
        >
            {Icon && <Icon className="w-5 h-5 mr-2" />}
            {children}
        </button>
    );
};

export default Button;
