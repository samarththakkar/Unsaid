import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { UserPlus } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/register', { name, email, password });
            toast.success('Account created! Please verify your email.');
            navigate('/verify-email', { state: { email } });
        } catch (err) {
            toast.error(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setLoading(true);
            const response = await api.post('/auth/google', { idToken: credentialResponse.credential });
            login(response.data.user);
            toast.success('Successfully registered and logged in!');
            navigate('/');
        } catch (err) {
            toast.error(err.message || 'Google registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex-center">
            <div className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2>Create Account</h2>
                    <p>Start tracking UI friction automatically</p>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input 
                            type="text" 
                            className="input-field" 
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            placeholder="Jane Doe"
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input 
                            type="email" 
                            className="input-field" 
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            placeholder="name@company.com"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            className="input-field" 
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                        <UserPlus size={18} />
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>
                
                <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => toast.error('Google registration failed')}
                        useOneTap
                        theme="filled_black"
                    />
                </div>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Sign In</Link>
                </div>
            </div>
        </div>
    );
}
