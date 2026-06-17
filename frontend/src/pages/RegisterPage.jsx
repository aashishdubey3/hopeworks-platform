import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', cause: '', about: '', darpanId: '', address: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  const navigate = useNavigate();
  const { setLoggedInNgo } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. Step One: Submit Registration & Trigger OTP Email
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Updated to point to the new Auth Controller route
      const response = await api.post('/auth/register', formData);
      
      if (response.status === 201) {
        // Registration successful! Backend just emailed the OTP.
        // Lock the screen and show the OTP Modal instead of navigating.
        setShowOtpModal(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Step Two: Verify the 6-Digit Code
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setOtpError('');
    setIsVerifying(true);

    try {
      // Call the new verification endpoint
      const response = await api.post('/auth/verify-email', {
        email: formData.email,
        otp: otp
      });

      if (response.status === 200) {
        alert("Email verified successfully! Your account is now pending Admin Approval. You will be notified once a Superadmin verifies your organization.");
        navigate('/login'); 
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 relative">
      
      {/* --- OTP VERIFICATION MODAL --- */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B2948]/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 md:p-12 w-full max-w-md shadow-2xl border border-[#007A78]/20 relative overflow-hidden">
            {/* Decorative top bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#00E5FF] to-[#007A78]"></div>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-50 text-[#007A78] rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </div>
              <h3 className="text-2xl font-black text-[#0B2948] font-serif mb-2">Verify Your Email</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                We've sent a 6-digit security code to <strong className="text-[#0B2948]">{formData.email}</strong>. This code expires in 10 minutes.
              </p>
            </div>

            {otpError && <div className="mb-6 p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold text-center flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {otpError}
            </div>}

            <form onSubmit={handleVerifyOTP} className="flex flex-col gap-6">
              <div>
                <input 
                  type="text" 
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Only allow numbers
                  placeholder="000000"
                  required
                  disabled={isVerifying}
                  className="w-full text-center text-4xl tracking-[0.5em] font-black text-[#0B2948] py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:border-[#007A78] transition-all disabled:opacity-50"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isVerifying || otp.length < 6}
                className="w-full bg-[#0B2948] hover:bg-[#007A78] text-white font-black text-lg py-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
              >
                {isVerifying ? 'Verifying Code...' : 'Verify & Complete'}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* ------------------------------- */}

      <div className="max-w-3xl mx-auto bg-white p-10 md:p-12 border border-slate-100 rounded-3xl shadow-xl">
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-1.5 rounded-full border border-[#007A78]/20 bg-teal-50 mb-6 text-xs font-black tracking-widest text-[#007A78] uppercase shadow-sm">
            NGO Registration
          </div>
          <h2 className="font-serif text-4xl font-black text-[#0B2948] mb-3 tracking-tight">Join the Network</h2>
          <p className="text-slate-500 font-medium">Register your organization to access tracking tools and enterprise CSR funding.</p>
        </div>

        {error && <div className="mb-8 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-bold flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          {error}
        </div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput label="Registered Organization Name" name="name" value={formData.name} onChange={handleChange} required disabled={isLoading} />
            <FormInput label="Official Corporate Email" type="email" name="email" value={formData.email} onChange={handleChange} required disabled={isLoading} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput label="Secure Password (Min 6 chars)" type="password" name="password" value={formData.password} onChange={handleChange} required disabled={isLoading} />
            <FormInput label="Primary Cause (e.g. Education, Health)" name="cause" value={formData.cause} onChange={handleChange} required disabled={isLoading} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput label="NGO Darpan ID (Govt. Reg)" name="darpanId" value={formData.darpanId} onChange={handleChange} required disabled={isLoading} placeholder="e.g. WB/2021/0123456" />
            <FormInput label="Headquarters Address" name="address" value={formData.address} onChange={handleChange} required disabled={isLoading} />
          </div>

          <FormInput label="Mission Statement & Vision" type="textarea" name="about" value={formData.about} onChange={handleChange} required disabled={isLoading} />

          <button type="submit" disabled={isLoading} className="w-full bg-[#0B2948] hover:bg-[#007A78] text-white font-black text-lg py-4 mt-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0">
            {isLoading ? 'Encrypting & Generating OTP...' : 'Submit Application'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500 font-medium">
          Already verified and registered? <Link to="/login" className="text-[#007A78] hover:text-[#0B2948] font-black transition-colors">Log In Here</Link>
        </p>
      </div>
    </div>
  );
}