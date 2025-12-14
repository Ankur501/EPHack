import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft, Video, Clock, Target } from 'lucide-react';
import Webcam from 'react-webcam';
import { videoAPI } from '../lib/api';
import { toast } from 'sonner';

const Simulator = () => {
  const navigate = useNavigate();
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [processing, setProcessing] = useState(false);
  
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  
  const scenarios = [
    {
      id: 1,
      title: 'Board Crisis Response',
      difficulty: 'High',
      duration: '2-3 min',
      situation: 'Your company\'s stock dropped 15% overnight due to a competitor announcement. The board wants immediate answers.',
      prompt: 'Address the board: What is your strategic response? How will you stabilize the situation and regain competitive advantage?',
      focus: ['Decisiveness', 'Strategic Thinking', 'Poise Under Pressure']
    },
    {
      id: 2,
      title: 'Investor Pitch Under Scrutiny',
      difficulty: 'High',
      duration: '2-3 min',
      situation: 'You\'re pitching to investors who just heard concerns about your burn rate and timeline to profitability.',
      prompt: 'Present your financial strategy and growth projections. Address their concerns with confidence and data.',
      focus: ['Vision Articulation', 'Financial Acumen', 'Credibility']
    },
    {
      id: 3,
      title: 'Stakeholder Conflict Resolution',
      difficulty: 'Medium',
      duration: '2-3 min',
      situation: 'Two key departments are in conflict over resource allocation, impacting delivery timelines.',
      prompt: 'Present your resolution approach. How will you balance competing needs while maintaining team morale?',
      focus: ['Emotional Intelligence', 'Diplomacy', 'Leadership']
    },
    {
      id: 4,
      title: 'Executive Town Hall',
      difficulty: 'Medium',
      duration: '2-3 min',
      situation: 'Company-wide layoffs were just announced. Remaining employees are anxious about job security and direction.',
      prompt: 'Address the company with transparency, empathy, and a clear path forward. Rebuild trust and confidence.',
      focus: ['Authenticity', 'Empathy', 'Vision Communication']
    },
    {
      id: 5,
      title: 'Strategic Pivot Announcement',
      difficulty: 'Medium',
      duration: '2-3 min',
      situation: 'Your company is pivoting strategy after 2 years. Some key stakeholders are skeptical.',
      prompt: 'Announce the pivot with conviction. Explain the reasoning, mitigate concerns, and rally support.',
      focus: ['Change Management', 'Strategic Vision', 'Persuasion']
    },
    {
      id: 6,
      title: 'Performance Review Challenge',
      difficulty: 'Low',
      duration: '2-3 min',
      situation: 'A high-performing team member is demanding a promotion that isn\'t aligned with company structure.',
      prompt: 'Deliver constructive feedback while retaining this valuable employee. Balance honesty with encouragement.',
      focus: ['Coaching', 'Honest Communication', 'Retention Strategy']
    }
  ];
  
  const startRecording = () => {
    setIsRecording(true);
    const stream = webcamRef.current?.stream;
    if (!stream) return;
    
    mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
    
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        setRecordedChunks((prev) => [...prev, event.data]);
      }
    };
    
    mediaRecorderRef.current.start();
    
    setTimeout(() => {
      stopRecording();
    }, 180000);
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const handleSubmit = async () => {
    if (recordedChunks.length === 0) return;
    
    setProcessing(true);
    
    try {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const file = new File([blob], `scenario_${selectedScenario.id}.webm`, { type: 'video/webm' });
      
      const uploadResponse = await videoAPI.upload(file);
      const videoId = uploadResponse.data.video_id;
      
      const processResponse = await videoAPI.process(videoId);
      const jobId = processResponse.data.job_id;
      
      toast.success('Video submitted! Processing analysis...');
      
      const pollInterval = setInterval(async () => {
        const statusResponse = await videoAPI.getJobStatus(jobId);
        const job = statusResponse.data;
        
        if (job.status === 'completed') {
          clearInterval(pollInterval);
          toast.success('Analysis complete!');
          setTimeout(() => {
            if (job.report_id) {
              navigate(`/report/${job.report_id}`);
            } else {
              toast.error('Report not found for this job');
              setProcessing(false);
            }
          }, 500);
        } else if (job.status === 'failed') {
          clearInterval(pollInterval);
          toast.error('Processing failed: ' + job.error);
          setProcessing(false);
        }
      }, 2000);
    } catch (error) {
      toast.error('Failed to process video');
      setProcessing(false);
    }
  };
  
  React.useEffect(() => {
    if (recordedChunks.length > 0 && !isRecording) {
      handleSubmit();
    }
  }, [recordedChunks, isRecording]);
  
  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'High': return { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA' };
      case 'Medium': return { bg: 'rgba(212, 175, 55, 0.15)', text: '#92400E', border: 'rgba(212, 175, 55, 0.4)' };
      default: return { bg: '#DCFCE7', text: '#166534', border: '#BBF7D0' };
    }
  };
  
  if (selectedScenario && !processing) {
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
          <Button variant="ghost" onClick={() => {setSelectedScenario(null); setRecordedChunks([]);}}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Scenarios
          </Button>
        </nav>
        
        <div className="container mx-auto px-6 py-12 max-w-5xl">
          <div style={{marginBottom: '32px'}}>
            <h1 style={{fontSize: '32px', fontWeight: 700, color: '#0F172A', marginBottom: '16px'}}>
              {selectedScenario.title}
            </h1>
            
            <div className="card-3d" style={{
              backgroundColor: 'rgba(212, 175, 55, 0.08)',
              border: '2px solid rgba(212, 175, 55, 0.4)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <h3 style={{fontSize: '16px', fontWeight: 700, color: '#92400E', marginBottom: '8px'}}>
                Situation:
              </h3>
              <p style={{fontSize: '15px', color: '#78350F', lineHeight: 1.6}}>
                {selectedScenario.situation}
              </p>
            </div>
            
            <div className="card-3d" style={{
              backgroundColor: '#FFFFFF',
              border: '2px solid #D4AF37',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <h3 style={{fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '8px'}}>
                Your Task:
              </h3>
              <p style={{fontSize: '15px', color: '#1E293B', lineHeight: 1.6}}>
                {selectedScenario.prompt}
              </p>
            </div>
            
            <div style={{display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap'}}>
              {selectedScenario.focus.map((item, idx) => (
                <span key={idx} style={{
                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '16px',
                  padding: '6px 14px',
                  fontSize: '13px',
                  color: '#92400E',
                  fontWeight: 500
                }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
          
          <div style={{
            aspectRatio: '16/9',
            backgroundColor: '#000000',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '24px',
            border: '3px solid #D4AF37'
          }}>
            <Webcam
              ref={webcamRef}
              audio={true}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div style={{display: 'flex', gap: '12px', justifyContent: 'center'}}>
            {!isRecording ? (
              <Button 
                onClick={startRecording}
                size="lg"
                style={{backgroundColor: '#D4AF37', color: '#FFFFFF', padding: '14px 36px', fontSize: '16px'}}
              >
                <Video className="mr-2 h-5 w-5" /> Start Recording
              </Button>
            ) : (
              <Button 
                onClick={stopRecording}
                size="lg"
                style={{backgroundColor: '#EF4444', color: '#FFFFFF', padding: '14px 36px', fontSize: '16px'}}
              >
                Stop Recording
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  if (processing) {
    return (
      <div style={{minHeight: '100vh', backgroundColor: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center'}}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid #E2E8F0',
            borderTopColor: '#D4AF37',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 24px'
          }}></div>
          <h2 style={{fontSize: '24px', fontWeight: 700, color: '#0F172A', marginBottom: '8px'}}>
            Analyzing Your Response
          </h2>
          <p style={{fontSize: '16px', color: '#64748B'}}>
            Processing video with AI analysis...
          </p>
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
      
      <div className="container mx-auto px-6 py-12">
        <div style={{marginBottom: '40px'}}>
          <h1 style={{fontSize: '42px', fontWeight: 700, color: '#0F172A', marginBottom: '12px'}}>
            Boardroom <span style={{color: '#D4AF37'}}>Simulator</span>
          </h1>
          <p style={{fontSize: '18px', color: '#64748B'}}>
            Practice high-pressure executive scenarios with AI-powered feedback
          </p>
        </div>
        
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px'}}>
          {scenarios.map((scenario) => {
            const diffColors = getDifficultyColor(scenario.difficulty);
            return (
              <div
                key={scenario.id}
                className="card-3d"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '2px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setSelectedScenario(scenario)}
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
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px'}}>
                  <h3 style={{fontSize: '20px', fontWeight: 600, color: '#0F172A'}}>
                    {scenario.title}
                  </h3>
                  <span style={{
                    backgroundColor: diffColors.bg,
                    color: diffColors.text,
                    border: `1px solid ${diffColors.border}`,
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    {scenario.difficulty}
                  </span>
                </div>
                
                <p style={{fontSize: '14px', color: '#64748B', marginBottom: '16px', lineHeight: 1.6}}>
                  {scenario.situation}
                </p>
                
                <div style={{display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '16px', borderTop: '1px solid #E2E8F0'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                    <Clock style={{width: '16px', height: '16px', color: '#D4AF37'}} />
                    <span style={{fontSize: '13px', color: '#64748B'}}>{scenario.duration}</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                    <Target style={{width: '16px', height: '16px', color: '#D4AF37'}} />
                    <span style={{fontSize: '13px', color: '#64748B'}}>{scenario.focus.length} focus areas</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Simulator;
