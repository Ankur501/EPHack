import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowRight, CheckCircle, BarChart3, Video, Brain, MessageSquare } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  
  return (
    <div style={{backgroundColor: '#FFFFFF', minHeight: '100vh'}}>
      <nav style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div style={{fontSize: '20px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.5px'}}>
            Executive Presence Quotient
          </div>
          <div className="flex gap-3">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/login')} 
              data-testid="login-link"
              style={{color: '#64748B', backgroundColor: 'transparent'}}
            >
              Sign In
            </Button>
            <Button 
              onClick={() => navigate('/signup')} 
              data-testid="signup-link"
              style={{backgroundColor: '#3B82F6', color: '#FFFFFF', fontWeight: 500}}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>
      
      <div style={{paddingTop: '80px', paddingBottom: '80px'}}>
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center">
            <h1 style={{
              fontSize: '56px',
              fontWeight: 600,
              lineHeight: 1.1,
              color: '#0F172A',
              marginBottom: '24px',
              letterSpacing: '-0.02em'
            }}>
              Measure and Master Your<br/>Executive Presence
            </h1>
            <p style={{
              fontSize: '20px',
              color: '#64748B',
              marginBottom: '40px',
              maxWidth: '700px',
              margin: '0 auto 40px',
              lineHeight: 1.6
            }}>
              AI-powered video analysis for corporate leaders. Get research-backed insights on communication, presence, gravitas, and storytelling in minutes.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/signup')} 
                data-testid="cta-button"
                style={{
                  backgroundColor: '#3B82F6',
                  color: '#FFFFFF',
                  fontSize: '16px',
                  padding: '12px 32px',
                  fontWeight: 500
                }}
              >
                Start Assessment <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate('/login')}
                style={{
                  border: '2px solid #E2E8F0',
                  color: '#0F172A',
                  backgroundColor: '#FFFFFF',
                  fontSize: '16px',
                  padding: '12px 32px'
                }}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div style={{
        paddingTop: '60px',
        paddingBottom: '60px',
        backgroundColor: '#F8FAFC',
        borderTop: '1px solid #E2E8F0',
        borderBottom: '1px solid #E2E8F0'
      }}>
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <h2 style={{fontSize: '36px', fontWeight: 600, color: '#0F172A', marginBottom: '12px'}}>
              Four Research-Backed Dimensions
            </h2>
            <p style={{fontSize: '18px', color: '#64748B'}}>
              Comprehensive scoring across key leadership indicators
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Brain, title: 'Gravitas', weight: '25%', desc: 'Commanding presence, decisiveness, poise under pressure' },
              { icon: MessageSquare, title: 'Communication', weight: '35%', desc: 'Speaking rate, clarity, vocal metrics, filler words' },
              { icon: Video, title: 'Presence', weight: '25%', desc: 'Posture, eye contact, facial expressions, gestures' },
              { icon: BarChart3, title: 'Storytelling', weight: '15%', desc: 'Narrative structure, authenticity, concreteness' },
            ].map((dim, idx) => (
              <div 
                key={idx} 
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '24px'
                }}
              >
                <dim.icon style={{width: '32px', height: '32px', color: '#3B82F6', marginBottom: '16px'}} />
                <h3 style={{fontSize: '18px', fontWeight: 600, color: '#0F172A', marginBottom: '8px'}}>{dim.title}</h3>
                <div style={{fontSize: '14px', color: '#3B82F6', fontWeight: 500, marginBottom: '12px', fontFamily: 'IBM Plex Mono'}}>{dim.weight}</div>
                <p style={{fontSize: '14px', color: '#64748B', lineHeight: 1.5}}>{dim.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div style={{paddingTop: '60px', paddingBottom: '60px'}}>
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 style={{fontSize: '36px', fontWeight: 600, color: '#0F172A', marginBottom: '32px'}}>
                How It Works
              </h2>
              <div className="space-y-8">
                {[
                  { num: '01', title: 'Record or Upload', desc: '3-minute video speaking to camera about your role and leadership' },
                  { num: '02', title: 'AI Analysis', desc: 'Whisper transcription, GPT-4o vision & NLP analysis in under 3 minutes' },
                  { num: '03', title: 'Detailed Report', desc: 'Comprehensive scores, benchmarks, drill-downs, and coaching tips' },
                  { num: '04', title: 'Improve', desc: 'Practice with scenarios, training modules, and executive coaching' },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-6">
                    <div style={{
                      fontSize: '32px',
                      fontWeight: 600,
                      color: '#E2E8F0',
                      fontFamily: 'IBM Plex Mono',
                      minWidth: '60px'
                    }}>
                      {item.num}
                    </div>
                    <div>
                      <h3 style={{fontSize: '20px', fontWeight: 600, color: '#0F172A', marginBottom: '8px'}}>{item.title}</h3>
                      <p style={{fontSize: '16px', color: '#64748B', lineHeight: 1.6}}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '32px'
            }}>
              <h3 style={{fontSize: '24px', fontWeight: 600, color: '#0F172A', marginBottom: '24px'}}>
                What You'll Receive
              </h3>
              <div className="space-y-3">
                {[
                  'Overall EP Score with performance level',
                  'Scores across 4 dimensions with benchmarks',
                  'Word-by-word filler word timestamps',
                  'Pause detection with duration classification',
                  'Sentence clarity breakdown',
                  'Vocal metrics (pitch, loudness, articulation)',
                  'Visual presence analysis',
                  'Leadership signal analysis',
                  'Personalized coaching recommendations',
                  'PDF export for coaches',
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle style={{width: '20px', height: '20px', color: '#3B82F6', marginTop: '2px', flexShrink: 0}} />
                    <span style={{fontSize: '15px', color: '#1E293B'}}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div style={{
        paddingTop: '60px',
        paddingBottom: '60px',
        backgroundColor: '#0F172A'
      }}>
        <div className="container mx-auto px-6 text-center">
          <h2 style={{fontSize: '36px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px'}}>
            Ready to Assess Your Executive Presence?
          </h2>
          <p style={{fontSize: '18px', color: 'rgba(255,255,255,0.7)', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px'}}>
            Join leaders mastering their communication through AI-powered insights
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/signup')} 
            data-testid="footer-cta"
            style={{
              backgroundColor: '#3B82F6',
              color: '#FFFFFF',
              fontSize: '16px',
              padding: '12px 32px',
              fontWeight: 500
            }}
          >
            Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <footer style={{
        paddingTop: '32px',
        paddingBottom: '32px',
        borderTop: '1px solid #E2E8F0'
      }}>
        <div className="container mx-auto px-6 text-center">
          <p style={{fontSize: '14px', color: '#64748B'}}>
            © 2025 Executive Presence Quotient. Professional leadership assessment platform.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
