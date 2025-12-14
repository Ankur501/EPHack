import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowRight, CheckCircle, BarChart3, Video, Brain, Target } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="container mx-auto px-6 py-5 flex justify-between items-center">
          <div className="font-display text-3xl font-bold text-primary">EP Quotient</div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => navigate('/login')} data-testid="login-link">
              Sign In
            </Button>
            <Button onClick={() => navigate('/signup')} data-testid="signup-link">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>
      
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div data-testid="hero-section">
              <h1 className="font-display text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Master Your <span className="text-accent">Executive Presence</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Get AI-powered insights on your leadership communication. Upload a 3-minute video and receive a comprehensive EP report with scores, benchmarks, and personalized coaching.
              </p>
              <div className="flex gap-4">
                <Button size="lg" onClick={() => navigate('/signup')} className="text-lg px-8" data-testid="cta-button">
                  Start Your Assessment <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
              </div>
            </div>
            
            <div className="relative" data-testid="hero-image">
              <div className="aspect-square rounded-2xl overflow-hidden border-4 border-accent/20 shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1740847262528-a29f09775256?crop=entropy&cs=srgb&fm=jpg&q=85" 
                  alt="Executive leader" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-xl p-6 shadow-xl">
                <div className="font-mono text-3xl font-bold text-accent">85+</div>
                <div className="text-sm text-muted-foreground">Executive-Ready Score</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="py-20 bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4">Four Dimensions of Executive Presence</h2>
            <p className="text-lg text-muted-foreground">Research-backed scoring across key leadership indicators</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8" data-testid="dimensions-grid">
            {[
              { icon: Brain, title: 'Gravitas', weight: '25%', desc: 'Commanding presence, decisiveness, vision articulation' },
              { icon: Target, title: 'Communication', weight: '35%', desc: 'Speaking rate, clarity, vocal metrics, filler words' },
              { icon: Video, title: 'Presence', weight: '25%', desc: 'Posture, eye contact, facial expressions, gestures' },
              { icon: BarChart3, title: 'Storytelling', weight: '15%', desc: 'Narrative structure, authenticity, concreteness' },
            ].map((dim, idx) => (
              <div key={idx} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all hover:border-accent/50">
                <dim.icon className="h-10 w-10 text-accent mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">{dim.title}</h3>
                <div className="text-sm text-accent font-mono mb-3">{dim.weight}</div>
                <p className="text-sm text-muted-foreground">{dim.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display text-4xl font-bold mb-6">How It Works</h2>
              <div className="space-y-6">
                {[
                  { step: '01', title: 'Record Your Video', desc: '3-minute speaking-to-camera video about your role and leadership' },
                  { step: '02', title: 'AI Analysis', desc: 'Speech-to-text, audio metrics, video signals, and NLP scoring in 2-3 minutes' },
                  { step: '03', title: 'Get Your Report', desc: 'Comprehensive EP report with scores, benchmarks, drill-downs, and PDF export' },
                  { step: '04', title: 'Improve & Practice', desc: 'Personalized coaching tips, simulator scenarios, and training modules' },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="font-mono text-3xl font-bold text-accent/30">{item.step}</div>
                    <div>
                      <h3 className="font-display text-xl font-semibold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
              <div className="mb-6">
                <div className="inline-block px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium mb-4">
                  What You'll Get
                </div>
              </div>
              <div className="space-y-4">
                {[
                  'Overall EP Score with percentile label',
                  'Scores across 4 dimensions with benchmarks',
                  'Word-by-word filler word timestamps',
                  'Pause detection with duration classification',
                  'Sentence clarity breakdown with suggestions',
                  'Vocal metrics (pitch, loudness, articulation)',
                  'Visual presence analysis (posture, eye contact)',
                  'Leadership signal analysis (gravitas, storytelling)',
                  'Personalized coaching recommendations',
                  'PDF export for sharing with coaches',
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="py-20 bg-accent/5 border-y border-accent/20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display text-4xl font-bold mb-6">Ready to Assess Your Executive Presence?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join leaders who are mastering their communication and presence through AI-powered insights.
          </p>
          <Button size="lg" onClick={() => navigate('/signup')} className="text-lg px-12" data-testid="footer-cta">
            Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 EP Quotient. Executive Presence Assessment Platform.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
