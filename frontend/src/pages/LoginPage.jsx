import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FormInput from '../components/FormInput';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [isSendingLink, setIsSendingLink] = useState(false);
  
  const navigate = useNavigate();
  // Added loggedInNgo to monitor state changes
  const { loggedInNgo, setLoggedInNgo } = useAuth(); 

  // Automatically redirect to dashboard once the user state is set
  useEffect(() => {
    if (loggedInNgo) {
      navigate('/dashboard');
    }
  }, [loggedInNgo, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await api.post('/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      setLoggedInNgo(response.data);
      // Removed the manual navigate('/dashboard') from here to prevent the race condition
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotMessage('');
    setIsSendingLink(true);

    try {
      const response = await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotMessage(response.data.message || "Magic link sent! Check your inbox.");
      setForgotEmail(''); 
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to send reset link. Check the email and try again.');
    } finally {
      setIsSendingLink(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-16 relative flex items-center justify-center font-sans">
      
      {/* --- FORGOT PASSWORD MODAL --- */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B2948]/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 md:p-10 w-full max-w-md shadow-2xl border border-[#007A78]/20 relative overflow-hidden">
            <button 
              onClick={() => { setShowForgotModal(false); setForgotMessage(''); setForgotError(''); }}
              className="absolute top-6 right-6 text-slate-400 hover:text-[#0B2948] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#00E5FF] to-[#007A78]"></div>
            
            <div className="mb-8 mt-2">
              <h3 className="text-2xl font-black text-[#0B2948] font-serif mb-2">Reset Password</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Enter your registered email address and we'll send you a secure magic link to reset your password.
              </p>
            </div>

            {forgotMessage && <div className="mb-6 p-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-sm font-bold flex items-center gap-2"><svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>{forgotMessage}</div>}
            {forgotError && <div className="mb-6 p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold flex items-center gap-2"><svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>{forgotError}</div>}

            <form onSubmit={handleForgotPassword} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-bold text-[#0B2948] mb-2">Registered Email</label>
                <input 
                  type="email" 
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@organization.org"
                  required
                  disabled={isSendingLink}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007A78] transition-all font-medium disabled:opacity-50"
                />
              </div>
              <button 
                type="submit" 
                disabled={isSendingLink || !forgotEmail}
                className="w-full bg-[#0B2948] hover:bg-[#007A78] text-white font-black py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
              >
                {isSendingLink ? 'Generating Link...' : 'Send Magic Link'}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* ------------------------------- */}

      <div className="w-full max-w-md bg-white p-10 border border-slate-100 rounded-3xl shadow-xl z-10">
        <div className="text-center mb-10">
          <h2 className="font-serif text-4xl font-black text-[#0B2948] mb-3 tracking-tight">Welcome Back</h2>
          <p className="text-slate-500 font-medium text-sm">Access your enterprise tracking portal.</p>
        </div>

        {error && <div className="mb-8 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-bold flex items-start gap-3">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span className="leading-relaxed">{error}</span>
        </div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormInput 
            label="Corporate Email" 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            required 
            disabled={isLoading} 
          />
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-bold text-[#0B2948]">Password</label>
              <button 
                type="button" 
                onClick={() => setShowForgotModal(true)}
                className="text-xs font-bold text-[#007A78] hover:text-[#0B2948] transition-colors"
                tabIndex="-1"
              >
                Forgot password?
              </button>
            </div>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
              disabled={isLoading}
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007A78] transition-all font-medium disabled:opacity-50"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full bg-[#0B2948] hover:bg-[#007A78] text-white font-black text-lg py-4 mt-2 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isLoading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3">
          <p className="text-center text-sm text-slate-500 font-medium">
            New to HopeWorks? <Link to="/register" className="text-[#007A78] hover:text-[#0B2948] font-black transition-colors">Apply for Access</Link>
          </p>
          <p className="text-center text-sm text-slate-500 font-medium">
            Account unverified? <Link to="/verify-email-page" className="text-[#007A78] hover:text-[#0B2948] font-black transition-colors">Verify Email</Link>
          </p>
        </div>

      </div>
    </div>
  );
}