import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('ngos');
  const [ngos, setNgos] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [csrLeads, setCsrLeads] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Audit Modal State
  const [auditNgo, setAuditNgo] = useState(null); 

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ngoRes, campRes, csrRes, donationRes] = await Promise.all([
        api.get('/admin/ngos'),
        api.get('/admin/campaigns'),
        api.get('/admin/csr').catch(() => ({ data: [] })),
        api.get('/payments/all-donations').catch(() => ({ data: [] })) 
      ]);
      setNgos(ngoRes.data);
      setCampaigns(campRes.data);
      setCsrLeads(csrRes.data);
      setDonations(donationRes.data);
    } catch (error) {
      console.error("Admin fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (id, currentStatus, isBanned) => {
    const actionText = currentStatus === 'pending' ? 'APPROVE and VERIFY' : (isBanned ? 'REINSTATE' : 'SUSPEND');
    
    if (window.confirm(`Are you sure you want to ${actionText} this organization?`)) {
      try {
        await api.put(`/admin/ngo/${id}/status`);
        fetchData(); 
        setAuditNgo(null); // Close modal if open
      } catch (error) {
        alert("Failed to update organization status.");
      }
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (window.confirm("WARNING: This action will permanently remove the campaign from the platform. Proceed?")) {
      try {
        await api.delete(`/admin/campaign/${id}`);
        fetchData();
      } catch (error) {
        alert("Failed to terminate campaign.");
      }
    }
  };

  const handleToggleCsrStatus = async (id) => {
    try {
      await api.put(`/admin/csr/${id}/status`);
      fetchData();
    } catch (error) {
      alert("Failed to update inquiry status.");
    }
  };

  const pendingNgosCount = ngos.filter(n => n.status === 'pending').length;
  const verifiedNgosCount = ngos.filter(n => n.status === 'verified' || n.status === 'active' || n.isEmailVerified).length;
  const activeCampaignsCount = campaigns.filter(c => (c.status && c.status !== 'draft') || Number(c.raised || c.raisedAmount || 0) > 0).length;
  const totalRaised = campaigns.reduce((sum, camp) => sum + Number(camp.raised || camp.raisedAmount || 0), 0);
  const totalDonationValue = donations.reduce((sum, donation) => sum + Number(donation.amount || 0), 0);
  const pendingCsrCount = csrLeads.filter((lead) => lead.status === 'Pending Review').length;

  const filteredNgos = ngos.filter((ngo) => {
    const query = searchTerm.toLowerCase();
    return !query || [ngo.name, ngo.email, ngo.darpanId || '', ngo.address || ''].join(' ').toLowerCase().includes(query);
  });

  const filteredCampaigns = campaigns.filter((camp) => {
    const query = searchTerm.toLowerCase();
    return !query || [camp.title, camp.ngo || '', camp.description || ''].join(' ').toLowerCase().includes(query);
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans">
      
      {/* --- SECURE AUDIT MODAL --- */}
      {auditNgo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B2948]/90 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-[#0B2948] p-6 text-white flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-2xl font-black font-serif tracking-tight">Organization Audit View</h2>
                <p className="text-blue-200 text-xs font-mono mt-1">INTERNAL ID: {auditNgo._id}</p>
              </div>
              <button onClick={() => setAuditNgo(null)} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Entity Name</p>
                  <p className="text-lg font-black text-[#0B2948]">{auditNgo.name}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Registered Email</p>
                  <p className="text-lg font-bold text-slate-700">{auditNgo.email}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Registration Date</p>
                  {/* THE FIX: Safe Date Parsing */}
                  <p className="text-sm font-bold text-slate-700">{new Date(auditNgo.createdAt || Date.now()).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Current Status</p>
                  {auditNgo.status === 'pending' ? <span className="text-amber-600 font-black uppercase text-sm">Pending Verification</span> : auditNgo.isBanned ? <span className="text-red-600 font-black uppercase text-sm">Suspended</span> : <span className="text-emerald-600 font-black uppercase text-sm">Verified</span>}
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Darpan ID</p>
                  <p className="font-mono text-sm font-bold text-[#0B2948]">{auditNgo.darpanId || 'Not Provided'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">PAN Number</p>
                  <p className="font-mono text-sm font-bold text-[#0B2948] uppercase">{auditNgo.panNumber || 'Not Provided'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Headquarters Address</p>
                  <p className="text-sm font-bold text-slate-700">{auditNgo.address || 'Not Provided'}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Platform Summary</p>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{auditNgo.about || 'No description provided by the organization.'}</p>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-4 shrink-0">
              <button onClick={() => setAuditNgo(null)} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors">Cancel</button>
              
              {auditNgo.status === 'pending' ? (
                <button onClick={() => handleToggleStatus(auditNgo._id, auditNgo.status, auditNgo.isBanned)} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-wider text-sm rounded-xl shadow-lg transition-all">
                  Approve & Verify Entity
                </button>
              ) : (
                <button onClick={() => handleToggleStatus(auditNgo._id, auditNgo.status, auditNgo.isBanned)} className={`px-6 py-2.5 text-white font-black uppercase tracking-wider text-sm rounded-xl shadow-lg transition-all ${auditNgo.isBanned ? 'bg-amber-500 hover:bg-amber-600' : 'bg-red-500 hover:bg-red-600'}`}>
                  {auditNgo.isBanned ? 'Reinstate Entity' : 'Suspend Entity'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* --------------------------- */}

      {/* Professional Admin Header */}
      <div className="bg-[#0B2948] pt-16 pb-24 px-6 text-white border-b-4 border-[#007A78]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-block px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold tracking-widest uppercase rounded-full mb-4 shadow-sm">
              Level 4 Clearance
            </div>
            <h1 className="text-4xl font-serif font-black tracking-tight">Superadmin Console</h1>
            <p className="text-blue-200/80 font-medium mt-2 text-sm">Platform Management & Enterprise Verification</p>
          </div>
          <div className="flex flex-wrap bg-white/5 p-1.5 rounded-xl border border-white/10 backdrop-blur-sm gap-1">
            <button onClick={() => setActiveTab('ngos')} className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'ngos' ? 'bg-[#007A78] text-white shadow-md' : 'text-slate-300 hover:text-white'}`}>
              Organizations
              {pendingNgosCount > 0 && <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm">{pendingNgosCount}</span>}
            </button>
            <button onClick={() => setActiveTab('campaigns')} className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'campaigns' ? 'bg-[#007A78] text-white shadow-md' : 'text-slate-300 hover:text-white'}`}>
              Campaigns
            </button>
            <button onClick={() => setActiveTab('donations')} className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'donations' ? 'bg-[#007A78] text-white shadow-md' : 'text-slate-300 hover:text-white'}`}>
              Transactions
            </button>
            <button onClick={() => setActiveTab('csr')} className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'csr' ? 'bg-[#007A78] text-white shadow-md' : 'text-slate-300 hover:text-white'}`}>
              CSR
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-10 animate-fade-in">
        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Registered NGOs</p>
            <p className="mt-3 text-3xl font-black text-[#0B2948]">{ngos.length}</p>
            <p className="mt-2 text-sm text-slate-500">{verifiedNgosCount} verified and active</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Pending approvals</p>
            <p className="mt-3 text-3xl font-black text-[#007A78]">{pendingNgosCount}</p>
            <p className="mt-2 text-sm text-slate-500">Needs review before going live</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Campaigns live</p>
            <p className="mt-3 text-3xl font-black text-[#0B2948]">{activeCampaignsCount}</p>
            <p className="mt-2 text-sm text-slate-500">₹{totalRaised.toLocaleString('en-IN')} total raised</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">CSR + donations</p>
            <p className="mt-3 text-3xl font-black text-[#007A78]">{csrLeads.length + donations.length}</p>
            <p className="mt-2 text-sm text-slate-500">₹{totalDonationValue.toLocaleString('en-IN')} in donations</p>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">Operations overview</p>
            <p className="text-sm text-slate-500">Review approvals, transaction health, and partner activity from a single control center.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">{pendingNgosCount} pending NGOs</div>
            <div className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">{pendingCsrCount} CSR leads awaiting review</div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white p-20 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center justify-center">
             <div className="w-10 h-10 border-4 border-[#0B2948] border-t-transparent rounded-full animate-spin mb-4"></div>
             <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">Connecting to Secure Server...</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xl overflow-x-auto">
            
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search NGOs, campaigns, or partners..."
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#007A78]"
              />
            </div>

            {/* TAB 1: NGOs */}
            {activeTab === 'ngos' && (
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 uppercase tracking-widest font-black">
                    <th className="p-5">Registered Entity</th>
                    <th className="p-5">Contact Vector</th>
                    <th className="p-5">Platform Status</th>
                    <th className="p-5 text-right">System Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredNgos.map(ngo => (
                    <tr key={ngo._id} className={`${ngo.isBanned ? 'bg-red-50/50' : ngo.status === 'pending' ? 'bg-amber-50/30' : 'hover:bg-slate-50'} transition-colors`}>
                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-[#0B2948] text-sm">{ngo.name}</p>
                          {ngo.isEmailVerified && <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono mt-1">ID: {ngo._id}</p>
                      </td>
                      <td className="p-5 text-sm text-slate-600 font-medium">{ngo.email}</td>
                      <td className="p-5">
                        {ngo.status === 'pending' ? (
                          <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm animate-pulse">Awaiting Approval</span>
                        ) : ngo.isBanned ? (
                          <span className="bg-red-100 text-red-800 border border-red-200 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">Suspended</span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">Verified Active</span>
                        )}
                      </td>
                      <td className="p-5 text-right">
                        <button onClick={() => setAuditNgo(ngo)} className="text-[#0B2948] bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-colors border border-slate-200">
                          Secure Audit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* TAB 2: CAMPAIGNS */}
            {activeTab === 'campaigns' && (
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 uppercase tracking-widest font-black">
                    <th className="p-5">Active Ledger</th>
                    <th className="p-5">Capital Deployment</th>
                    <th className="p-5 text-right">System Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCampaigns.map(camp => {
                     const raised = camp.raised || camp.raisedAmount || 0;
                     const goal = camp.goal || camp.goalAmount || 1;
                     const progress = Math.min((raised / goal) * 100, 100);
                     return (
                      <tr key={camp._id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-5">
                          <p className="font-bold text-[#0B2948] text-sm truncate max-w-sm">{camp.title}</p>
                          <p className="text-[10px] text-slate-400 mt-1">Host Entity ID: <span className="font-mono">{camp.ngo || camp.ngoId}</span></p>
                        </td>
                        <td className="p-5 w-72">
                          <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 mb-1.5 tracking-wider">
                            <span className="text-[#007A78]">₹{raised.toLocaleString('en-IN')} Secured</span>
                            <span>₹{goal.toLocaleString('en-IN')} Target</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#007A78] h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                          </div>
                        </td>
                        <td className="p-5 text-right space-x-4">
                          <Link to={`/campaign/${camp._id}`} target="_blank" className="text-[#007A78] hover:text-[#0B2948] text-sm font-bold transition-colors">Audit Ledger</Link>
                          <button onClick={() => handleDeleteCampaign(camp._id)} className="text-red-500 hover:text-red-700 text-sm font-bold transition-colors">Terminate</button>
                        </td>
                      </tr>
                     );
                  })}
                </tbody>
              </table>
            )}

            {/* TAB 3: GLOBAL TRANSACTIONS (DONATIONS) */}
            {activeTab === 'donations' && (
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 uppercase tracking-widest font-black">
                    <th className="p-5">Date</th>
                    <th className="p-5">Donor Name</th>
                    <th className="p-5">Amount</th>
                    <th className="p-5">Receiving Campaign ID</th>
                    <th className="p-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {donations.length === 0 ? (
                    <tr><td colSpan="5" className="p-10 text-center text-slate-400 font-medium text-sm">No transaction data available yet.</td></tr>
                  ) : (
                    donations.map((tx, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        {/* THE FIX: Safe Date Parsing */}
                        <td className="p-5 text-sm text-slate-600">{new Date(tx.createdAt || tx.date || Date.now()).toLocaleDateString()}</td>
                        <td className="p-5 font-bold text-[#0B2948] text-sm">{tx.donorName || 'Anonymous'}</td>
                        <td className="p-5 font-black text-[#007A78] text-sm">₹{tx.amount?.toLocaleString('en-IN')}</td>
                        <td className="p-5 text-[10px] font-mono text-slate-400">{tx.campaignId}</td>
                        <td className="p-5">
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md">Successful</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* TAB 4: CSR LEADS */}
            {activeTab === 'csr' && (
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 uppercase tracking-widest font-black">
                    <th className="p-5">Corporate Entity</th>
                    <th className="p-5">Point of Contact</th>
                    <th className="p-5">Mandate Details</th>
                    <th className="p-5 text-right">Pipeline Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {csrLeads.length === 0 ? (
                    <tr><td colSpan="4" className="p-10 text-center text-slate-400 font-medium text-sm">No corporate inquiries detected in the system.</td></tr>
                  ) : (
                    csrLeads.map(lead => (
                      <tr key={lead._id} className={`${lead.status === 'Pending Review' ? 'bg-[#007A78]/5' : 'hover:bg-slate-50'} transition-colors`}>
                        <td className="p-5">
                          <p className="font-bold text-[#0B2948] text-sm">{lead.companyName}</p>
                          {/* THE FIX: Safe Date Parsing */}
                          <p className="text-[10px] text-slate-400 mt-1 font-medium">Logged: {new Date(lead.createdAt || Date.now()).toLocaleDateString()}</p>
                        </td>
                        <td className="p-5">
                          <p className="text-sm font-bold text-slate-700">{lead.contactName}</p>
                          <div className="text-xs text-slate-500 mt-0.5 space-y-0.5 font-medium">
                            <p>{lead.email}</p>
                            <p>{lead.phone}</p>
                          </div>
                        </td>
                        <td className="p-5">
                          <p className="text-sm font-black text-[#007A78]">₹{lead.budget?.toLocaleString('en-IN')}</p>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">{lead.focusArea}</p>
                        </td>
                        <td className="p-5 text-right">
                          <button 
                            onClick={() => handleToggleCsrStatus(lead._id)}
                            className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-md border transition-all shadow-sm w-36 text-center
                              ${lead.status === 'Pending Review' ? 'border-amber-400 text-amber-600 bg-amber-50 hover:bg-amber-100 animate-pulse' : 
                                lead.status === 'Contacted' ? 'border-blue-400 text-blue-600 bg-blue-50 hover:bg-blue-100' :
                                lead.status === 'Funded' ? 'border-emerald-400 text-emerald-700 bg-emerald-50 hover:bg-emerald-100' :
                                'border-slate-300 text-slate-500 bg-slate-50 hover:bg-slate-100'
                              }`}
                          >
                            {lead.status}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

          </div>
        )}
      </div>
    </div>
  );
}