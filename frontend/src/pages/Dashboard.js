import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { authAPI, reportAPI } from '../lib/api';
import { toast } from 'sonner';
import { Video, BookOpen, Dumbbell, Users, LogOut, BarChart3 } from 'lucide-react';
import ProfileModal from '../components/ProfileModal';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [hasProfile, setHasProfile] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('session_token');
        const API_URL = process.env.REACT_APP_BACKEND_URL;
        
        const [userRes, reportsRes, profileRes] = await Promise.all([
          authAPI.getMe(),
          reportAPI.listReports(),
          axios.get(`${API_URL}/api/profile/`, {
            headers: { 'Authorization': `Bearer ${token}` },
            withCredentials: true
          })
        ]);
        
        setUser(userRes.data);
        setReports(reportsRes.data.reports || []);
        
        if (!profileRes.data.has_profile) {
          setHasProfile(false);
          setShowProfileModal(true);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  const handleLogout = async () => {
    try {
      await authAPI.logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const tabs = [
    { name: 'Know your EP', path: '/know-your-ep', icon: Video },
    { name: 'Simulator', path: '/simulator', icon: BarChart3 },
    { name: 'Learning Bytes', path: '/learning', icon: BookOpen },
    { name: 'Training', path: '/training', icon: Dumbbell },
    { name: 'Executive Coaching', path: '/coaching', icon: Users },
  ];
  
  if (loading) {
    return (
      <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
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
    <>
      {showProfileModal && (
        <ProfileModal 
          onComplete={() => {
            setShowProfileModal(false);
            setHasProfile(true);
            toast.success('Profile completed! Your analysis will now be tailored to your role.');
          }}
          onClose={() => setShowProfileModal(false)}
        />
      )}
      
      <div style={{minHeight: '100vh', backgroundColor: '#FAFAFA'}}>
        <nav style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.02)'
        }} data-testid="main-nav">
          <div className="container mx-auto px-6 py-4">
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div style={{fontSize: '22px', fontWeight: 600, color: '#0F172A'}}>
                EP <span style={{color: '#D4AF37'}}>Quotient</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                <div style={{fontSize: '14px'}}>
                  <span style={{color: '#64748B'}}>Welcome, </span>
                  <span style={{fontWeight: 600, color: '#0F172A'}}>{user?.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="logout-button">
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </Button>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: '1px solid #E2E8F0',
              overflowX: 'auto'
            }}>
              {tabs.map((tab) => (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#64748B',
                    backgroundColor: 'transparent',
                    border: '1px solid transparent',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
                    e.currentTarget.style.color = '#D4AF37';
                    e.currentTarget.style.borderColor = '#D4AF37';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#64748B';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                  data-testid={`tab-${tab.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <tab.icon style={{width: '16px', height: '16px'}} />
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
        </nav>
        
        <div className="container mx-auto px-6 py-12">
          <div style={{marginBottom: '48px'}}>
            <h1 style={{fontSize: '42px', fontWeight: 700, color: '#0F172A', marginBottom: '12px'}}>
              Your <span style={{color: '#D4AF37'}}>EP Dashboard</span>
            </h1>
            <p style={{fontSize: '18px', color: '#64748B'}}>Track your executive presence journey</p>
          </div>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '48px'}}>
            {tabs.map((tab, idx) => (
              <button
                key={idx}
                onClick={() => navigate(tab.path)}
                className="card-3d"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '2px solid #D4AF37',
                  borderRadius: '16px',
                  padding: '32px',
                  textAlign: 'left',
                  width: '100%',
                  cursor: 'pointer'
                }}
                data-testid={`card-${tab.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <tab.icon style={{width: '28px', height: '28px', color: '#D4AF37'}} />
                </div>
                <h3 style={{fontSize: '20px', fontWeight: 600, color: '#0F172A', marginBottom: '8px'}}>{tab.name}</h3>
                <p style={{fontSize: '14px', color: '#64748B', lineHeight: 1.6}}>
                  {idx === 0 && 'Upload and analyze your executive presence video'}
                  {idx === 1 && 'Practice with challenging boardroom scenarios'}
                  {idx === 2 && 'Daily tips and recommended TED talks'}
                  {idx === 3 && 'Structured micro-courses for skill building'}
                  {idx === 4 && 'Book sessions and share reports with coaches'}
                </p>
              </button>
            ))}
          </div>
          
          <div className="card-3d" style={{
            backgroundColor: '#FFFFFF',
            border: '2px solid #D4AF37',
            borderRadius: '16px',
            padding: '32px'
          }}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px'}}>
              <h2 style={{fontSize: '28px', fontWeight: 700, color: '#0F172A'}}>
                Your <span style={{color: '#D4AF37'}}>Reports</span>
              </h2>
              <Button onClick={() => navigate('/know-your-ep')} data-testid="new-assessment-button">
                <Video className="mr-2 h-4 w-4" /> New Assessment
              </Button>
            </div>
            
            {reports.length === 0 ? (
              <div style={{textAlign: 'center', padding: '60px 0'}} data-testid="empty-reports">
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <BarChart3 style={{width: '40px', height: '40px', color: '#D4AF37'}} />
                </div>
                <p style={{fontSize: '18px', color: '#1E293B', marginBottom: '8px', fontWeight: 600}}>No reports yet</p>
                <p style={{fontSize: '15px', color: '#64748B', marginBottom: '24px'}}>Start your first EP assessment to see your results here</p>
                <Button onClick={() => navigate('/know-your-ep')}>
                  <Video className="mr-2 h-4 w-4" /> Create First Assessment
                </Button>
              </div>
            ) : (
              <div style={{display: 'grid', gap: '16px'}} data-testid="reports-list">
                {reports.map((report) => (
                  <div
                    key={report.report_id}
                    onClick={() => navigate(`/report/${report.report_id}`)}
                    className="card-hover"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '20px',
                      border: '2px solid #E2E8F0',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      backgroundColor: '#FAFAFA'
                    }}
                    data-testid={`report-${report.report_id}`}
                  >
                    <div style={{flex: 1}}>
                      <div style={{fontSize: '16px', fontWeight: 600, color: '#0F172A', marginBottom: '6px'}}>EP Report</div>
                      <div style={{fontSize: '14px', color: '#64748B'}}>
                        {new Date(report.created_at).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </div>
                    </div>
                    <div style={{textAlign: 'right'}}>
                      <div style={{
                        fontSize: '32px',
                        fontWeight: 700,
                        color: '#D4AF37',
                        fontFamily: 'IBM Plex Mono',
                        lineHeight: 1
                      }}>
                        {report.overall_score}
                      </div>
                      <div style={{fontSize: '13px', color: '#64748B', marginTop: '4px'}}>Overall Score</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
