import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

export default function CampaignDetailsPage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await api.get(`/campaigns/${id}`);
        setCampaign(response.data);
      } catch (error) {
        console.error("Failed to fetch campaign details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [id]);

  const getImageUrl = (camp) => {
    if (!camp) return "";
    const path = camp.image || camp.imageUrl || camp.photo;
    if (!path) return "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000&auto=format&fit=crop"; 
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path.startsWith('/') ? '' : '/'}${path}`;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-[#0B2948] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-serif text-[#0B2948] font-bold tracking-wider uppercase text-sm">Loading Project Ledger...</p>
      </div>
    </div>
  );
  
  if (!campaign) return <div className="text-center py-32 text-red-800 font-serif text-2xl bg-[#F8FAFC] min-h-screen">Ledger Not Found.</div>;

  const raised = campaign.raised || campaign.raisedAmount || 0;
  const goal = campaign.goal || campaign.goalAmount || 1;
  const progressPercentage = Math.min((raised / goal) * 100, 100);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 font-sans pb-24">
      <div className="max-w-5xl mx-auto px-6 animate-fade-in">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex text-sm text-slate-500 font-medium mb-8">
          <Link to="/campaigns" className="hover:text-[#007A78] transition-colors">Campaigns</Link>
          <span className="mx-3">/</span>
          <span className="text-[#0B2948] truncate">{campaign.title}</span>
        </nav>

        <div className="bg-white border border-slate-100 rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
          
          {/* Left Column: Image & Story */}
          <div className="w-full md:w-3/5 border-r border-slate-100">
            <div className="w-full h-80 md:h-[400px] bg-slate-100 relative">
              <img src={getImageUrl(campaign)} alt={campaign.title} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-black text-[#0B2948] shadow-sm uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Active Project
              </div>
            </div>

            <div className="p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-[#0B2948] font-bold text-xl border border-blue-100 shadow-sm shrink-0">
                  {campaign.host ? campaign.host.charAt(0) : "V"}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fundraiser Host</p>
                  <Link to={`/ngo/${campaign.ngo || campaign.ngoId}`} className="text-[#0B2948] font-bold hover:text-[#007A78] transition-colors">
                    {campaign.host || "Verified NGO"}
                  </Link>
                </div>
              </div>

              <h3 className="text-2xl font-black text-[#0B2948] mb-4 font-serif">The Ledger Story</h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line text-[1.05rem]">
                {campaign.description}
              </p>
            </div>
          </div>

          {/* Right Column: Funding Console */}
          <div className="w-full md:w-2/5 p-8 md:p-10 bg-slate-50 relative">
            <div className="sticky top-28">
              <div className="mb-4">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                  {campaign.cause || 'NGO Campaign'}
                </span>
              </div>
              <h1 className="text-3xl font-black text-[#0B2948] font-serif mb-8 leading-tight">{campaign.title}</h1>
              
              {/* Financial Box */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
                <div className="flex justify-between items-end mb-3">
                  <div>
                    <span className="text-3xl font-black text-[#007A78]">₹{raised.toLocaleString('en-IN')}</span>
                    <span className="text-sm font-bold text-slate-400 ml-2">raised</span>
                  </div>
                </div>
                
                <div className="w-full bg-slate-100 h-3 rounded-full mb-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#00E5FF] to-[#007A78] h-3 rounded-full transition-all duration-1000 relative" style={{ width: `${progressPercentage}%` }}>
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                  <span>{Math.round(progressPercentage)}% funded</span>
                  <span>Goal: ₹{goal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Secure Donation Area */}
              <div className="space-y-4">
                <div className="bg-[#E6F2F2] border border-[#007A78]/20 p-4 rounded-xl flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#007A78] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <div>
                    <p className="text-sm font-bold text-[#0B2948]">Tax Deductible</p>
                    <p className="text-xs text-slate-600 mt-0.5">Donations made to this verified ledger qualify for 80G tax exemptions.</p>
                  </div>
                </div>

                <Link to={`/donate/${campaign._id || campaign.id}`} className="block w-full text-center bg-[#0B2948] hover:bg-[#007A78] text-white font-black py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg">
                  Deploy Funds (80G)
                </Link>
                
                <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mt-4">
                  Secured by Razorpay
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}