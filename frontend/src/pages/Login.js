import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { authAPI } from '../lib/api';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      toast.success('Welcome back!');
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 100);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };
  
  return (
    <div style={{minHeight: '100vh', display: 'flex', backgroundColor: '#FFFFFF'}}>
      <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px'}}>
        <div style={{width: '100%', maxWidth: '400px'}}>
          <Button variant="ghost" onClick={() => navigate('/')} style={{marginBottom: '32px', color: '#64748B'}} data-testid="back-button">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
          
          <div style={{marginBottom: '32px'}}>
            <h2 style={{fontSize: '28px', fontWeight: 600, color: '#0F172A', marginBottom: '8px'}}>Sign In</h2>
            <p style={{fontSize: '15px', color: '#64748B'}}>Access your EP reports and continue training</p>
          </div>
          
          <Button 
            variant="outline" 
            style={{
              width: '100%',
              marginBottom: '24px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              color: '#1E293B'
            }}
            onClick={handleGoogleLogin}
            data-testid="google-signin-button"
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </Button>
          
          <div style={{position: 'relative', marginBottom: '24px'}}>
            <div style={{position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', backgroundColor: '#E2E8F0'}} />
            <div style={{position: 'relative', textAlign: 'center'}}>
              <span style={{backgroundColor: '#FFFFFF', padding: '0 12px', fontSize: '13px', color: '#64748B'}}>Or continue with email</span>
            </div>
          </div>
          
          <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
            <div>
              <Label htmlFor="email" style={{color: '#1E293B', fontWeight: 500, marginBottom: '8px'}}>Email</Label>
              <Input 
                id="email"
                type="email" 
                placeholder="you@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="email-input"
                style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  padding: '10px 12px'
                }}
              />
            </div>
            
            <div>
              <Label htmlFor="password" style={{color: '#1E293B', fontWeight: 500, marginBottom: '8px'}}>Password</Label>
              <Input 
                id="password"
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="password-input"
                style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  padding: '10px 12px'
                }}
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={loading} 
              data-testid="submit-button"
              style={{
                width: '100%',
                backgroundColor: '#3B82F6',
                color: '#FFFFFF',
                fontWeight: 500,
                padding: '10px'
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <p style={{marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#64748B'}}>
            Don't have an account?{' '}
            <Link to="/signup" style={{color: '#3B82F6', textDecoration: 'none', fontWeight: 500}} data-testid="signup-link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
      
      <div style={{
        flex: 1,
        backgroundColor: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px'
      }} className="hidden lg:flex">
        <div style={{maxWidth: '500px'}}>
          <h1 style={{fontSize: '36px', fontWeight: 600, color: '#0F172A', marginBottom: '16px'}}>Welcome Back</h1>
          <p style={{fontSize: '18px', color: '#64748B', lineHeight: 1.6}}>
            Continue your executive presence journey with AI-powered insights and professional coaching.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;