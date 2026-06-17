import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

export default function VerifyEmailPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // Step 1: Enter Email, Step 2: Enter OTP
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // --- STEP 1: Request the OTP ---
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/resend-otp', { email });
      setMessage(response.data.message || 'Verification code sent to your inbox.');
      setStep(2); // Move to OTP input screen
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send verification code. Please check your email and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- STEP 2: Verify the OTP ---
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/verify-email', { email, otp });
      setMessage('Email verified successfully! Redirecting to login...');
      
      // Send them to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-16 relative flex items-center justify-center font-sans">
      <div className="w-full max-w-md bg-white p-10 border border-slate-100 rounded-3xl shadow-xl z-10 overflow-hidden relative">
        {/* Decorative Top Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#00E5FF] to-[#007A78]"></div>

        <div className="text-center mb-8 mt-2">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100 shadow-sm">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
          </div>
          <h2 className="font-serif text-3xl font-black text-[#0B2948] mb-2 tracking-tight">Verify Identity</h2>
          <p className="text-slate-500 text-sm">
            {step === 1 ? "Request a secure code to verify your organization's email." : "Enter the 6-digit code sent to your inbox."}
          </p>
        </div>

        {/* Status Messages */}
        {error && <div className="mb-6 p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold flex items-center gap-2"><svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>{error}</div>}
        {message && <div className="mb-6 p-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-sm font-bold flex items-center gap-2"><svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>{message}</div>}

        {/* STEP 1 FORM */}
        {step === 1 && (
          <form onSubmit={handleRequestOTP} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-[#0B2948] mb-2">Registered Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                disabled={isLoading}
                placeholder="name@organization.org"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007A78] transition-all font-medium disabled:opacity-50"
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading || !email} 
              className="w-full bg-[#0B2948] hover:bg-[#007A78] text-white font-black py-4 mt-2 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isLoading ? 'Generating Link...' : 'Send Verification Code'}
            </button>
          </form>
        )}

        {/* STEP 2 FORM */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-[#0B2948] mb-2 text-center">6-Digit Security Code</label>
              <input 
                type="text" 
                maxLength="6"
                value={otp} 
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Numbers only
                required 
                disabled={isLoading}
                placeholder="000000"
                className="w-full text-center text-4xl tracking-[0.5em] font-black text-[#0B2948] py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:border-[#007A78] transition-all disabled:opacity-50"
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading || otp.length < 6} 
              className="w-full bg-[#007A78] hover:bg-[#0B2948] text-white font-black py-4 mt-2 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isLoading ? 'Verifying...' : 'Verify & Activate'}
            </button>
            <div className="text-center mt-4">
              <button 
                type="button" 
                onClick={() => { setStep(1); setOtp(''); setMessage(''); setError(''); }}
                className="text-xs font-bold text-slate-400 hover:text-[#0B2948] transition-colors"
              >
                Need a new code? Go back
              </button>
            </div>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-slate-500 font-medium">
          <Link to="/login" className="text-[#007A78] hover:text-[#0B2948] font-black transition-colors">Return to Login</Link>
        </p>
      </div>
    </div>
  );
}