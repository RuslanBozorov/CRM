import type { LucideIcon } from 'lucide-react';
import { X } from 'lucide-react';
import { forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-900">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={cn("bg-white p-6 rounded-3xl border border-slate-100 shadow-sm", className)}>
        {children}
    </div>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: LucideIcon;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon: Icon, className, ...props }, ref) => {
        return (
            <div className="w-full space-y-2">
                {label && (
                    <label className="text-sm font-semibold text-slate-700 ml-1">
                        {label}
                    </label>
                )}
                <div className="relative group">
                    {Icon && (
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                            <Icon size={18} />
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            "w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none transition-all placeholder:text-slate-400 text-slate-900 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10",
                            Icon && "pl-11",
                            error && "border-red-500 focus:border-red-500 focus:ring-red-500/10",
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="text-xs font-medium text-red-500 ml-1 mt-1 animate-fade-in">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, className, children, ...props }, ref) => {
        return (
            <div className="w-full space-y-2">
                {label && (
                    <label className="text-sm font-semibold text-slate-700 ml-1">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        className={cn(
                            "w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none transition-all text-slate-900 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 appearance-none cursor-pointer",
                            error && "border-red-500 focus:border-red-500 focus:ring-red-500/10",
                            className
                        )}
                        {...props}
                    >
                        {children}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
                {error && (
                    <p className="text-xs font-medium text-red-500 ml-1 mt-1">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    isLoading?: boolean;
    icon?: LucideIcon;
}

export const Button = ({
    variant = 'primary',
    size = 'md',
    isLoading,
    icon: Icon,
    className,
    children,
    disabled,
    ...props
}: ButtonProps) => {
    const variants = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/20 active:scale-[0.98]',
        secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 active:scale-[0.98]',
        outline: 'bg-transparent border-2 border-slate-200 text-slate-600 hover:border-primary-500 hover:text-primary-600 active:scale-[0.98]',
        ghost: 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900',
        danger: 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20 active:scale-[0.98]',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs rounded-xl',
        md: 'px-5 py-2.5 text-sm rounded-xl',
        lg: 'px-6 py-3.5 text-base rounded-2xl',
        xl: 'px-8 py-4 text-lg rounded-2xl font-bold',
    };

    return (
        <button
            disabled={isLoading || disabled}
            className={cn(
                "inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            ) : Icon ? (
                <Icon size={18} className={children ? 'mr-2' : ''} />
            ) : null}
            {children}
        </button>
    );
};
