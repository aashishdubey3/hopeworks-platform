import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('ngos');
  const [ngos, setNgos] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [csrLeads, setCsrLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ngoRes, campRes, csrRes] = await Promise.all([
        api.get('/admin/ngos'),
        api.get('/admin/campaigns'),
        api.get('/admin/csr').catch(() => ({ data: [] }))
      ]);
      setNgos(ngoRes.data);
      setCampaigns(campRes.data);
      setCsrLeads(csrRes.data);
    } catch (error) {
      console.error("Admin fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Upgraded to handle both Approvals and Bans
  const handleToggleStatus = async (id, currentStatus, isBanned) => {
    const actionText = currentStatus === 'pending' ? 'APPROVE and VERIFY' : (isBanned ? 'REINSTATE' : 'SUSPEND');
    
    if (window.confirm(`Are you sure you want to ${actionText} this organization?`)) {
      try {
        await api.put(`/admin/ngo/${id}/status`);
        fetchData(); // Refresh the table
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

  // Count pending applications for the notification badge
  const pendingNgosCount = ngos.filter(n => n.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans">
      
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
          <div className="flex bg-white/5 p-1.5 rounded-xl border border-white/10 backdrop-blur-sm">
            <button onClick={() => setActiveTab('ngos')} className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'ngos' ? 'bg-[#007A78] text-white shadow-md' : 'text-slate-300 hover:text-white'}`}>
              Organizations
              {pendingNgosCount > 0 && (
                <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm">{pendingNgosCount}</span>
              )}
            </button>
            <button onClick={() => setActiveTab('campaigns')} className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'campaigns' ? 'bg-[#007A78] text-white shadow-md' : 'text-slate-300 hover:text-white'}`}>
              Campaigns
            </button>
            <button onClick={() => setActiveTab('csr')} className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'csr' ? 'bg-[#007A78] text-white shadow-md' : 'text-slate-300 hover:text-white'}`}>
              CSR Inquiries
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-10 animate-fade-in">
        {loading ? (
          <div className="bg-white p-20 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center justify-center">
             <div className="w-10 h-10 border-4 border-[#0B2948] border-t-transparent rounded-full animate-spin mb-4"></div>
             <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">Connecting to Secure Server...</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden">
            
            {/* TAB 1: NGOs */}
            {activeTab === 'ngos' && (
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 uppercase tracking-widest font-black">
                    <th className="p-5">Registered Entity</th>
                    <th className="p-5">Contact Vector</th>
                    <th className="p-5">Platform Status</th>
                    <th className="p-5 text-right">System Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ngos.map(ngo => (
                    <tr key={ngo._id} className={`${ngo.isBanned ? 'bg-red-50/50' : ngo.status === 'pending' ? 'bg-amber-50/30' : 'hover:bg-slate-50'} transition-colors`}>
                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-[#0B2948] text-sm">{ngo.name}</p>
                          {/* Show Email Verified Checkmark */}
                          {ngo.isEmailVerified && <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono mt-1">ID: {ngo._id}</p>
                      </td>
                      <td className="p-5 text-sm text-slate-600 font-medium">{ngo.email}</td>
                      <td className="p-5">
                        {/* New Status Pipeline Display */}
                        {ngo.status === 'pending' ? (
                          <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm animate-pulse">Awaiting Approval</span>
                        ) : ngo.isBanned ? (
                          <span className="bg-red-100 text-red-800 border border-red-200 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">Suspended</span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">Verified Active</span>
                        )}
                      </td>
                      <td className="p-5 text-right space-x-4">
                        <Link to={`/ngo/${ngo._id}`} target="_blank" className="text-[#007A78] hover:text-[#0B2948] text-sm font-bold transition-colors">Audit Profile</Link>
                        
                        {/* Dynamic Action Button */}
                        {ngo.status === 'pending' ? (
                          <button onClick={() => handleToggleStatus(ngo._id, ngo.status, ngo.isBanned)} className="text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-lg border transition-colors shadow-sm border-emerald-500 text-emerald-600 bg-emerald-50 hover:bg-emerald-100">
                            Approve
                          </button>
                        ) : (
                          <button onClick={() => handleToggleStatus(ngo._id, ngo.status, ngo.isBanned)} className={`text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-lg border transition-colors shadow-sm ${ngo.isBanned ? 'border-amber-500 text-amber-600 bg-amber-50 hover:bg-amber-100' : 'border-red-500 text-red-600 bg-red-50 hover:bg-red-100'}`}>
                            {ngo.isBanned ? 'Reinstate' : 'Suspend'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* TAB 2: CAMPAIGNS */}
            {activeTab === 'campaigns' && (
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 uppercase tracking-widest font-black">
                    <th className="p-5">Active Ledger</th>
                    <th className="p-5">Capital Deployment</th>
                    <th className="p-5 text-right">System Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {campaigns.map(camp => {
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

            {/* TAB 3: CSR LEADS */}
            {activeTab === 'csr' && (
              <table className="w-full text-left border-collapse whitespace-nowrap">
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
                          <p className="text-[10px] text-slate-400 mt-1 font-medium">Logged: {new Date(lead.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="p-5">
                          <p className="text-sm font-bold text-slate-700">{lead.contactName}</p>
                          <div className="text-xs text-slate-500 mt-0.5 space-y-0.5 font-medium">
                            <p>{lead.email}</p>
                            <p>{lead.phone}</p>
                          </div>
                        </td>
                        <td className="p-5">
                          <p className="text-sm font-black text-[#007A78]">₹{lead.budget.toLocaleString('en-IN')}</p>
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