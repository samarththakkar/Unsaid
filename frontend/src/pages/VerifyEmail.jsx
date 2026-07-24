import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { MailCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VerifyEmail() {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Fallback email if state is lost
    const initialEmail = location.state?.email || '';
    
    const [email, setEmail] = useState(initialEmail);
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/verify-email', { email, otp });
            toast.success("Email verified successfully! You can now log in.");
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            toast.error(err.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex-center">
            <div className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2>Verify Your Email</h2>
                    <p>Enter the 6-digit code sent to your inbox.</p>
                </div>
                
                <form onSubmit={handleSubmit}>
                    {!initialEmail && (
                        <div className="form-group">
                            <label>Email</label>
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

                    <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                        <MailCheck size={18} />
                        {loading ? 'Verifying...' : 'Verify Email'}
                    </button>
                </form>
            </div>
        </div>
    );
}
