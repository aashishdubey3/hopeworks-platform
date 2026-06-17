import { useState } from 'react';
import api from '../utils/api';

export default function CsrPage() {
  const [formData, setFormData] = useState({
    companyName: '', contactName: '', email: '', phone: '', budget: '', focusArea: 'Education'
  });
  const [status, setStatus] = useState({ loading: false, message: '', type: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: '', type: '' });

    try {
      const response = await api.post('/csr/inquiry', formData);
      setStatus({ loading: false, message: response.data.message, type: 'success' });
      setFormData({ companyName: '', contactName: '', email: '', phone: '', budget: '', focusArea: 'Education' });
    } catch (error) {
      setStatus({ loading: false, message: 'Submission failed. Please check your connection and try again.', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-24">
      
      {/* 1. ENTERPRISE HERO SECTION */}
      <section className="relative bg-gradient-to-br from-[#0B2948] to-[#06182C] text-white pt-24 pb-24 px-6 text-center overflow-hidden border-b border-[#00E5FF]/10 shadow-xl">
        {/* Glowing Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00E5FF] rounded-full mix-blend-screen filter blur-[128px] opacity-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#007A78] rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-block px-4 py-1.5 rounded-full border border-[#00E5FF]/20 bg-white/5 backdrop-blur-md mb-6 text-xs font-bold tracking-widest text-[#00E5FF] uppercase shadow-sm">
            Enterprise Solutions
          </div>
          <h1 className="font-serif text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
            Corporate Social <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#33FFCC]">Responsibility.</span>
          </h1>
          <p className="text-lg text-blue-100/80 mb-4 font-light max-w-2xl leading-relaxed">
            Fulfill your corporate mandates with absolute, mathematical transparency. We connect enterprise capital with trackable, high-impact micro-projects across the nation.
          </p>
        </div>
      </section>

      {/* 2. MAIN CONTENT & FORM */}
      {/* THE CSS FIX: Removed the negative margin (-mt-24) so it sits cleanly below the dark background */}
      <section className="max-w-6xl mx-auto px-6 pt-16 relative z-20 grid lg:grid-cols-5 gap-16 items-start">
        
        {/* Left Column: Features */}
        <div className="lg:col-span-2 space-y-8 text-[#0B2948]">
          <h2 className="font-serif text-3xl font-black tracking-tight">Why Partner With HopeWorks?</h2>
          <p className="text-slate-500 font-medium leading-relaxed mb-8">We eliminate the black box of traditional philanthropy. Enterprise partners receive dedicated portals, live impact tracking, and automated legal compliance.</p>
          
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
                <svg className="w-6 h-6 text-[#007A78]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">Automated 80G Compliance</h4>
                <p className="text-sm text-slate-500 leading-relaxed">Tax exemption receipts and Form 10BD data are generated instantly upon funding deployment, ensuring flawless audits.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
                <svg className="w-6 h-6 text-[#007A78]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">Granular Tracking</h4>
                <p className="text-sm text-slate-500 leading-relaxed">Know exactly where every rupee goes. From rural whiteboards to medical supplies, track your capital's impact visually.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
                <svg className="w-6 h-6 text-[#007A78]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">Vetted Organizations Only</h4>
                <p className="text-sm text-slate-500 leading-relaxed">Every organization on our platform undergoes strict administrative moderation and Darpan ID government verification.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: The Enterprise Form */}
        <div className="lg:col-span-3 bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100">
          <h3 className="font-serif text-2xl text-[#0B2948] font-black mb-2">Initiate a Partnership</h3>
          <p className="text-slate-500 text-sm mb-8 font-medium">Leave your details below and an Enterprise Account Executive will contact you to build a custom CSR pipeline.</p>
          
          {/* Status Message Banner */}
          {status.message && (
            <div className={`mb-8 p-5 rounded-2xl border flex items-center gap-3 text-sm font-bold shadow-sm ${status.type === 'success' ? 'bg-[#E6F2F2] border-[#007A78]/20 text-[#007A78]' : 'bg-red-50 text-red-600 border-red-100'}`}>
              {status.type === 'success' ? (
                <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
              ) : (
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              )}
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#0B2948] mb-2">Registered Company Name <span className="text-red-500">*</span></label>
              <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} required disabled={status.loading} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007A78] transition-all font-medium disabled:opacity-50" placeholder="e.g., Reliance Industries Ltd." />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[#0B2948] mb-2">Contact Person <span className="text-red-500">*</span></label>
                <input type="text" name="contactName" value={formData.contactName} onChange={handleChange} required disabled={status.loading} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007A78] transition-all font-medium disabled:opacity-50" placeholder="Full Name" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0B2948] mb-2">Direct Phone <span className="text-red-500">*</span></label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required disabled={status.loading} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007A78] transition-all font-medium disabled:opacity-50" placeholder="+91 98765 43210" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0B2948] mb-2">Corporate Email <span className="text-red-500">*</span></label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={status.loading} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007A78] transition-all font-medium disabled:opacity-50" placeholder="name@company.com" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[#0B2948] mb-2">Planned Annual Budget (₹) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400 font-bold">₹</span>
                  <input type="number" name="budget" value={formData.budget} onChange={handleChange} required disabled={status.loading} min="10000" className="w-full pl-9 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007A78] transition-all font-medium disabled:opacity-50" placeholder="5000000" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0B2948] mb-2">Primary Focus Area <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select name="focusArea" value={formData.focusArea} onChange={handleChange} disabled={status.loading} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007A78] transition-all font-medium text-[#0B2948] appearance-none disabled:opacity-50 cursor-pointer">
                    <option value="Education">Education & Literacy</option>
                    <option value="Healthcare">Healthcare & Sanitation</option>
                    <option value="Environment">Environmental Sustainability</option>
                    <option value="Women Empowerment">Women Empowerment</option>
                    <option value="Disaster Relief">Disaster Relief</option>
                    <option value="Agnostic">Agnostic (Maximum Impact)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" disabled={status.loading} className="w-full bg-[#0B2948] hover:bg-[#007A78] text-white font-black text-lg py-4 mt-6 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0">
              {status.loading ? 'Encrypting & Submitting...' : 'Request Consultation'}
            </button>
            <p className="text-center text-xs text-slate-400 mt-4 font-medium flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              Your data is secured with enterprise-grade encryption.
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}