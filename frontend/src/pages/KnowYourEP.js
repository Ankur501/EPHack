import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { videoAPI } from '../lib/api';
import { toast } from 'sonner';
import { Upload, Video, PlayCircle, ArrowLeft } from 'lucide-react';
import Webcam from 'react-webcam';

const KnowYourEP = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('intro');
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [jobId, setJobId] = useState(null);
  const [currentStep, setCurrentStep] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 200 * 1024 * 1024) {
      toast.error('File size must be less than 200MB');
      return;
    }
    
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setStep('preview');
  };
  
  const startRecording = () => {
    setIsRecording(true);
    const stream = webcamRef.current?.stream;
    if (!stream) return;
    
    mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType: 'video/webm'
    });
    
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        setRecordedChunks((prev) => [...prev, event.data]);
      }
    };
    
    mediaRecorderRef.current.start();
    
    setTimeout(() => {
      stopRecording();
    }, 240000);
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  React.useEffect(() => {
    if (recordedChunks.length > 0 && !isRecording) {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const file = new File([blob], 'recorded-video.webm', { type: 'video/webm' });
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(blob));
      setStep('preview');
      setRecordedChunks([]);
    }
  }, [recordedChunks, isRecording]);
  
  const handleUploadAndProcess = async () => {
    if (!videoFile) return;
    
    setUploading(true);
    try {
      const uploadResponse = await videoAPI.upload(videoFile, (percent) => {
        console.log('Upload progress:', percent);
      });
      
      const videoId = uploadResponse.data.video_id;
      toast.success('Video uploaded successfully');
      
      setUploading(false);
      setProcessing(true);
      setStep('processing');
      
      const processResponse = await videoAPI.process(videoId);
      const newJobId = processResponse.data.job_id;
      setJobId(newJobId);
      
      pollJobStatus(newJobId);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Upload failed');
      setUploading(false);
      setProcessing(false);
    }
  };
  
  const pollJobStatus = async (jobId) => {
    const interval = setInterval(async () => {
      try {
        const statusResponse = await videoAPI.getJobStatus(jobId);
        const job = statusResponse.data;
        
        setProgress(job.progress);
        setCurrentStep(job.current_step);
        
        if (job.status === 'completed') {
          clearInterval(interval);
          toast.success('Analysis complete!');
          
          const reportId = await getReportId(jobId);
          if (reportId) {
            navigate(`/report/${reportId}`);
          }
        } else if (job.status === 'failed') {
          clearInterval(interval);
          toast.error('Processing failed: ' + job.error);
          setProcessing(false);
        }
      } catch (error) {
        console.error('Error polling job:', error);
      }
    }, 2000);
  };
  
  const getReportId = async (jobId) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const { data } = await videoAPI.getJobStatus(jobId);
      return null;
    } catch {
      return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <nav style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '16px 24px'
      }}>
        <Button variant="ghost" onClick={() => navigate('/dashboard')} data-testid="back-to-dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
      </nav>
      
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {step === 'intro' && (
          <div data-testid="intro-step">
            <h1 style={{fontSize: '42px', fontWeight: 700, color: '#0F172A', marginBottom: '12px'}}>
              Know Your <span style={{color: '#D4AF37'}}>EP</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Record or upload a 3-minute video and get your Executive Presence report in 2-3 minutes
            </p>
            
            <div className="card-3d" style={{
              padding: '32px',
              marginBottom: '24px',
              backgroundColor: 'rgba(212, 175, 55, 0.05)',
              border: '2px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '12px'
            }}>
              <h3 className="font-display text-xl font-semibold mb-4">Recording Instructions</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Duration:</strong> 2-4 minutes (recommend ~3 minutes)</p>
                <p><strong>Content:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Intro & your role (30-40 seconds)</li>
                  <li>Key initiative you're leading (60-90 seconds)</li>
                  <li>Story about a leadership challenge (60-90 seconds)</li>
                </ul>
                <p><strong>Setup:</strong> Face camera, upper torso visible, good lighting</p>
              </div>
            </div>
            
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px'}}>
              <button 
                onClick={() => setStep('record')}
                className="card-3d"
                style={{
                  height: '180px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '16px',
                  backgroundColor: '#FFFFFF',
                  border: '2px solid #D4AF37',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#0F172A'
                }}
                data-testid="record-button"
              >
                <Video style={{width: '40px', height: '40px', color: '#D4AF37'}} />
                <span>Record Video</span>
              </button>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="card-3d"
                style={{
                  height: '180px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '16px',
                  backgroundColor: '#FFFFFF',
                  border: '2px solid #D4AF37',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#0F172A'
                }}
                data-testid="upload-button"
              >
                <Upload style={{width: '40px', height: '40px', color: '#D4AF37'}} />
                <span>Upload Video</span>
              </button>
              
              <input 
                ref={fileInputRef}
                type="file" 
                accept="video/*" 
                className="hidden" 
                onChange={handleFileSelect}
              />
            </div>
          </div>
        )}
        
        {step === 'record' && (
          <div data-testid="record-step">
            <h2 className="font-display text-3xl font-bold mb-6">Record Your Video</h2>
            
            <div className="aspect-video bg-black rounded-xl overflow-hidden mb-6">
              <Webcam
                ref={webcamRef}
                audio={true}
                className="w-full h-full object-cover"
                data-testid="webcam"
              />
            </div>
            
            <div className="flex gap-4">
              <Button 
                onClick={isRecording ? stopRecording : startRecording}
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                data-testid={isRecording ? "stop-recording" : "start-recording"}
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Button>
              <Button variant="outline" onClick={() => setStep('intro')}>Cancel</Button>
            </div>
          </div>
        )}
        
        {step === 'preview' && (
          <div data-testid="preview-step">
            <h2 className="font-display text-3xl font-bold mb-6">Preview & Upload</h2>
            
            <div className="aspect-video bg-black rounded-xl overflow-hidden mb-6">
              <video src={videoPreview} controls className="w-full h-full" data-testid="video-preview" />
            </div>
            
            <div className="flex gap-4">
              <Button 
                onClick={handleUploadAndProcess}
                size="lg"
                disabled={uploading}
                data-testid="process-button"
              >
                {uploading ? 'Uploading...' : 'Process Video'}
              </Button>
              <Button variant="outline" onClick={() => { setStep('intro'); setVideoFile(null); }}>
                Retake
              </Button>
            </div>
          </div>
        )}
        
        {step === 'processing' && (
          <div className="text-center" data-testid="processing-step">
            <div className="mb-8">
              <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <PlayCircle className="h-12 w-12 text-accent animate-pulse" />
              </div>
              <h2 className="font-display text-3xl font-bold mb-2">Processing Your Video</h2>
              <p className="text-muted-foreground">This will take 2-3 minutes</p>
            </div>
            
            <div className="max-w-md mx-auto mb-8">
              <Progress value={progress} className="mb-2" data-testid="progress-bar" />
              <p className="text-sm text-muted-foreground" data-testid="current-step">{currentStep}</p>
            </div>
            
            <div className="max-w-2xl mx-auto text-left space-y-4">
              {[
                { label: 'Transcribing', done: progress > 20 },
                { label: 'Audio metrics', done: progress > 35 },
                { label: 'Video signals', done: progress > 50 },
                { label: 'Narrative analysis', done: progress > 70 },
                { label: 'Scoring', done: progress > 85 },
                { label: 'Report', done: progress >= 100 },
              ].map((stage, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${stage.done ? 'bg-accent text-white' : 'bg-secondary'}`}>
                    {stage.done && '✓'}
                  </div>
                  <span className={stage.done ? 'text-foreground' : 'text-muted-foreground'}>{stage.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowYourEP;
