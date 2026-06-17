import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

export default function ResetPasswordPage() {
  const { token } = useParams(); // Grabs the magic token from the URL
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Pre-flight validation
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }

    setIsLoading(true);

    try {
      // Send the new password and the URL token to the backend
      await api.post(`/auth/reset-password/${token}`, {
        password: formData.password
      });

      setSuccess(true);
      
      // Automatically kick them to the login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired reset link. Please request a new one from the Login page.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-16 relative flex items-center justify-center font-sans">
      <div className="w-full max-w-md bg-white p-10 border border-slate-100 rounded-3xl shadow-xl z-10 overflow-hidden relative">
        {/* Decorative Top Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#00E5FF] to-[#007A78]"></div>

        <div className="text-center mb-10 mt-2">
          <div className="w-16 h-16 bg-blue-50 text-[#007A78] rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
          </div>
          <h2 className="font-serif text-3xl font-black text-[#0B2948] mb-2 tracking-tight">Set New Password</h2>
          <p className="text-slate-500 text-sm">Enter a new secure password for your account.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-bold flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center py-6">
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-bold flex items-center justify-center gap-3">
              <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
              Password Reset Successful!
            </div>
            <p className="text-slate-500 text-sm animate-pulse">Redirecting to secure login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-[#0B2948] mb-2">New Password</label>
              <input 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
                disabled={isLoading}
                placeholder="Min 6 characters"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007A78] transition-all font-medium disabled:opacity-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-[#0B2948] mb-2">Confirm New Password</label>
              <input 
                type="password" 
                name="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                required 
                disabled={isLoading}
                placeholder="Type password again"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007A78] transition-all font-medium disabled:opacity-50"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-[#0B2948] hover:bg-[#007A78] text-white font-black py-4 mt-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isLoading ? 'Encrypting...' : 'Save New Password'}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-slate-500 font-medium">
          Remembered your password? <Link to="/login" className="text-[#007A78] hover:text-[#0B2948] font-black transition-colors">Return to Login</Link>
        </p>
      </div>
    </div>
  );
}