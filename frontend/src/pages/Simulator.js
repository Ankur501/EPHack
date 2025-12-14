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
            const reportPath = `/report/${job.job_id.replace('job_', 'report_')}`;
            navigate(reportPath);
          }, 1000);
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
  
  if (selectedScenario && !processing) {
    return (
      <div style={{minHeight: '100vh', backgroundColor: '#FFFFFF'}}>
        <nav style={{backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '16px 24px'}}>
          <Button variant="ghost" onClick={() => {setSelectedScenario(null); setRecordedChunks([]);}} style={{color: '#64748B'}}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Scenarios
          </Button>
        </nav>
        
        <div className="container mx-auto px-6 py-12 max-w-5xl">
          <div style={{marginBottom: '32px'}}>
            <h1 style={{fontSize: '32px', fontWeight: 600, color: '#0F172A', marginBottom: '16px'}}>
              {selectedScenario.title}
            </h1>
            
            <div style={{
              backgroundColor: '#FEF3C7',
              border: '1px solid #FCD34D',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <h3 style={{fontSize: '16px', fontWeight: 600, color: '#92400E', marginBottom: '8px'}}>
                Situation:
              </h3>
              <p style={{fontSize: '15px', color: '#78350F', lineHeight: 1.6}}>
                {selectedScenario.situation}
              </p>
            </div>
            
            <div style={{
              backgroundColor: '#DBEAFE',
              border: '1px solid #93C5FD',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <h3 style={{fontSize: '16px', fontWeight: 600, color: '#1E40AF', marginBottom: '8px'}}>
                Your Task:
              </h3>
              <p style={{fontSize: '15px', color: '#1E3A8A', lineHeight: 1.6}}>
                {selectedScenario.prompt}
              </p>
            </div>
            
            <div style={{display: 'flex', gap: '8px', marginBottom: '24px'}}>
              {selectedScenario.focus.map((item, idx) => (
                <span key={idx} style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '4px 12px',
                  fontSize: '13px',
                  color: '#64748B'
                }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
          
          <div style={{
            aspectRatio: '16/9',
            backgroundColor: '#000000',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '24px'
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
                style={{backgroundColor: '#3B82F6', color: '#FFFFFF', padding: '12px 32px'}}
              >
                <Video className="mr-2 h-5 w-5" /> Start Recording
              </Button>
            ) : (
              <Button 
                onClick={stopRecording}
                size="lg"
                style={{backgroundColor: '#EF4444', color: '#FFFFFF', padding: '12px 32px'}}
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
      <div style={{minHeight: '100vh', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center'}}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid #E2E8F0',
            borderTopColor: '#3B82F6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 24px'
          }}></div>
          <h2 style={{fontSize: '24px', fontWeight: 600, color: '#0F172A', marginBottom: '8px'}}>
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
    <div style={{minHeight: '100vh', backgroundColor: '#FFFFFF'}}>
      <nav style={{backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '16px 24px'}}>
        <Button variant="ghost" onClick={() => navigate('/dashboard')} style={{color: '#64748B'}}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
      </nav>
      
      <div className="container mx-auto px-6 py-12">
        <div style={{marginBottom: '32px'}}>
          <h1 style={{fontSize: '36px', fontWeight: 600, color: '#0F172A', marginBottom: '12px'}}>
            Boardroom Simulator
          </h1>
          <p style={{fontSize: '18px', color: '#64748B'}}>
            Practice high-pressure executive scenarios with AI-powered feedback
          </p>
        </div>
        
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px'}}>
          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '24px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => setSelectedScenario(scenario)}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = '#3B82F6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#E2E8F0';
              }}
            >
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px'}}>
                <h3 style={{fontSize: '20px', fontWeight: 600, color: '#0F172A'}}>
                  {scenario.title}
                </h3>
                <span style={{
                  backgroundColor: scenario.difficulty === 'High' ? '#FEE2E2' : scenario.difficulty === 'Medium' ? '#FEF3C7' : '#DBEAFE',
                  color: scenario.difficulty === 'High' ? '#991B1B' : scenario.difficulty === 'Medium' ? '#92400E' : '#1E40AF',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 500
                }}>
                  {scenario.difficulty}
                </span>
              </div>
              
              <p style={{fontSize: '14px', color: '#64748B', marginBottom: '16px', lineHeight: 1.6}}>
                {scenario.situation}
              </p>
              
              <div style={{display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '16px', borderTop: '1px solid #E2E8F0'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                  <Clock style={{width: '16px', height: '16px', color: '#64748B'}} />
                  <span style={{fontSize: '13px', color: '#64748B'}}>{scenario.duration}</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                  <Target style={{width: '16px', height: '16px', color: '#64748B'}} />
                  <span style={{fontSize: '13px', color: '#64748B'}}>{scenario.focus.length} focus areas</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Simulator;
