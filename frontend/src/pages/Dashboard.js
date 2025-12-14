import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { authAPI, reportAPI } from '../lib/api';
import { toast } from 'sonner';
import { Video, BookOpen, Dumbbell, Users, LogOut, BarChart3, HelpCircle } from 'lucide-react';
import ProfileModal from '../components/ProfileModal';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
  
  const navItems = [
    { name: 'Know your EP', path: '/know-your-ep', icon: Video, desc: 'Analyze your video' },
    { name: 'Simulator', path: '/simulator', icon: BarChart3, desc: 'Practice scenarios' },
    { name: 'Learning Bytes', path: '/learning', icon: BookOpen, desc: 'Daily tips' },
    { name: 'Training', path: '/training', icon: Dumbbell, desc: 'Skill courses' },
    { name: 'Executive Coaching', path: '/coaching', icon: Users, desc: 'Book sessions' },
    { name: 'How It Works', path: '/methodology', icon: HelpCircle, desc: 'Our methodology' },
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
        {/* Top Navigation Bar with Nav Items */}
        <nav style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }} data-testid="main-nav">
          <div className="container mx-auto px-6">
            {/* Top row - Logo and user info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 0',
              borderBottom: '1px solid #F1F5F9'
            }}>
              <div 
                onClick={() => navigate('/dashboard')}
                style={{fontSize: '24px', fontWeight: 700, color: '#0F172A', cursor: 'pointer'}}
              >
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
            
            {/* Navigation Items Row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 0',
              overflowX: 'auto'
            }}>
              {navItems.map((item, idx) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={idx}
                    onClick={() => navigate(item.path)}
                    className="nav-item-3d"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 20px',
                      backgroundColor: isActive ? 'rgba(212, 175, 55, 0.1)' : '#FFFFFF',
                      border: isActive ? '2px solid #D4AF37' : '2px solid transparent',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      whiteSpace: 'nowrap',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.border = '2px solid #D4AF37';
                        e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.05)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px -4px rgba(212, 175, 55, 0.25), 0 0 0 1px rgba(212, 175, 55, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.border = '2px solid transparent';
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                    data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: isActive ? '#D4AF37' : 'rgba(212, 175, 55, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease'
                    }}>
                      <item.icon style={{
                        width: '18px',
                        height: '18px',
                        color: isActive ? '#FFFFFF' : '#D4AF37'
                      }} />
                    </div>
                    <div style={{textAlign: 'left'}}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: isActive ? '#D4AF37' : '#0F172A'
                      }}>
                        {item.name}
                      </div>
                      <div style={{fontSize: '11px', color: '#64748B'}}>
                        {item.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
        
        {/* Main Content */}
        <div className="container mx-auto px-6 py-12">
          <div style={{marginBottom: '48px'}}>
            <h1 style={{fontSize: '42px', fontWeight: 700, color: '#0F172A', marginBottom: '12px'}}>
              Your <span style={{color: '#D4AF37'}}>EP Dashboard</span>
            </h1>
            <p style={{fontSize: '18px', color: '#64748B'}}>Track your executive presence journey with AI-powered analysis</p>
          </div>
          
          {/* Reports Section */}
          <div className="card-3d" style={{
            backgroundColor: '#FFFFFF',
            border: '2px solid #E2E8F0',
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
                      backgroundColor: '#FAFAFA',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#D4AF37';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#E2E8F0';
                      e.currentTarget.style.boxShadow = 'none';
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
                        fontFamily: 'IBM Plex Mono, monospace',
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
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .nav-item-3d {
          transform-style: preserve-3d;
        }
      `}</style>
    </>
  );
};

export default Dashboard;
