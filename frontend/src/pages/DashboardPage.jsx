import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext'; 

export default function DashboardPage() {
  const navigate = useNavigate();
  const { loggedInNgo, setLoggedInNgo } = useAuth(); 
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [updateMessage, setUpdateMessage] = useState('');
  
  // Profile & Settings State
  const [profile, setProfile] = useState({
    name: '', email: '', about: '', cause: '', address: '', darpanId: '', panNumber: '', avatar: ''
  });
  
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [passwordMessage, setPasswordMessage] = useState('');

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [donations, setDonations] = useState([]); 

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token || !loggedInNgo) {
        navigate('/login');
        return;
      }

      // 1. Fetch Profile
      try {
        const userId = loggedInNgo._id || loggedInNgo.id;
        const { data } = await api.get(`/ngos/${userId}`);
        
        setProfile({
          name: data.name || '', email: data.email || '', about: data.about || data.description || '',
          cause: data.cause || data.category || '', address: data.address || '', darpanId: data.darpanId || '',
          panNumber: data.panNumber || '', avatar: data.avatar || data.logo || '' 
        });

        if (data.avatar && loggedInNgo.avatar !== data.avatar) {
          setLoggedInNgo(prev => ({ ...prev, avatar: data.avatar }));
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoadingProfile(false);
      }

      // 2. Fetch Campaigns
      try {
        const response = await api.get('/campaigns/my'); 
        setCampaigns(response.data);
      } catch (error) {
        console.error("Failed to fetch campaigns", error);
      } finally {
        setLoadingCampaigns(false);
      }

      // 3. Fetch Donations
      try {
        const donationRes = await api.get('/payments/ngo-donations'); 
        setDonations(donationRes.data);
      } catch (error) {
        console.log("Donations API fetching failed or not ready yet.");
      }
    };

    if (loggedInNgo) fetchData();
  }, [navigate, loggedInNgo, setLoggedInNgo]);

  const handleProfileChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setUpdateMessage('');
    
    const formData = new FormData();
    formData.append('name', profile.name); formData.append('about', profile.about);
    formData.append('cause', profile.cause); formData.append('address', profile.address);
    formData.append('darpanId', profile.darpanId); formData.append('panNumber', profile.panNumber);
    if (imageFile) formData.append('avatar', imageFile);

    try {
      const { data } = await api.put('/ngos/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUpdateMessage('Profile & Verification badges updated securely.');
      setProfile(prev => ({ ...prev, avatar: data.avatar }));
      setLoggedInNgo({ ...loggedInNgo, avatar: data.avatar, name: data.name });
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      setPasswordMessage("❌ New passwords do not match.");
      return;
    }
    // Simulate API Call for demo purposes
    setPasswordMessage("⏳ Updating security credentials...");
    setTimeout(() => {
      setPasswordMessage("✅ Password successfully updated.");
      setPasswordData({ current: '', new: '', confirm: '' });
    }, 1500);
  };

  const handleDeactivate = () => {
    alert("COMPLIANCE LOCK:\n\nBecause this account has processed 80G Tax Deductible donations, financial records must be maintained. You cannot automatically delete this account. Please contact the Superadmin to archive your profile.");
  };

  const handleDeleteCampaign = async (campaignId, raisedAmount) => {
    if (raisedAmount > 1) {
      alert(`FINANCIAL COMPLIANCE LOCK:\n\nThis ledger has received funds (₹${raisedAmount.toLocaleString('en-IN')}). Under Section 80G guidelines, financial records must be maintained for tax auditing. You cannot permanently delete an active or funded ledger.\n\nPlease contact the Admin team to archive this project instead.`);
      return; 
    }
    if (window.confirm("This campaign has no funds. Are you sure you want to delete this draft permanently?")) {
      try {
        await api.delete(`/campaigns/${campaignId}`);
        setCampaigns(campaigns.filter((camp) => camp._id !== campaignId));
      } catch (err) {
        alert("Failed to delete campaign.");
      }
    }
  };

  const handleDownload10BD = async () => {
    try {
      const response = await api.get('/ngos/export-10bd', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Form10BD_Export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    } catch (error) {
      alert("Could not download the 10BD file. Please ensure you have received donations first.");
    }
  };

  const handleLogout = () => {
    setLoggedInNgo(null);
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getImageUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000&auto=format&fit=crop"; 
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path.startsWith('/') ? '' : '/'}${path}`;
  };

  if (loadingProfile) return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] text-[#0B2948] font-bold font-serif animate-pulse text-2xl">Initializing Workspace...</div>;

  const isVerified = (profile.panNumber && profile.panNumber.trim() !== "") || (profile.darpanId && profile.darpanId.trim() !== "");
  const totalRaised = campaigns.reduce((sum, camp) => sum + (camp.raised || camp.raisedAmount || 0), 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-12">
      
      {/* Premium Trust Blue Header */}
      <div className="bg-[#0B2948] text-white pt-16 pb-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00E5FF] opacity-10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/20 overflow-hidden shadow-xl backdrop-blur-sm flex items-center justify-center">
              {(imagePreview || profile.avatar) ? (
                <img src={imagePreview || getImageUrl(profile.avatar)} alt="NGO Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold">{profile.name?.charAt(0)}</span>
              )}
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-black mb-2 tracking-tight">Creator Studio</h1>
              <div className="flex items-center gap-3 text-blue-200 font-medium">
                <span>{profile.name}</span>
                {isVerified && <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-md border border-blue-500/30 flex items-center gap-1"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg> Verified</span>}
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate(`/ngo/${loggedInNgo?._id || loggedInNgo?.id}`)} className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all text-sm border border-white/20 backdrop-blur-sm shadow-lg">
              Public Profile
            </button>
            <button onClick={handleLogout} className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-bold transition-all text-sm backdrop-blur-sm">
              Log Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-20">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[700px]">
          
          {/* Sidebar Navigation */}
          <div className="w-full md:w-72 bg-slate-50 border-r border-slate-100 p-8">
            <nav className="space-y-3">
              <button onClick={() => setActiveTab('profile')} className={`w-full text-left px-5 py-4 rounded-xl font-bold text-sm transition-all flex items-center gap-3 ${activeTab === 'profile' ? 'bg-[#0B2948] text-white shadow-md' : 'text-slate-500 hover:bg-slate-200/50 hover:text-[#0B2948]'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                Organization Profile
              </button>
              <button onClick={() => setActiveTab('campaigns')} className={`w-full text-left px-5 py-4 rounded-xl font-bold text-sm transition-all flex items-center gap-3 ${activeTab === 'campaigns' ? 'bg-[#0B2948] text-white shadow-md' : 'text-slate-500 hover:bg-slate-200/50 hover:text-[#0B2948]'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                Ledgers & Compliance
              </button>
              <button onClick={() => setActiveTab('donations')} className={`w-full text-left px-5 py-4 rounded-xl font-bold text-sm transition-all flex items-center gap-3 ${activeTab === 'donations' ? 'bg-[#0B2948] text-white shadow-md' : 'text-slate-500 hover:bg-slate-200/50 hover:text-[#0B2948]'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Donor Ledger
              </button>
              <button onClick={() => setActiveTab('settings')} className={`w-full text-left px-5 py-4 rounded-xl font-bold text-sm transition-all flex items-center gap-3 ${activeTab === 'settings' ? 'bg-[#0B2948] text-white shadow-md' : 'text-slate-500 hover:bg-slate-200/50 hover:text-[#0B2948]'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Account Settings
              </button>
            </nav>

            <div className="mt-12 p-5 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Total Impact</p>
              <p className="text-2xl font-black text-[#0B2948]">₹{totalRaised.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="flex-1 p-8 md:p-12 overflow-hidden">
            
            {/* TAB 1: PROFILE */}
            {activeTab === 'profile' && (
              <div className="animate-fade-in max-w-3xl">
                <div className="mb-10 border-b border-slate-100 pb-6">
                  <h2 className="text-3xl font-serif font-black text-[#0B2948]">Organization Profile</h2>
                  <p className="text-slate-500 mt-2 font-medium">Manage your public identity and legal verification.</p>
                </div>

                {!isVerified && (
                  <div className="bg-yellow-50 border border-yellow-200 p-5 mb-8 rounded-2xl flex gap-4 items-start shadow-sm">
                    <svg className="w-6 h-6 text-yellow-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    <div>
                      <p className="text-sm text-yellow-800 font-bold">Action Required: Verification Pending</p>
                      <p className="text-sm text-yellow-700 mt-1">Provide your Darpan ID or PAN Number below to unlock the official "Verified" badge.</p>
                    </div>
                  </div>
                )}

                {updateMessage && (
                  <div className="bg-[#E6F2F2] border border-[#007A78]/20 text-[#007A78] px-5 py-4 rounded-2xl mb-8 text-sm font-bold flex items-center gap-3 shadow-sm">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    {updateMessage}
                  </div>
                )}

                <form onSubmit={handleProfileSubmit} className="space-y-8">
                  <div className="flex items-center gap-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="relative group w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-200 shrink-0">
                      {(imagePreview || profile.avatar) ? (
                        <img src={imagePreview || getImageUrl(profile.avatar)} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#0B2948] font-bold text-2xl">{profile.name?.charAt(0)}</div>
                      )}
                      <div className="absolute inset-0 bg-[#0B2948]/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      </div>
                      <input type="file" accept="image/*" onChange={handleImageSelect} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#0B2948]">Organization Logo</h3>
                      <p className="text-sm text-slate-500 mb-2">Upload a high-res JPG or PNG. 1:1 aspect ratio recommended.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#0B2948] mb-2">Organization Name</label>
                      <input type="text" name="name" value={profile.name} onChange={handleProfileChange} className="w-full px-5 py-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007A78] transition-all font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0B2948] mb-2">Primary Cause</label>
                      <input type="text" name="cause" placeholder="e.g., Education, Healthcare" value={profile.cause} onChange={handleProfileChange} className="w-full px-5 py-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007A78] transition-all font-medium" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#0B2948] mb-2">About Us</label>
                    <textarea name="about" rows="4" value={profile.about} onChange={handleProfileChange} className="w-full px-5 py-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007A78] transition-all font-medium leading-relaxed"></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#0B2948] mb-2">Headquarters Address</label>
                    <input type="text" name="address" value={profile.address} onChange={handleProfileChange} className="w-full px-5 py-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007A78] transition-all font-medium" />
                  </div>

                  <hr className="border-slate-100 my-10" />
                  <h3 className="text-xl font-serif font-black text-[#0B2948] mb-6">Legal & Compliance Identity</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#0B2948] mb-2">NGO Darpan ID</label>
                      <input type="text" name="darpanId" value={profile.darpanId} onChange={handleProfileChange} placeholder="e.g., MH/2021/000123" className="w-full px-5 py-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007A78] transition-all font-medium font-mono text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0B2948] mb-2">PAN Number</label>
                      <input type="text" name="panNumber" value={profile.panNumber} onChange={handleProfileChange} placeholder="10-digit Alphanumeric" className="w-full px-5 py-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007A78] transition-all font-medium font-mono text-sm uppercase" />
                    </div>
                  </div>

                  <button type="submit" className="mt-8 bg-[#0B2948] hover:bg-[#007A78] text-white font-black text-lg py-4 px-10 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full md:w-auto">
                    Save Profile Changes
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: CAMPAIGNS */}
            {activeTab === 'campaigns' && (
              <div className="animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4 border-b border-slate-100 pb-6">
                  <div>
                    <h2 className="text-3xl font-serif font-black text-[#0B2948]">Campaign Manager</h2>
                    <p className="text-slate-500 mt-2 font-medium">Manage active ledgers and tax compliance exports.</p>
                  </div>
                  <Link to="/campaigns/new" className="bg-[#007A78] hover:bg-[#005A58] text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 whitespace-nowrap">
                    + Create Campaign
                  </Link>
                </div>

                <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center bg-[#E6F2F2] p-8 border border-[#007A78]/20 rounded-2xl shadow-sm">
                  <div className="mb-6 md:mb-0 max-w-xl">
                    <h3 className="text-2xl font-black text-[#0B2948] mb-2 font-serif">Income Tax Compliance</h3>
                    <p className="text-[#0B2948]/80 text-sm leading-relaxed font-medium">Download your official donor ledger to file <strong>Form 10BD</strong> by May 31st.</p>
                  </div>
                  <button onClick={handleDownload10BD} className="bg-[#0B2948] hover:bg-[#06182C] text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg transform hover:-translate-y-1 whitespace-nowrap flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Download 10BD (CSV)
                  </button>
                </div>

                <div>
                  <h3 className="text-xl font-black text-[#0B2948] mb-6">Your Active Ledgers</h3>
                  {loadingCampaigns ? (
                    <div className="text-slate-400 animate-pulse font-bold">Synchronizing ledger data...</div>
                  ) : campaigns.length === 0 ? (
                    <div className="p-12 border-2 border-dashed border-slate-200 text-center rounded-3xl bg-slate-50">
                      <p className="text-slate-500 font-bold mb-4 text-lg">No active projects deployed.</p>
                      <Link to="/campaigns/new" className="text-[#007A78] font-bold hover:underline">Launch your first micro-project →</Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {campaigns.map(campaign => {
                        const raised = campaign.raised || campaign.raisedAmount || 0;
                        const goal = campaign.goal || campaign.goalAmount || 1;
                        const progress = Math.min((raised / goal) * 100, 100);

                        return (
                          <div key={campaign._id} className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300">
                            <div className="relative h-48 overflow-hidden bg-slate-100 cursor-pointer" onClick={() => navigate(`/campaign/${campaign._id}`)}>
                              <img src={getImageUrl(campaign.image)} alt={campaign.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-6 flex-grow flex flex-col">
                              <h3 className="font-bold text-lg text-[#0B2948] mb-4 line-clamp-2 leading-tight">{campaign.title}</h3>
                              <div className="mt-auto">
                                <div className="flex justify-between text-xs font-bold mb-2">
                                  <span className="text-[#007A78]">₹{raised.toLocaleString('en-IN')} raised</span>
                                  <span className="text-slate-400">₹{goal.toLocaleString('en-IN')} goal</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-6">
                                  <div className="bg-[#007A78] h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                                </div>
                                <div className="flex gap-3 pt-4 border-t border-slate-50">
                                  <button onClick={() => navigate(`/campaigns/edit/${campaign._id}`)} className="flex-1 bg-slate-50 text-[#0B2948] font-bold py-3 rounded-xl border border-slate-200 hover:bg-[#0B2948] hover:text-white transition-colors text-sm">Edit</button>
                                  <button onClick={() => handleDeleteCampaign(campaign._id, raised)} className="flex-1 bg-red-50 text-red-600 font-bold py-3 rounded-xl border border-red-100 hover:bg-red-600 hover:text-white transition-colors text-sm">Delete</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: DONATIONS */}
            {activeTab === 'donations' && (
              <div className="animate-fade-in overflow-x-auto">
                <div className="mb-10 border-b border-slate-100 pb-6">
                  <h2 className="text-3xl font-serif font-black text-[#0B2948]">Donor Ledger</h2>
                  <p className="text-slate-500 mt-2 font-medium">Track incoming capital and supporter details.</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-w-[600px]">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 uppercase tracking-widest font-black">
                      <tr><th className="p-5">Date</th><th className="p-5">Donor Name</th><th className="p-5">Campaign</th><th className="p-5 text-right">Amount (₹)</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {donations.length === 0 ? (
                        <tr><td colSpan="4" className="p-10 text-center text-slate-400 font-medium text-sm">No donations recorded yet.</td></tr>
                      ) : (
                        donations.map((donation, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="p-5 text-sm text-slate-600">{new Date(donation.createdAt || donation.date || Date.now()).toLocaleDateString()}</td>
                            <td className="p-5 font-bold text-[#0B2948] text-sm">{donation.donorName || 'Anonymous'}</td>
                            <td className="p-5 text-sm text-slate-500 truncate max-w-[200px]">{donation.campaignTitle || donation.campaignId}</td>
                            <td className="p-5 font-black text-[#007A78] text-sm text-right">₹{donation.amount?.toLocaleString('en-IN')}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: ACCOUNT SETTINGS */}
            {activeTab === 'settings' && (
              <div className="animate-fade-in max-w-2xl">
                <div className="mb-10 border-b border-slate-100 pb-6">
                  <h2 className="text-3xl font-serif font-black text-[#0B2948]">Account Settings</h2>
                  <p className="text-slate-500 mt-2 font-medium">Manage your security credentials and account status.</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm mb-10">
                  <h3 className="text-xl font-bold text-[#0B2948] mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6 text-[#007A78]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    Security Configuration
                  </h3>
                  
                  {passwordMessage && (
                    <div className={`p-4 rounded-xl mb-6 text-sm font-bold ${passwordMessage.includes('❌') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                      {passwordMessage}
                    </div>
                  )}

                  <form onSubmit={handlePasswordSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-[#0B2948] mb-2">Current Password</label>
                      <input type="password" name="current" value={passwordData.current} onChange={handlePasswordChange} required className="w-full px-5 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007A78]" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0B2948] mb-2">New Password</label>
                      <input type="password" name="new" value={passwordData.new} onChange={handlePasswordChange} required className="w-full px-5 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007A78]" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0B2948] mb-2">Confirm New Password</label>
                      <input type="password" name="confirm" value={passwordData.confirm} onChange={handlePasswordChange} required className="w-full px-5 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007A78]" />
                    </div>
                    <button type="submit" className="mt-4 bg-[#0B2948] hover:bg-[#007A78] text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md">
                      Update Password
                    </button>
                  </form>
                </div>

                <div className="bg-red-50 border border-red-100 rounded-3xl p-8 shadow-sm">
                  <h3 className="text-xl font-bold text-red-700 mb-2 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    Danger Zone
                  </h3>
                  <p className="text-red-600/80 text-sm mb-6 font-medium leading-relaxed">
                    Once you delete your account, there is no going back. All campaigns will be taken offline. Due to 80G Tax Compliance laws, financial ledgers associated with your account will be retained by the platform for auditing purposes.
                  </p>
                  <button onClick={handleDeactivate} className="bg-white border-2 border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 font-bold py-3 px-8 rounded-xl transition-all">
                    Deactivate Account
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}