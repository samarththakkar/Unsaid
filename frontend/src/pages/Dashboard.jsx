import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Plus, Globe, LogOut, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Create site state
    const [showCreate, setShowCreate] = useState(false);
    const [newSiteName, setNewSiteName] = useState('');
    const [newSiteDomain, setNewSiteDomain] = useState('');

    useEffect(() => {
        fetchSites();
    }, []);

    const fetchSites = async () => {
        try {
            const res = await api.get('/sites');
            setSites(res.data);
        } catch (err) {
            toast.error(err.message || 'Failed to fetch sites');
            console.error("Failed to fetch sites:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSite = async (e) => {
        e.preventDefault();
        try {
            await api.post('/sites', { name: newSiteName, domain: newSiteDomain });
            setShowCreate(false);
            setNewSiteName('');
            setNewSiteDomain('');
            toast.success('Site created successfully!');
            fetchSites();
        } catch (err) {
            toast.error(err.message || 'Failed to create site');
        }
    };

    return (
        <div style={{ padding: '2rem' }} className="container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1>Welcome, {user?.name}</h1>
                    <p>Manage your tracked websites</p>
                </div>
                <button onClick={logout} className="btn btn-outline" style={{ border: 'none' }}>
                    <LogOut size={18} />
                    Logout
                </button>
            </header>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Your Sites</h2>
                <button className="btn" onClick={() => setShowCreate(!showCreate)}>
                    <Plus size={18} />
                    Add Site
                </button>
            </div>

            {showCreate && (
                <div className="glass-card" style={{ marginBottom: '2rem' }}>
                    <form onSubmit={handleCreateSite} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                        <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                            <label>Site Name</label>
                            <input type="text" className="input-field" value={newSiteName} onChange={e => setNewSiteName(e.target.value)} placeholder="e.g. Production App" required />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                            <label>Domain</label>
                            <input type="text" className="input-field" value={newSiteDomain} onChange={e => setNewSiteDomain(e.target.value)} placeholder="e.g. example.com" required />
                        </div>
                        <button type="submit" className="btn">Create</button>
                    </form>
                </div>
            )}

            {loading ? (
                <p>Loading your sites...</p>
            ) : sites.length === 0 ? (
                <div className="glass-card flex-center" style={{ minHeight: '200px', flexDirection: 'column', gap: '1rem' }}>
                    <Globe size={48} color="var(--text-secondary)" />
                    <p>You aren't tracking any sites yet.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {sites.map(site => (
                        <Link to={`/sites/${site._id}`} key={site._id} style={{ textDecoration: 'none' }}>
                            <div className="glass-card" style={{ transition: 'all 0.2s', cursor: 'pointer' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ color: 'var(--text-primary)' }}>{site.name}</h3>
                                    <ArrowRight size={18} color="var(--accent-primary)" />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    <Globe size={14} />
                                    <span>{site.domain}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
