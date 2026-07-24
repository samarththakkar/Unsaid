import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { Send, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            toast.success("If that account exists, we've sent a password reset OTP to your email.");
            setIsSent(true);
        } catch (err) {
            toast.error(err.message || 'Failed to send OTP');
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
                    <h2>Reset Password</h2>
                    <p>Enter your email to receive an OTP.</p>
                </div>
                
                {isSent ? (
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <Link to="/reset-password" state={{ email }} className="btn" style={{ textDecoration: 'none' }}>
                            Proceed to Reset
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input 
                                type="email" 
                                className="input-field" 
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                placeholder="name@company.com"
                            />
                        </div>

                        <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                            <Send size={18} />
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
