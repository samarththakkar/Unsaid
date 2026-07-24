import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { ArrowLeft, Copy, Check, AlertTriangle, Lightbulb, Zap, ServerCrash } from 'lucide-react';
import toast from 'react-hot-toast';

const SeverityIcon = ({ severity }) => {
    switch(severity) {
        case 'high': return <ServerCrash size={18} color="var(--error)" />;
        case 'medium': return <AlertTriangle size={18} color="var(--warning)" />;
        case 'low': return <Lightbulb size={18} color="var(--accent-primary)" />;
        default: return <Zap size={18} />;
    }
};

export default function SiteDetails() {
    const { siteId } = useParams();
    const [site, setSite] = useState(null);
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchSiteAndInsights();
    }, [siteId]);

    const fetchSiteAndInsights = async () => {
        try {
            // First fetch all sites to find ours (since we didn't make a getSiteById route yet)
            const sitesRes = await api.get('/sites');
            const foundSite = sitesRes.data.find(s => s._id === siteId);
            setSite(foundSite);

            if (foundSite) {
                const insightsRes = await api.get(`/insights/${siteId}`);
                setInsights(insightsRes.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (insightId, newStatus) => {
        try {
            await api.patch(`/insights/${insightId}/status`, { status: newStatus });
            // Optimistic UI update
            setInsights(insights.map(i => i._id === insightId ? { ...i, status: newStatus } : i));
            toast.success(`Insight marked as ${newStatus}`);
        } catch (err) {
            toast.error(err.message || 'Failed to update status');
        }
    };

    const copyToClipboard = () => {
        const snippet = `<script src="http://localhost:8000/tracker.js" data-api-key="${site?.apiKey}"></script>`;
        navigator.clipboard.writeText(snippet);
        setCopied(true);
        toast.success('Script copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading...</div>;
    if (!site) return <div className="container" style={{ padding: '2rem' }}>Site not found.</div>;

    return (
        <div style={{ padding: '2rem' }} className="container">
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '2rem' }}>
                <ArrowLeft size={16} /> Back to Dashboard
            </Link>

            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ marginBottom: '0.5rem' }}>{site.name}</h1>
                <p>{site.domain}</p>
            </header>

            <div className="glass-card" style={{ marginBottom: '3rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Tracking Script</h3>
                <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>Copy and paste this snippet into the <code>&lt;head&gt;</code> or just before the closing <code>&lt;/body&gt;</code> tag of your website.</p>
                
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'stretch' }}>
                    <code style={{ flex: 1, background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', color: 'var(--accent-primary)', fontSize: '0.85rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                        &lt;script src="http://localhost:8000/tracker.js" data-api-key="{site.apiKey}"&gt;&lt;/script&gt;
                    </code>
                    <button className="btn" onClick={copyToClipboard}>
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                        {copied ? 'Copied' : 'Copy Code'}
                    </button>
                </div>
            </div>

            <h2>AI Bug Reports</h2>
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {insights.filter(i => i.status === 'open').length === 0 ? (
                    <div className="glass-card flex-center" style={{ minHeight: '150px' }}>
                        <p>No open bugs right now! You're all caught up.</p>
                    </div>
                ) : (
                    insights.filter(i => i.status === 'open').map(insight => (
                        <div key={insight._id} className="glass-card" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.5rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                                <SeverityIcon severity={insight.severity} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{insight.title}</h3>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
                                    <span style={{ textTransform: 'capitalize', border: '1px solid var(--border-color)', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>{insight.type}</span>
                                    <span>Location: {insight.location}</span>
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div>
                                        <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>What Happened</h4>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{insight.whatHappened}</p>
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Likely Cause</h4>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{insight.likelyCause}</p>
                                    </div>
                                </div>
                                
                                <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
                                    <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--success)', marginBottom: '0.5rem' }}>Suggested Fix</h4>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{insight.suggestedFix}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <button className="btn" onClick={() => handleUpdateStatus(insight._id, 'resolved')}>Resolve</button>
                                <button className="btn btn-outline" onClick={() => handleUpdateStatus(insight._id, 'dismissed')}>Dismiss</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
