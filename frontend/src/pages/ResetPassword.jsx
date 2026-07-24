import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { Lock, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResetPassword() {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Fallback email if user navigated directly
    const initialEmail = location.state?.email || '';

    const [email, setEmail] = useState(initialEmail);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/reset-password', { email, otp, newPassword });
            toast.success("Password reset successfully! You can now log in.");
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            toast.error(err.message || 'Password reset failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex-center">
            <div className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
                <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                    <ArrowLeft size={16} /> Back to Login
                </Link>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2>Set New Password</h2>
                    <p>Enter the 6-digit OTP and your new password.</p>
                </div>
                
                <form onSubmit={handleSubmit}>
                    {!initialEmail && (
                        <div className="form-group">
                            <label>Email Address</label>
                            <input 
                                type="email" 
                                className="input-field" 
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Verification Code (OTP)</label>
                        <input 
                            type="text" 
                            className="input-field" 
                            value={otp}
                            onChange={e => setOtp(e.target.value)}
                            required
                            placeholder="123456"
                            maxLength="6"
                            style={{ letterSpacing: '0.5rem', textAlign: 'center', fontSize: '1.2rem' }}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>New Password</label>
                        <input 
                            type="password" 
                            className="input-field" 
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                        <Lock size={18} />
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
