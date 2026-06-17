import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function DonorDashboard() {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 1. Verify they are a logged-in donor
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || !userInfo.token) {
      navigate('/login');
      return;
    }
    setUser(userInfo);

    // 2. Fetch their specific donation history from paymentRoutes
    const fetchHistory = async () => {
      try {
        const response = await api.get('/payments/my');
        setDonations(response.data);
      } catch (error) {
        console.error("Failed to fetch donation history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  // Calculate their total lifetime impact safely
  const totalImpact = donations.reduce((sum, donation) => sum + (donation.amount || 0), 0);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
       <div className="w-12 h-12 border-4 border-[#1C2331] border-t-transparent rounded-full animate-spin mb-4"></div>
       <p className="font-serif text-[#1C2331] font-bold tracking-widest uppercase text-sm">Loading Portfolio...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans pb-12">
      
      {/* Premium Header */}
      <div className="bg-[#1C2331] text-white pt-12 pb-24 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-serif font-bold mb-2">My Impact Portfolio</h1>
            <p className="text-gray-400">Welcome back, {user?.name || 'Supporter'}</p>
          </div>
          <button onClick={handleLogout} className="px-5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-md font-bold transition-colors text-sm">
            Log Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-6 -mt-12 space-y-8 animate-fade-in">
        
        {/* Total Impact Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Lifetime Contribution</p>
            <h2 className="text-4xl font-serif font-bold text-[#007A78]">₹{totalImpact.toLocaleString('en-IN')}</h2>
          </div>
          <div className="sm:text-right">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Causes Supported</p>
            <h2 className="text-3xl font-serif font-bold text-[#1C2331]">{donations.length}</h2>
          </div>
        </div>

        {/* Donation History List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-2xl font-serif font-bold text-[#1C2331]">Donation History & Tax Receipts</h3>
          </div>

          {donations.length === 0 ? (
            <div className="p-12 text-center bg-gray-50">
              <p className="text-gray-500 mb-4 font-serif">You haven't made any contributions yet.</p>
              <Link to="/ngos" className="text-[#007A78] font-bold hover:underline">Discover verified organizations to support →</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {donations.map((donation) => (
                <div key={donation._id} className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:bg-gray-50 transition-colors">
                  
                  {/* Campaign Details */}
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    {donation.campaign?.image ? (
                      <img src={donation.campaign.image} alt="Campaign" className="w-16 h-16 rounded-md object-cover border border-gray-200 shadow-sm" />
                    ) : (
                      <div className="w-16 h-16 rounded-md bg-[#1C2331] text-white flex items-center justify-center font-bold text-xl">H</div>
                    )}
                    <div>
                      <h4 className="font-bold text-[#1C2331] text-lg leading-tight">
                        {donation.campaign?.title || 'General Platform Donation'}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(donation.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })} • Trans ID: <span className="font-mono text-xs">{donation.razorpayPaymentId || donation._id.slice(-8)}</span>
                      </p>
                    </div>
                  </div>

                  {/* Amount and PDF Button */}
                  <div className="flex items-center justify-between w-full md:w-auto gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                    <p className="font-serif font-bold text-xl text-[#1C2331]">₹{donation.amount?.toLocaleString('en-IN')}</p>
                    
                    {donation.receiptUrl ? (
                      <a 
                        href={donation.receiptUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-[#007A78] hover:bg-[#006A68] text-white rounded-md text-sm font-bold transition-colors shadow-sm flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        80G Receipt
                      </a>
                    ) : (
                      <span className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-md text-sm font-bold border border-yellow-200 flex items-center gap-2" title="Receipt generation in progress">
                        Processing...
                      </span>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}