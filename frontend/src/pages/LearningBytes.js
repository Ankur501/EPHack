import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';

const LearningBytes = () => {
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
        <h1 className="font-display text-4xl font-bold mb-4">Learning Bytes</h1>
        <p className="text-lg text-muted-foreground mb-8">Daily tips and expert advice for improving your EP</p>
        
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-2">Daily Tip</h3>
            <p className="text-muted-foreground">Practice strategic pauses before making key points to add gravitas to your delivery.</p>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-2">Recommended TED Talk</h3>
            <p className="text-muted-foreground mb-2">Amy Cuddy: Your body language may shape who you are</p>
            <p className="text-sm text-muted-foreground">Relevant for: Presence, Body Language, Confidence</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningBytes;
