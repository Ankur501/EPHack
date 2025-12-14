import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft, BookOpen, Clock, Target, Play } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const Training = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleContent, setModuleContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);
  
  useEffect(() => {
    fetchModules();
  }, []);
  
  const fetchModules = async () => {
    try {
      const token = localStorage.getItem('session_token');
      const API_URL = process.env.REACT_APP_BACKEND_URL;
      
      const response = await axios.get(`${API_URL}/api/training/modules`, {
        headers: { 'Authorization': `Bearer ${token}` },
        withCredentials: true
      });
      
      setModules(response.data.modules);
    } catch (error) {
      console.error('Error fetching modules:', error);
      toast.error('Failed to load training modules');
    } finally {
      setLoading(false);
    }
  };
  
  const loadModule = async (module) => {
    setSelectedModule(module);
    setLoadingContent(true);
    
    try {
      const token = localStorage.getItem('session_token');
      const API_URL = process.env.REACT_APP_BACKEND_URL;
      
      const response = await axios.get(`${API_URL}/api/training/modules/${module.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        withCredentials: true
      });
      
      setModuleContent(response.data);
    } catch (error) {
      console.error('Error loading module:', error);
      toast.error('Failed to load module content');
    } finally {
      setLoadingContent(false);
    }
  };
  
  if (loading) {
    return (
      <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #E2E8F0',
          borderTopColor: '#3B82F6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }
  
  if (selectedModule) {
    return (
      <div style={{minHeight: '100vh', backgroundColor: '#FFFFFF'}}>
        <nav style={{backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '16px 24px'}}>
          <Button variant="ghost" onClick={() => { setSelectedModule(null); setModuleContent(null); }} style={{color: '#64748B'}}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Modules
          </Button>
        </nav>
        
        <div className="container mx-auto px-6 py-12 max-w-4xl">
          <div style={{marginBottom: '32px'}}>
            <div style={{
              display: 'inline-block',
              padding: '6px 12px',
              backgroundColor: '#F0F9FF',
              color: '#3B82F6',
              borderRadius: '16px',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '16px'
            }}>
              {selectedModule.focus_area}
            </div>
            
            <h1 style={{fontSize: '36px', fontWeight: 600, color: '#0F172A', marginBottom: '12px'}}>
              {selectedModule.title}
            </h1>
            
            <p style={{fontSize: '18px', color: '#64748B', marginBottom: '24px'}}>
              {selectedModule.description}
            </p>
            
            <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                <Clock style={{width: '18px', height: '18px', color: '#64748B'}} />
                <span style={{fontSize: '14px', color: '#64748B'}}>{selectedModule.duration}</span>
              </div>
              <div style={{
                padding: '4px 10px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                fontSize: '13px',
                color: '#64748B'
              }}>
                {selectedModule.difficulty}
              </div>
            </div>
          </div>
          
          {loadingContent ? (
            <div style={{textAlign: 'center', padding: '60px 0'}}>
              <div style={{
                width: '48px',
                height: '48px',
                border: '4px solid #E2E8F0',
                borderTopColor: '#3B82F6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p style={{color: '#64748B'}}>Generating personalized content...</p>
            </div>
          ) : moduleContent && (
            <div>
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '32px',
                marginBottom: '32px'
              }}>
                <div style={{
                  fontSize: '15px',
                  lineHeight: 1.8,
                  color: '#1E293B',
                  whiteSpace: 'pre-line'
                }}>
                  {moduleContent.content}
                </div>
              </div>
              
              <div style={{
                backgroundColor: '#DBEAFE',
                border: '2px solid #3B82F6',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '32px'
              }}>
                <h3 style={{fontSize: '18px', fontWeight: 600, color: '#1E40AF', marginBottom: '12px'}}>
                  Ready to Practice?
                </h3>
                <p style={{fontSize: '15px', color: '#1E3A8A', marginBottom: '16px'}}>
                  Apply what you've learned by recording a practice video. Get instant AI feedback on your technique.
                </p>
                <Button 
                  onClick={() => navigate('/know-your-ep')}
                  style={{backgroundColor: '#3B82F6', color: '#FFFFFF'}}
                >
                  <Play className="mr-2 h-4 w-4" /> Start Practice Recording
                </Button>
              </div>
              
              <div style={{textAlign: 'center'}}>
                <Button
                  variant="outline"
                  onClick={() => { setSelectedModule(null); setModuleContent(null); }}
                  style={{border: '1px solid #E2E8F0'}}
                >
                  Complete Module
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div style={{minHeight: '100vh', backgroundColor: '#FFFFFF'}}>
      <nav style={{backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '16px 24px'}}>
        <Button variant="ghost" onClick={() => navigate('/dashboard')} style={{color: '#64748B'}}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
      </nav>
      
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <div style={{marginBottom: '40px'}}>
          <h1 style={{fontSize: '36px', fontWeight: 600, color: '#0F172A', marginBottom: '12px'}}>
            Training Modules
          </h1>
          <p style={{fontSize: '18px', color: '#64748B'}}>
            Structured micro-courses with AI-generated content tailored to your profile
          </p>
        </div>
        
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px'}}>
          {modules.map((module) => (
            <div
              key={module.id}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '24px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => loadModule(module)}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = '#3B82F6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#E2E8F0';
              }}
            >
              <div style={{
                display: 'inline-block',
                padding: '4px 10px',
                backgroundColor: '#F0F9FF',
                color: '#3B82F6',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 500,
                marginBottom: '12px'
              }}>
                {module.focus_area}
              </div>
              
              <h3 style={{fontSize: '18px', fontWeight: 600, color: '#0F172A', marginBottom: '8px'}}>
                {module.title}
              </h3>
              
              <p style={{fontSize: '14px', color: '#64748B', marginBottom: '16px', lineHeight: 1.6}}>
                {module.description}
              </p>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '16px',
                borderTop: '1px solid #E2E8F0'
              }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                  <Clock style={{width: '16px', height: '16px', color: '#64748B'}} />
                  <span style={{fontSize: '13px', color: '#64748B'}}>{module.duration}</span>
                </div>
                <span style={{
                  fontSize: '12px',
                  color: '#64748B',
                  padding: '4px 8px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '8px'
                }}>
                  {module.difficulty}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Training;
