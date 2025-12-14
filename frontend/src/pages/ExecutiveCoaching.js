import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';

const ExecutiveCoaching = () => {
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
      
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <h1 className="font-display text-4xl font-bold mb-4">Executive Coaching</h1>
        <p className="text-lg text-muted-foreground mb-8">Work with professional coaches to refine your executive presence</p>
        
        <div className="bg-card border border-border rounded-xl p-8 mb-6">
          <h3 className="font-display text-2xl font-semibold mb-4">Book a Coaching Session</h3>
          <p className="text-muted-foreground mb-6">Get personalized feedback and guidance from experienced executive coaches</p>
          <Button size="lg">Schedule Session</Button>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-8">
          <h3 className="font-display text-2xl font-semibold mb-4">Share Reports</h3>
          <p className="text-muted-foreground mb-6">Generate time-limited share links for your EP reports to send to coaches</p>
          <Button variant="outline" size="lg">Generate Share Link</Button>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveCoaching;
