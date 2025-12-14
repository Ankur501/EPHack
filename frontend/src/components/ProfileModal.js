import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { X } from 'lucide-react';
import axios from 'axios';

const ProfileModal = ({ onComplete, onClose }) => {
  const [formData, setFormData] = useState({
    role: '',
    seniority_level: '',
    years_experience: '',
    industry: '',
    company_size: '',
    primary_goal: ''
  });
  const [loading, setLoading] = useState(false);
  
  const roles = [
    'Chief Executive Officer (CEO)',
    'Chief Technology Officer (CTO)',
    'Chief Operating Officer (COO)',
    'Chief Financial Officer (CFO)',
    'Vice President',
    'Director',
    'Senior Manager',
    'Manager',
    'Team Lead',
    'Senior Individual Contributor',
    'Other'
  ];
  
  const seniority = [
    'C-Suite',
    'VP / Senior VP',
    'Director / Senior Director',
    'Manager / Senior Manager',
    'Mid-Level',
    'Entry-Level'
  ];
  
  const industries = [
    'Technology',
    'Finance & Banking',
    'Healthcare',
    'Consulting',
    'Manufacturing',
    'Retail',
    'Education',
    'Government',
    'Non-Profit',
    'Other'
  ];
  
  const companySizes = [
    'Startup (1-50)',
    'Small (51-200)',
    'Medium (201-1000)',
    'Large (1001-5000)',
    'Enterprise (5000+)'
  ];
  
  const goals = [
    'Prepare for promotion to executive role',
    'Improve board presentation skills',
    'Enhance team leadership presence',
    'Refine investor pitch delivery',
    'Strengthen stakeholder communication',
    'Build executive gravitas',
    'Other'
  ];
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('session_token');
      const API_URL = process.env.REACT_APP_BACKEND_URL;
      
      await axios.post(`${API_URL}/api/profile/`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      onComplete();
    } catch (error) {
      console.error('Profile creation error:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        maxWidth: '650px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{
          padding: '32px',
          borderBottom: '1px solid #E2E8F0'
        }}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 600,
                color: '#0F172A',
                marginBottom: '8px'
              }}>
                Complete Your Profile
              </h2>
              <p style={{
                fontSize: '15px',
                color: '#64748B',
                lineHeight: 1.5
              }}>
                Help us tailor your Executive Presence analysis to your specific role and leadership level. Your responses ensure accurate, role-appropriate benchmarking.
              </p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} style={{padding: '32px'}}>
          <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
            <div>
              <Label htmlFor="role" style={{color: '#1E293B', fontWeight: 500, marginBottom: '8px', display: 'block'}}>
                Current Role / Title <span style={{color: '#EF4444'}}>*</span>
              </Label>
              <select
                id="role"
                required
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  fontSize: '15px',
                  color: '#1E293B',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <option value=\"\">Select your role</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor=\"seniority\" style={{color: '#1E293B', fontWeight: 500, marginBottom: '8px', display: 'block'}}>
                Seniority Level <span style={{color: '#EF4444'}}>*</span>
              </Label>
              <select
                id=\"seniority\"
                required
                value={formData.seniority_level}
                onChange={(e) => setFormData({...formData, seniority_level: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  fontSize: '15px',
                  color: '#1E293B',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <option value=\"\">Select seniority level</option>
                {seniority.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor=\"experience\" style={{color: '#1E293B', fontWeight: 500, marginBottom: '8px', display: 'block'}}>
                Years of Professional Experience <span style={{color: '#EF4444'}}>*</span>
              </Label>
              <Input
                id=\"experience\"
                type=\"number\"
                min=\"0\"
                max=\"50\"
                required
                value={formData.years_experience}
                onChange={(e) => setFormData({...formData, years_experience: parseInt(e.target.value)})}
                placeholder=\"e.g., 15\"
                style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  padding: '10px 12px'
                }}
              />
            </div>
            
            <div>
              <Label htmlFor=\"industry\" style={{color: '#1E293B', fontWeight: 500, marginBottom: '8px', display: 'block'}}>
                Industry
              </Label>
              <select
                id=\"industry\"
                value={formData.industry}
                onChange={(e) => setFormData({...formData, industry: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  fontSize: '15px',
                  color: '#1E293B',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <option value=\"\">Select industry (optional)</option>
                {industries.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor=\"company_size\" style={{color: '#1E293B', fontWeight: 500, marginBottom: '8px', display: 'block'}}>
                Company Size
              </Label>
              <select
                id=\"company_size\"
                value={formData.company_size}
                onChange={(e) => setFormData({...formData, company_size: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  fontSize: '15px',
                  color: '#1E293B',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <option value=\"\">Select company size (optional)</option>
                {companySizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor=\"goal\" style={{color: '#1E293B', fontWeight: 500, marginBottom: '8px', display: 'block'}}>
                Primary Goal
              </Label>
              <select
                id=\"goal\"
                value={formData.primary_goal}
                onChange={(e) => setFormData({...formData, primary_goal: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  fontSize: '15px',
                  color: '#1E293B',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <option value=\"\">Select your primary goal (optional)</option>
                {goals.map(goal => (
                  <option key={goal} value={goal}>{goal}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div style={{
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <Button
              type=\"submit\"
              disabled={loading}
              style={{
                backgroundColor: '#3B82F6',
                color: '#FFFFFF',
                fontWeight: 500,
                padding: '10px 24px'
              }}
            >
              {loading ? 'Saving...' : 'Complete Profile'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
