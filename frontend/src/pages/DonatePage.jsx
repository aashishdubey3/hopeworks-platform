import { useState } from 'react';
import { useParams } from 'react-router-dom';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import api from '../utils/api';

export default function DonatePage() {
  // THE FIX: Pull 'id' from the URL to match App.jsx route
  const { id } = useParams();  
  
  const [formData, setFormData] = useState({ name: '', email: '', amount: '1000', pan: '' });
  const [step, setStep] = useState(1); 
  const [receiptUrl, setReceiptUrl] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const isHighValue = Number(formData.amount) >= 10000;

  const handlePayment = async (e) => {
    e.preventDefault();
    
    // STRICT KYC REGEX VALIDATION
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

    setError('');
    setStep(2);

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
              
              // THE FIX: Pass the 'id' variable we pulled from the URL
              campaignId: id, 
              
              donorInfo: {
                name: formData.name,
                email: formData.email,
                amount: Number(formData.amount),
                pan: formData.pan
              }
            });

            if (verifyRes.data.success) {
              setReceiptUrl(verifyRes.data.receiptUrl);
              setStep(3); 
            }
          } catch (err) {
            console.error(err);
            setError('Payment succeeded, but receipt generation failed. Please contact support.');
            setStep(1);
          }
        },
        prefill: { name: formData.name, email: formData.email },
        theme: { color: "#1C2331" }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function () {
        setError('Payment transaction failed or was cancelled.');
        setStep(1);
      });
      rzp.open();

    } catch (err) {
      console.error(err);
      setError('Could not initialize payment gateway.');
      setStep(1);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-8 border border-gray-200 rounded-sm shadow-sm mt-10">
      {step === 1 && (
        <form onSubmit={handlePayment} className="space-y-6 animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl font-bold text-[#1C2331]">Make an Impact</h2>
            <p className="text-gray-600 mt-2">Secure payment. Automated 80G Tax Receipt.</p>
          </div>

          {error && <div className="p-3 bg-red-50 text-red-700 border border-red-200 text-sm rounded-sm">{error}</div>}

          <FormInput label="Full Legal Name (For 80G Receipt)" name="name" value={formData.name} onChange={handleChange} required />
          <FormInput label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} required />
          <FormInput label="Donation Amount (₹)" type="number" name="amount" value={formData.amount} onChange={handleChange} required min="1" />
          
          {isHighValue && (
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-sm animate-fade-in">
              <label className="block text-sm font-semibold text-[#1C2331] mb-2">
                Permanent Account Number (PAN) <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="pan" 
                value={formData.pan} 
                onChange={handleChange} 
                className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-[#007A78] uppercase font-mono"
                placeholder="ABCDE1234F"
                required={isHighValue}
                maxLength="10"
              />
              <p className="text-xs text-blue-700 mt-2">
                As per Indian IT regulations, PAN is mandatory for donations exceeding ₹10,000 to claim an 80G deduction.
              </p>
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full text-lg py-4 mt-4">
            Proceed to Payment
          </Button>
        </form>
      )}

      {step === 2 && (
        <div className="text-center py-12 animate-fade-in">
          <h3 className="text-2xl font-bold text-[#1C2331] animate-pulse">Awaiting Secure Checkout...</h3>
          <p className="text-gray-500 mt-4">Please complete the Razorpay popup to finalize your donation.</p>
        </div>
      )}

      {step === 3 && (
        <div className="text-center py-8 animate-fade-in">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">✓</div>
          <h2 className="font-serif text-3xl font-bold text-[#1C2331] mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-8">Thank you for your transparent donation. Your funds are being deployed.</p>
          
          {receiptUrl ? (
            <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium tracking-wide text-white bg-[#007A78] hover:bg-[#005A58] rounded-sm transition-colors w-full">
              Download Donation Receipt (PDF)
            </a>
          ) : (
            <p className="text-sm text-gray-500 italic animate-pulse">Your receipt is being generated...</p>
          )}
        </div>
      )}
    </div>
  );
}