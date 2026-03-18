import React from 'react';
import { LogOut, ShieldCheck, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
    const navigate = useNavigate();

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white shadow-[0_4px_24px_rgba(112,144,176,0.08)]">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    {/* Logo properly styled for Cloud Storage */}
                    <div className="flex items-center cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#4318FF] to-[#868CFF] flex items-center justify-center mr-3 shadow-lg shadow-[#4318FF]/20 group-hover:scale-105 transition-transform duration-300">
                            <ShieldCheck className="text-white w-5 h-5" />
                        </div>
                        <h1 className="text-xl font-extrabold tracking-tight text-[#2B3674] hidden sm:block">
                            Secure Cloud <span className="font-medium text-[#A3AED0]">Storage</span>
                        </h1>
                    </div>

                    {/* Right side Auth/User details */}
                    <div className="flex items-center space-x-6">
                        {user ? (
                            <>
                                <div className="hidden sm:flex flex-col items-end">
                                    <span className="text-sm font-bold text-[#2B3674]">{user.username}</span>
                                    <span className="text-[10px] uppercase font-bold text-[#A3AED0] tracking-wider">Vault Active</span>
                                </div>

                                <div className="h-10 w-10 rounded-full bg-[#F4F7FE] border-2 border-white shadow-sm flex items-center justify-center text-[#4318FF] font-bold">
                                    {user.username?.[0]?.toUpperCase()}
                                </div>

                                <div className="h-6 w-px bg-[#E9EDF7]"></div>

                                <button
                                    onClick={onLogout}
                                    className="flex items-center text-sm font-bold text-[#A3AED0] hover:text-[#EE5D50] hover:bg-[#EE5D50]/10 px-4 py-2 rounded-full transition-colors"
                                >
                                    <LogOut className="w-4 h-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="text-sm font-bold text-[#2B3674] hover:text-[#4318FF] transition-colors">Sign In</Link>
                                <Link to="/register" className="text-sm font-bold bg-[#4318FF] text-white px-5 py-2.5 rounded-full hover:bg-[#3311DB] transition-colors shadow-lg shadow-[#4318FF]/25">
                                    Create Vault
                                </Link>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </nav>
    );
};

export default Navbar;
