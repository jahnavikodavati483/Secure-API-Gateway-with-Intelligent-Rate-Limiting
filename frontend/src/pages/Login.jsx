import React, { useState } from 'react';
import axios from 'axios';
import { KeyRound, Lock, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import forge from 'node-forge';
import Card from '../components/ui/Card';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';
import API_BASE_URL from '../api';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '', privateKey: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.username || !formData.password || !formData.privateKey) {
            return toast.error('All fields, including Private Key, are required');
        }

        try {
            forge.pki.privateKeyFromPem(formData.privateKey);
        } catch (err) {
            return toast.error('Invalid Private Key format. Make sure you copied the exact block including the dashes.');
        }

        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
                username: formData.username,
                password: formData.password
            });

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            localStorage.setItem('privateKey', formData.privateKey);

            toast.success('Access granted');
            window.location.href = '/dashboard';
        } catch (err) {
            toast.error(err.response?.data?.error || 'Authentication failed. Please verify credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto pb-20">
            <div className="mb-10 text-center">
                <h2 className="text-[36px] font-extrabold text-[#2B3674] tracking-tight mb-2">Access Vault</h2>
                <p className="text-[#A3AED0] text-sm font-medium">Log in to view or upload encrypted files</p>
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

                    <div className="pt-2">
                        <InputField
                            label="Decryption Key (RSA)"
                            icon={KeyRound}
                            placeholder="-----BEGIN RSA PRIVATE KEY-----..."
                            value={formData.privateKey}
                            onChange={(e) => setFormData({ ...formData, privateKey: e.target.value })}
                            multiline
                            rows={4}
                            required
                            helperText="The key remains locally on your device to decrypt files."
                        />
                    </div>

                    <Button type="submit" disabled={loading} className="mt-8 text-lg py-4">
                        {loading ? 'Authenticating...' : 'Sign In to Vault'}
                    </Button>
                </form>

                <p className="mt-8 text-center text-sm text-[#A3AED0] font-medium">
                    Need a secure vault?{' '}
                    <Link to="/register" className="text-[#4318FF] font-bold hover:text-[#3311DB] transition-colors">
                        Create an Account
                    </Link>
                </p>
            </Card>
        </div>
    );
};

export default Login;
