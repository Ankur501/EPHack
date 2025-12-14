import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Training = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
      </nav>
      
      <div className="container mx-auto px-6 py-12">
        <h1 className="font-display text-4xl font-bold mb-4">Training Modules</h1>
        <p className="text-lg text-muted-foreground mb-8">Structured micro-courses mapped to your weak areas</p>
        
        <div className="grid md:grid-cols-2 gap-6">
          {['Strategic Pauses', 'Lens Eye Contact', 'Decision Framing', 'Vocal Variety'].map((title, idx) => (
            <div key={idx} className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-display text-xl font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground mb-4">5-10 minute micro-course with practice prompts</p>
              <Button variant="outline" className="w-full">Start Module</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Training;
