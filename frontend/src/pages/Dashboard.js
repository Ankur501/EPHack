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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border sticky top-0 z-50" data-testid="main-nav">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="font-display text-2xl font-bold text-primary">EP Quotient</div>
            <div className="flex items-center gap-6">
              <div className="text-sm">
                <span className="text-muted-foreground">Welcome, </span>
                <span className="font-medium">{user?.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="logout-button">
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            </div>
          </div>
          
          <div className="flex gap-6 mt-6 border-t border-border pt-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-secondary/50 rounded-full transition-colors whitespace-nowrap"
                data-testid={`tab-${tab.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </nav>
      
      <div className="container mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="font-display text-4xl font-bold mb-4">Your EP Dashboard</h1>
          <p className="text-lg text-muted-foreground">Track your executive presence journey</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {tabs.map((tab, idx) => (
            <button
              key={idx}
              onClick={() => navigate(tab.path)}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-accent/50 transition-all text-left group"
              data-testid={`card-${tab.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <tab.icon className="h-8 w-8 text-accent mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-display text-xl font-semibold mb-2">{tab.name}</h3>
              <p className="text-sm text-muted-foreground">
                {idx === 0 && 'Upload and analyze your executive presence video'}
                {idx === 1 && 'Practice with challenging boardroom scenarios'}
                {idx === 2 && 'Daily tips and recommended TED talks'}
                {idx === 3 && 'Structured micro-courses for skill building'}
                {idx === 4 && 'Book sessions and share reports with coaches'}
              </p>
            </button>
          ))}
        </div>
        
        <div className="bg-card border border-border rounded-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold">Your Reports</h2>
            <Button onClick={() => navigate('/know-your-ep')} data-testid="new-assessment-button">
              <Video className="mr-2 h-4 w-4" /> New Assessment
            </Button>
          </div>
          
          {reports.length === 0 ? (
            <div className="text-center py-12" data-testid="empty-reports">
              <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground mb-4">No reports yet</p>
              <p className="text-sm text-muted-foreground mb-6">Start your first EP assessment to see your results here</p>
              <Button onClick={() => navigate('/know-your-ep')}>
                <Video className="mr-2 h-4 w-4" /> Create First Assessment
              </Button>
            </div>
          ) : (
            <div className="space-y-4" data-testid="reports-list">
              {reports.map((report) => (
                <div
                  key={report.report_id}
                  onClick={() => navigate(`/report/${report.report_id}`)}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
                  data-testid={`report-${report.report_id}`}
                >
                  <div className="flex-1">
                    <div className="font-medium mb-1">EP Report</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(report.created_at).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-accent font-mono">
                      {report.overall_score}
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Score</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
