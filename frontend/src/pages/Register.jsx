import React, { useState } from 'react';
import axios from 'axios';
import forge from 'node-forge';
import { Copy, User, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';
import API_BASE_URL from '../api';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [generatedKey, setGeneratedKey] = useState(null);
    const [copied, setCopied] = useState(false);
    const [acknowledged, setAcknowledged] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.username || !formData.password) {
            return toast.error('All fields are required');
        }

        setLoading(true);
        try {
            // 1. Generate RSA Key Pair for Client-Side Encryption
            const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });
            const publicKey = forge.pki.publicKeyToPem(keypair.publicKey);
            const privateKey = forge.pki.privateKeyToPem(keypair.privateKey);

            // 2. Register User with their Public Key
            const res = await axios.post(`${API_BASE_URL}/api/auth/register`, {
                username: formData.username,
                password: formData.password,
                publicKey: publicKey
            });

            // 3. Store the private key and token securely in localStorage
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            localStorage.setItem('privateKey', privateKey);

            setGeneratedKey(privateKey);
            toast.success('Vault created successfully');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedKey);
        setCopied(true);
        toast.success('Key copied to clipboard');
        setTimeout(() => setCopied(false), 3000);
    };

    const proceedToDashboard = () => {
        if (!copied) {
            toast.error('Local backup required before proceeding.');
            return;
        }
        if (!acknowledged) {
            toast.error('You must acknowledge that lost keys cannot be recovered.', { icon: '⚠️' });
            return;
        }
        window.location.href = '/dashboard';
    };

    if (generatedKey) {
        return (
            <div className="w-full max-w-2xl mx-auto pb-20">
                <div className="mb-10 text-center">
                    <h2 className="text-[36px] font-extrabold text-[#2B3674] tracking-tight mb-2">Vault Secured</h2>
                    <p className="text-[#A3AED0] text-sm font-medium">Your client-side cryptographic key is ready.</p>
                </div>

                <Card>
                    <div className="bg-[#FFF4ED] border border-[#FFD9C3] p-5 rounded-[1.5rem] mb-8">
                        <div className="flex items-start">
                            <AlertCircle className="w-6 h-6 text-[#FF5D5D] mr-4 flex-shrink-0" />
                            <div>
                                <h3 className="text-sm font-bold text-[#FF5D5D] mb-1">Crucial Security Step</h3>
                                <p className="text-sm text-[#FF8585] leading-relaxed font-medium">
                                    Below is your decryption key. It is <strong>never saved to our database</strong>. Copy it immediately, as you need it to decrypt your files. If lost, your files are unrecoverable.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#F4F7FE] rounded-2xl p-6 border border-[#E9EDF7] relative mb-8 group">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-bold text-[#A3AED0] uppercase tracking-wider">Private RSA Key</span>
                            <button
                                onClick={copyToClipboard}
                                className={`flex items-center px-4 py-2 rounded-full text-[11px] font-bold transition-all shadow-sm ${copied ? 'bg-[#05CD99] text-white shadow-[#05CD99]/30' : 'bg-white text-[#4318FF] hover:bg-[#4318FF] hover:text-white'}`}
                            >
                                {copied ? (
                                    <><CheckCircle className="w-4 h-4 mr-1.5" /> Copied</>
                                ) : (
                                    <><Copy className="w-4 h-4 mr-1.5" /> Copy Data</>
                                )}
                            </button>
                        </div>
                        <textarea
                            readOnly
                            value={generatedKey}
                            className="w-full h-48 bg-white border border-[#E9EDF7] rounded-xl text-[#2B3674] font-mono text-[11px] leading-relaxed p-4 outline-none resize-none shadow-inner scrollbar-thin scrollbar-thumb-[#E9EDF7]"
                        />
                    </div>

                    <div className="flex items-center mb-8 px-2 bg-[#FFF4ED]/50 p-4 rounded-xl border border-[#FFD9C3]/50">
                        <input
                            type="checkbox"
                            id="acknowledge"
                            checked={acknowledged}
                            onChange={(e) => setAcknowledged(e.target.checked)}
                            className="w-5 h-5 rounded border-[#E9EDF7] text-[#4318FF] focus:ring-[#4318FF] cursor-pointer"
                        />
                        <label htmlFor="acknowledge" className="ml-4 text-[13px] font-bold text-[#FF5D5D] cursor-pointer">
                            I understand that if I lose this key, my files are permanently lost and cannot be recovered by anyone.
                        </label>
                    </div>

                    <Button onClick={proceedToDashboard} variant={acknowledged && copied ? "primary" : "secondary"} className={`py-4 text-lg ${(!acknowledged || !copied) && "opacity-50 cursor-not-allowed"}`}>
                        Go to My Vault
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full max-w-lg mx-auto pb-20">
            <div className="mb-10 text-center">
                <h2 className="text-[36px] font-extrabold text-[#2B3674] tracking-tight mb-2">Create Vault</h2>
                <p className="text-[#A3AED0] text-sm font-medium">Establish your secure cloud storage</p>
            </div>

            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <InputField
                        label="Username"
                        icon={User}
                        placeholder="john.doe"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        required
                    />

                    <InputField
                        label="Password"
                        icon={Lock}
                        type="password"
                        isPassword
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />

                    <Button type="submit" disabled={loading} className="mt-8 text-lg py-4">
                        {loading ? 'Generating Local Keys...' : 'Create Secure Vault'}
                    </Button>
                </form>

                <p className="mt-8 text-center text-sm text-[#A3AED0] font-medium">
                    Already have an account?{' '}
                    <Link to="/login" className="text-[#4318FF] font-bold hover:text-[#3311DB] transition-colors">
                        Sign In
                    </Link>
                </p>
            </Card>
        </div>
    );
};

export default Register;
