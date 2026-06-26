import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Phone, LogIn } from 'lucide-react';
import { apiFetch } from '../api.js';

export default function Auth({ onLogin }) {
  useEffect(() => {
    document.title = "Sign In & Register | JMD Global Stones";
  }, []);
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const { supabase } = await import('../supabase.js');
      if (supabase) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        });
        if (error) {
          setError(error.message);
        }
      } else {
        // Fallback mock Google login
        console.log('[MOCK GOOGLE AUTH] Simulating Google OAuth.');
        const mockUser = {
          id: 'user-google-mock',
          email: 'googleuser@jmdglobalstones.co.uk',
          name: 'Google Customer',
          phone: '07123456789',
          role: 'customer'
        };
        onLogin(mockUser);
      }
    } catch (err) {
      setError('Auth module loading failed.');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        onLogin(data.user);
      } else {
        setError(data.message || 'Invalid email or password.');
      }
    } catch (err) {
      setError('Network error, failed to authenticate.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, phone, role: 'customer' })
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccess('Registration successful. Please log in with your credentials.');
        setIsLoginTab(true);
        // Clear registration details
        setName('');
        setPhone('');
      } else {
        setError(data.message || 'Failed to register account.');
      }
    } catch (err) {
      setError('Network error, failed to register.');
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-light)', padding: '6rem 0', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        
        {/* Toggle Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border-light)', marginBottom: '2.5rem' }}>
          <button 
            onClick={() => { setIsLoginTab(true); setError(''); }}
            style={{ flexGrow: 1, padding: '1rem', borderBottom: isLoginTab ? '2px solid var(--color-accent)' : 'none', fontWeight: isLoginTab ? 600 : 500, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', color: isLoginTab ? 'var(--text-on-light)' : 'var(--text-muted-on-light)' }}
          >
            Customer Login
          </button>
          <button 
            onClick={() => { setIsLoginTab(false); setError(''); }}
            style={{ flexGrow: 1, padding: '1rem', borderBottom: !isLoginTab ? '2px solid var(--color-accent)' : 'none', fontWeight: !isLoginTab ? 600 : 500, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', color: !isLoginTab ? 'var(--text-on-light)' : 'var(--text-muted-on-light)' }}
          >
            Register Account
          </button>
        </div>

        {/* Auth Forms */}
        <div style={{ border: '1px solid var(--color-border-light)', padding: '3rem 2.5rem', backgroundColor: 'transparent' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: '2rem', textAlign: 'center', fontWeight: 400 }}>
            {isLoginTab ? 'Access Your Account' : 'Create Customer Profile'}
          </h2>

          {error && (
            <div style={{ border: '1px solid var(--color-danger)', color: 'var(--color-danger)', padding: '0.85rem 1rem', marginBottom: '1.5rem', fontSize: '0.85rem', backgroundColor: '#FDF2F2' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ border: '1px solid var(--color-success)', color: 'var(--color-success)', padding: '0.85rem 1rem', marginBottom: '1.5rem', fontSize: '0.85rem', backgroundColor: '#F0F8F4' }}>
              {success}
            </div>
          )}

          {isLoginTab ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-on-light)' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted-on-light)' }} />
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sales@jmdglobalstones.co.uk" 
                    style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.5rem', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF', fontSize: '0.9rem' }} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-on-light)' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted-on-light)' }} />
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password" 
                    style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.5rem', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF', fontSize: '0.9rem' }} 
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', height: '52px', fontSize: '0.8rem', letterSpacing: '0.12em' }}>
                <LogIn size={15} /> Sign In
              </button>

              <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: '1.5rem', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted-on-light)', textAlign: 'center', lineHeight: 1.6 }}>
                <p style={{ marginBottom: '0.35rem' }}><strong style={{ color: 'var(--text-on-light)' }}>Admin Login:</strong> admin@jmdglobalstones.co.uk / admin123</p>
                <p><strong style={{ color: 'var(--text-on-light)' }}>Customer Login:</strong> customer@jmdglobalstones.co.uk / customer123</p>
              </div>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-on-light)' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted-on-light)' }} />
                  <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe" 
                    style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.5rem', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF', fontSize: '0.9rem' }} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-on-light)' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted-on-light)' }} />
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. john@example.co.uk" 
                    style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.5rem', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF', fontSize: '0.9rem' }} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-on-light)' }}>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted-on-light)' }} />
                  <input 
                    type="tel" 
                    required 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 07890123456" 
                    style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.5rem', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF', fontSize: '0.9rem' }} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-on-light)' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted-on-light)' }} />
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Set account password" 
                    style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.5rem', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF', fontSize: '0.9rem' }} 
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', height: '52px', fontSize: '0.8rem', letterSpacing: '0.12em' }}>
                Register Account
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
