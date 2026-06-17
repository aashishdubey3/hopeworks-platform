import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function CampaignsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  const [campaigns, setCampaigns] = useState([]);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Fetch campaigns ONLY ONCE when the page loads
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await api.get('/campaigns');
        setCampaigns(response.data);
      } catch (error) {
        console.error("Error fetching campaigns", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCampaigns();
  }, []); // Empty dependency array prevents endless refetching!

  // 2. Sync the search box if the user arrived from the Homepage search bar
  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  const getImageUrl = (camp) => {
    const path = camp.image || camp.imageUrl || camp.photo;
    if (!path) return "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000&auto=format&fit=crop"; 
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path.startsWith('/') ? '' : '/'}${path}`;
  };

  // 3. THE FIX: A Bulletproof, Instant Search Filter
  const filteredCampaigns = useMemo(() => {
    if (!searchTerm) return campaigns;
    
    // Clean up the search term so spaces/caps don't break the results
    const lowerSearch = searchTerm.toLowerCase().trim();
    
    return campaigns.filter(camp => {
      // Safely check every possible field a user might search for
      const matchTitle = camp.title?.toLowerCase().includes(lowerSearch);
      const matchCause = camp.cause?.toLowerCase().includes(lowerSearch);
      const matchCategory = camp.category?.toLowerCase().includes(lowerSearch); // Failsafe
      const matchHost = camp.host?.toLowerCase().includes(lowerSearch);
      const matchDesc = camp.description?.toLowerCase().includes(lowerSearch);
      
      return matchTitle || matchCause || matchCategory || matchHost || matchDesc;
    });
  }, [campaigns, searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(searchTerm ? { search: searchTerm } : {});
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      
      {/* 1. PREMIUM SLIM HEADER */}
      <div className="bg-[#0B2948] border-b-2 border-[#007A78] sticky top-20 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="font-serif text-2xl text-white font-black tracking-tight">Active Micro-Projects</h1>
            <p className="text-blue-200/80 font-medium text-xs mt-0.5 tracking-wide">Transparent, trackable initiatives waiting for your support.</p>
          </div>
          
          <form onSubmit={handleSearch} className="relative w-full md:w-[450px]">
            <svg className="absolute left-4 top-3 w-4 h-4 text-blue-300/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search campaigns, causes, or hosts..." 
              className="w-full pl-10 pr-24 py-2.5 bg-white/10 border border-white/20 rounded-xl focus:bg-white/20 focus:border-[#00E5FF] focus:outline-none focus:ring-1 focus:ring-[#00E5FF] transition-all text-sm font-medium text-white placeholder-blue-200/50"
            />
            <button type="submit" className="absolute right-1.5 top-1.5 bottom-1.5 bg-[#007A78] hover:bg-[#00E5FF] text-white hover:text-[#0B2948] px-4 rounded-lg text-xs font-black transition-all shadow-sm tracking-wider uppercase">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* 2. THE GRID */}
      <div className="max-w-7xl mx-auto px-6 pt-10 animate-fade-in">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="animate-pulse bg-white rounded-3xl h-96 shadow-sm border border-slate-100"></div>)}
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-2xl mx-auto mt-8">
            <svg className="w-20 h-20 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            <h3 className="text-2xl font-black text-[#0B2948] mb-2 font-serif">No projects found</h3>
            <p className="text-slate-500 text-sm mb-6">We couldn't find any active projects matching "{searchTerm}".</p>
            <button onClick={() => { setSearchTerm(''); setSearchParams({}); }} className="px-6 py-2.5 bg-[#0B2948] text-white font-bold rounded-xl hover:bg-[#007A78] transition-colors shadow-md text-sm">
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCampaigns.map(campaign => {
              const raised = campaign.raised || campaign.raisedAmount || 0;
              const goal = campaign.goal || campaign.goalAmount || 1;
              const progressPercent = Math.min(100, Math.round((raised / goal) * 100));
              
              return (
                <article key={campaign._id} className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col transform hover:-translate-y-1 overflow-hidden cursor-pointer relative" onClick={() => navigate(`/campaign/${campaign._id}`)}>
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#00E5FF] to-[#007A78] opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                  
                  <div className="relative h-52 overflow-hidden bg-slate-100">
                    <img src={getImageUrl(campaign)} alt={campaign.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-[#0B2948] shadow-sm uppercase tracking-wider">
                      Tax Deductible
                    </div>
                  </div>
                  
                  <div className="p-7 flex flex-col flex-grow">
                    <h3 className="font-bold text-lg text-[#0B2948] mb-1 line-clamp-2 leading-tight group-hover:text-[#007A78] transition-colors">{campaign.title}</h3>
                    <p className="text-xs text-[#007A78] font-bold mb-3 uppercase tracking-wider">Host: {campaign.host || "Verified NGO"}</p>
                    <p className="text-slate-500 mb-6 flex-grow text-sm line-clamp-2 leading-relaxed">{campaign.description}</p>
                    
                    <div className="mt-auto pt-4 border-t border-slate-50">
                      <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="text-[#0B2948]">₹{raised.toLocaleString('en-IN')} raised</span>
                        <span className="text-slate-400">₹{goal.toLocaleString('en-IN')} goal</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-5">
                        <div className="bg-[#007A78] h-full rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                      </div>
                      <button className="w-full bg-[#0B2948] hover:bg-[#007A78] text-white text-sm font-bold py-2.5 rounded-xl transition-colors shadow-sm">
                        Fund this project
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}