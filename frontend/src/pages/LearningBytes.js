import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft, Lightbulb, Video, ExternalLink, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const LearningBytes = () => {
  const navigate = useNavigate();
  const [dailyTip, setDailyTip] = useState(null);
  const [tedTalks, setTedTalks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const fetchContent = async () => {
    try {
      const token = localStorage.getItem('session_token');
      const API_URL = process.env.REACT_APP_BACKEND_URL;
      
      const [tipRes, talksRes] = await Promise.all([
        axios.get(`${API_URL}/api/learning/daily-tip`, {
          headers: { 'Authorization': `Bearer ${token}` },
          withCredentials: true
        }),
        axios.get(`${API_URL}/api/learning/ted-talks`, {
          headers: { 'Authorization': `Bearer ${token}` },
          withCredentials: true
        })
      ]);
      
      setDailyTip(tipRes.data);
      setTedTalks(talksRes.data.talks);
    } catch (error) {
      console.error('Error fetching learning content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchContent();
  }, []);
  
  const handleRefreshTip = async () => {
    setRefreshing(true);
    await fetchContent();
    toast.success('New tip generated!');
  };
  
  if (loading) {
    return (
      <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAFA'}}>
        <div style={{textAlign: 'center'}}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #E2E8F0',
            borderTopColor: '#D4AF37',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{color: '#64748B'}}>Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{minHeight: '100vh', backgroundColor: '#FAFAFA'}}>
      <nav style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <Button variant="ghost" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
      </nav>
      
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <div style={{marginBottom: '40px'}}>
          <h1 style={{fontSize: '42px', fontWeight: 700, color: '#0F172A', marginBottom: '12px'}}>
            Learning <span style={{color: '#D4AF37'}}>Bytes</span>
          </h1>
          <p style={{fontSize: '18px', color: '#64748B'}}>
            Daily insights and expert resources to enhance your executive presence
          </p>
        </div>
        
        {dailyTip && (
          <div className="card-3d" style={{
            backgroundColor: 'rgba(212, 175, 55, 0.05)',
            border: '2px solid #D4AF37',
            borderRadius: '16px',
            padding: '32px',
            marginBottom: '40px'
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(212, 175, 55, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Lightbulb style={{width: '24px', height: '24px', color: '#D4AF37'}} />
                </div>
                <div>
                  <h2 style={{fontSize: '20px', fontWeight: 600, color: '#0F172A'}}>
                    Daily Tip — {dailyTip.category}
                  </h2>
                  <p style={{fontSize: '13px', color: '#64748B', marginTop: '4px'}}>
                    AI-generated for your profile
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshTip}
                disabled={refreshing}
                style={{color: '#D4AF37'}}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                New Tip
              </Button>
            </div>
            <p style={{
              fontSize: '17px',
              color: '#1E293B',
              lineHeight: 1.7,
              fontWeight: 400
            }}>
              {dailyTip.tip}
            </p>
          </div>
        )}
        
        <div style={{marginBottom: '24px'}}>
          <h2 style={{fontSize: '28px', fontWeight: 700, color: '#0F172A', marginBottom: '8px'}}>
            Recommended <span style={{color: '#D4AF37'}}>TED Talks</span>
          </h2>
          <p style={{fontSize: '15px', color: '#64748B'}}>
            Expert insights on leadership, communication, and presence
          </p>
        </div>
        
        <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          {tedTalks.map((talk) => (
            <div
              key={talk.id}
              className="card-3d"
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid #E2E8F0',
                borderRadius: '16px',
                padding: '24px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#D4AF37';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px -8px rgba(212, 175, 55, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                <div style={{flex: 1}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                    <Video style={{width: '18px', height: '18px', color: '#D4AF37'}} />
                    <span style={{fontSize: '13px', color: '#64748B', fontWeight: 500}}>
                      {talk.duration}
                    </span>
                  </div>
                  
                  <h3 style={{fontSize: '18px', fontWeight: 600, color: '#0F172A', marginBottom: '4px'}}>
                    {talk.title}
                  </h3>
                  
                  <p style={{fontSize: '14px', color: '#D4AF37', marginBottom: '8px', fontWeight: 500}}>
                    by {talk.speaker}
                  </p>
                  
                  <p style={{fontSize: '15px', color: '#1E293B', marginBottom: '12px', lineHeight: 1.6}}>
                    {talk.description}
                  </p>
                  
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px'}}>
                    {talk.relevance.split(', ').map((tag, idx) => (
                      <span key={idx} style={{
                        backgroundColor: 'rgba(212, 175, 55, 0.1)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        borderRadius: '12px',
                        padding: '4px 10px',
                        fontSize: '12px',
                        color: '#92400E'
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <a
                    href={talk.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{textDecoration: 'none'}}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      style={{border: '2px solid #D4AF37', color: '#D4AF37'}}
                    >
                      Watch on TED <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="card-3d" style={{
          marginTop: '48px',
          backgroundColor: 'rgba(212, 175, 55, 0.05)',
          border: '2px solid #D4AF37',
          borderRadius: '16px',
          padding: '32px',
          textAlign: 'center'
        }}>
          <h3 style={{fontSize: '22px', fontWeight: 700, color: '#0F172A', marginBottom: '8px'}}>
            Want Personalized Learning?
          </h3>
          <p style={{fontSize: '15px', color: '#64748B', marginBottom: '20px', maxWidth: '500px', margin: '0 auto 20px'}}>
            Complete video assessments to get AI-powered recommendations tailored to your specific areas for improvement.
          </p>
          <Button onClick={() => navigate('/know-your-ep')} style={{backgroundColor: '#D4AF37', color: '#FFFFFF'}}>
            Start Assessment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LearningBytes;
