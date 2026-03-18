import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const InputField = ({ label, type = 'text', value, onChange, placeholder, icon: Icon, required = false, isPassword = false, helperText, multiline = false, rows = 4 }) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const baseInputClass = "w-full bg-white border border-[#E9EDF7] text-[#2B3674] font-medium rounded-2xl focus:ring-1 focus:ring-[#4318FF] focus:border-[#4318FF] block transition-colors outline-none placeholder-[#A3AED0]";
    const paddingClass = Icon ? "pl-12 pr-4 py-4" : "px-4 py-4";
    const passwordPaddingClass = isPassword ? "pr-12" : "";

    return (
        <div className="w-full">
            {label && <label className="block mb-2 text-sm font-bold text-[#2B3674]">{label} {required && <span className="text-[#4318FF]">*</span>}</label>}
            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-[#A3AED0]">
                        <Icon className="w-5 h-5" />
                    </div>
                )}

                {multiline ? (
                    <textarea
                        className={`${baseInputClass} ${paddingClass} font-mono text-xs shadow-sm`}
                        rows={rows}
                        placeholder={placeholder}
                        value={value}
                        onChange={onChange}
                        required={required}
                    />
                ) : (
                    <input
                        type={inputType}
                        className={`${baseInputClass} ${paddingClass} ${passwordPaddingClass} text-sm shadow-sm`}
                        placeholder={placeholder}
                        value={value}
                        onChange={onChange}
                        required={required}
                    />
                )}

                {isPassword && (
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-4 cursor-pointer text-[#A3AED0] hover:text-[#4318FF] focus:outline-none transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                )}
            </div>
            {helperText && <p className="mt-2 text-xs font-medium text-[#A3AED0]">{helperText}</p>}
        </div>
    );
};

export default InputField;
