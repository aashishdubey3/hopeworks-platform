import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import api from '../utils/api';

// THE LIFESAVER: Dynamically loads Razorpay directly into React
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function DonatePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: '', email: '', amount: '1000', pan: '' });
  const [step, setStep] = useState(1); 
  const [error, setError] = useState('');

  useEffect(() => {
    const donor = JSON.parse(localStorage.getItem('userInfo') || 'null');
    if (donor?.role === 'donor') {
      setFormData((prev) => ({ ...prev, name: donor.name || '', email: donor.email || '' }));
    } else {
      setError('Please create or log in to a donor account before making a donation.');
    }

    loadRazorpayScript();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const isHighValue = Number(formData.amount) >= 10000;

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');

    const donor = JSON.parse(localStorage.getItem('userInfo') || 'null');
    if (donor?.role !== 'donor') {
      setError('Please create or log in to a donor account before donating.');
      navigate('/donor-login');
      return;
    }
    
    if (isHighValue) {
      const panValue = formData.pan.trim().toUpperCase();
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

      if (!panValue) {
        setError('A valid PAN is mandatory for donations of ₹10,000 or more.');
        return;
      }
      if (!panRegex.test(panValue)) {
        setError('Invalid PAN format. It must be 5 letters, 4 numbers, and 1 letter (e.g., ABCDE1234F).');
        return;
      }
      formData.pan = panValue; 
    }

    setStep(2);

    // Double-check the script is loaded before continuing
    const isScriptLoaded = await loadRazorpayScript();
    
    if (!isScriptLoaded || typeof window.Razorpay === 'undefined') {
      setError('Payment gateway failed to load. Please check your internet connection or disable strict ad-blockers.');
      setStep(1);
      return;
    }

    try {
      const orderRes = await api.post('/payments/order', { amount: Number(formData.amount) });
      const order = orderRes.data.order;

      const options = {
        key: 'rzp_test_RXe8cwJVgzxVNr', // Your test key
        currency: order.currency,
        name: 'HopeWorks Platform',
        description: 'Transparent Donation',
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyRes = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              campaignId: id, 
              donorInfo: {
                name: formData.name,
                email: formData.email,
                amount: Number(formData.amount),
                pan: formData.pan
              }
            });

            if (verifyRes.data.success) {
              setStep(3); 
            }
          } catch (err) {
            console.error(err);
            setError('Payment succeeded, but receipt generation failed. Please contact support.');
            setStep(1);
          }
        },
        prefill: { name: formData.name, email: formData.email },
        theme: { color: "#0B2948" },
        modal: {
          ondismiss: function () {
            setError('Payment was cancelled.');
            setStep(1);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function () {
        setError('Payment transaction failed or was declined by the bank.');
        setStep(1);
      });
      rzp.open();

    } catch (err) {
      console.error(err);
      setError('Could not initialize payment gateway. The server may be busy.');
      setStep(1);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-8 border border-slate-200 rounded-3xl shadow-xl mt-16 mb-24">
      {step === 1 && (
        <form onSubmit={handlePayment} className="space-y-6 animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl font-black text-[#0B2948]">Make an Impact</h2>
            <p className="text-slate-500 mt-2 font-medium">Secure payment. Automated 80G Tax Receipt.</p>
          </div>

          {error && <div className="p-4 bg-red-50 text-red-700 border border-red-200 text-sm rounded-xl font-bold flex items-center gap-3"><svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>{error}</div>}

          <FormInput label="Full Legal Name (For 80G Receipt)" name="name" value={formData.name} onChange={handleChange} required />
          <FormInput label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} required />
          <FormInput label="Donation Amount (₹)" type="number" name="amount" value={formData.amount} onChange={handleChange} required min="1" />
          
          {isHighValue && (
            <div className="p-5 bg-[#E6F2F2] border border-[#007A78]/20 rounded-2xl animate-fade-in">
              <label className="block text-sm font-black text-[#0B2948] mb-2">
                Permanent Account Number (PAN) <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="pan" 
                value={formData.pan} 
                onChange={handleChange} 
                className="w-full px-5 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007A78] uppercase font-mono bg-white shadow-sm"
                placeholder="ABCDE1234F"
                required={isHighValue}
                maxLength="10"
              />
              <p className="text-xs text-slate-600 font-medium mt-3 leading-relaxed">
                As per Indian IT regulations, PAN is mandatory for donations exceeding ₹10,000 to claim an 80G deduction.
              </p>
            </div>
          )}

          <button type="submit" className="w-full bg-[#0B2948] hover:bg-[#007A78] text-white font-black text-lg py-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 mt-4">
            Proceed to Secure Payment
          </button>
        </form>
      )}

      {step === 2 && (
        <div className="text-center py-12 animate-fade-in">
          <div className="w-16 h-16 border-4 border-[#0B2948] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-2xl font-black text-[#0B2948] animate-pulse font-serif">Awaiting Secure Checkout...</h3>
          <p className="text-slate-500 font-medium mt-4">Please complete the Razorpay popup to finalize your donation.</p>
          <button onClick={() => setStep(1)} className="mt-8 text-sm text-[#007A78] hover:text-[#0B2948] font-bold transition-colors">
            Cancel and return
          </button>
        </div>
      )}

      {/* THE FIX: Updated Success Screen for the "Fire-and-Forget" Backend */}
      {step === 3 && (
        <div className="text-center py-8 animate-fade-in">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-sm border border-emerald-200">
            ✓
          </div>
          <h2 className="font-serif text-3xl font-black text-[#0B2948] mb-3">Payment Successful!</h2>
          <p className="text-slate-600 font-medium mb-8 text-sm">Thank you for your transparent donation. Your funds have been secured.</p>
          
          <div className="bg-[#E6F2F2] border border-[#007A78]/20 p-6 rounded-2xl mb-10 text-left flex gap-4 shadow-sm">
            <svg className="w-6 h-6 text-[#007A78] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            <div>
              <h4 className="font-black text-[#0B2948] text-sm tracking-wide">Official 80G Receipt Emailed</h4>
              <p className="text-xs text-slate-600 font-medium mt-1.5 leading-relaxed">
                To ensure a lightning-fast checkout, your tax receipt is being processed securely in the background. It will arrive in your inbox (<span className="font-bold text-[#007A78]">{formData.email}</span>) momentarily.
              </p>
            </div>
          </div>

          <button onClick={() => window.location.href = `/campaign/${id}`} className="w-full bg-[#0B2948] hover:bg-[#007A78] text-white font-black text-sm uppercase tracking-wider py-4 rounded-xl transition-all shadow-md transform hover:-translate-y-1">
            Return to Project Ledger
          </button>
        </div>
      )}
    </div>
  );
}