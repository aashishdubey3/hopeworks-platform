import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';

// --- THE MATH: Calculates distance between two GPS coordinates in kilometers ---
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity; // Put missing coordinates at the bottom
  
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; 
};

export default function NgoDirectoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  const [ngos, setNgos] = useState([]);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [loading, setLoading] = useState(true);
  
  // New State for the GPS feature
  const [isLocating, setIsLocating] = useState(false);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path.startsWith('/') ? '' : '/'}${path}`;
  };

  useEffect(() => {
    const fetchNgos = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/ngos?search=${encodeURIComponent(initialSearch)}`);
        setNgos(response.data);
      } catch (error) {
        console.error("Failed to fetch NGOs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNgos();
    setSearchTerm(initialSearch); 
  }, [initialSearch]);
  // Add this right below your existing useEffect!
  useEffect(() => {
    // If the URL has ?nearMe=true AND the NGOs are fully loaded...
    if (!loading && ngos.length > 0 && searchParams.get('nearMe') === 'true') {
      handleNearMeClick(); // Auto-trigger the GPS!
      setSearchParams({}); // Clear the URL so it doesn't loop
    }
  }, [loading, ngos.length, searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(searchTerm ? { search: searchTerm } : {});
  };

  // --- THE FEATURE: Geolocation Sorting Logic ---
  const handleNearMeClick = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        const sortedNgos = [...ngos]
          .map(ngo => {
            const distance = calculateDistance(userLat, userLng, ngo.latitude, ngo.longitude);
            return { ...ngo, distance };
          })
          .sort((a, b) => a.distance - b.distance);

        setNgos(sortedNgos);
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location", error);
        alert("Please allow location access to find NGOs near you.");
        setIsLocating(false);
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-24">
      
      {/* 1. PREMIUM SLIM HEADER */}
      <div className="bg-[#0B2948] border-b-2 border-[#007A78] sticky top-20 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="font-serif text-2xl text-white font-black tracking-tight">Organization Directory</h1>
            <p className="text-blue-200/80 font-medium text-xs mt-0.5 tracking-wide">Discover and fund verified organizations making a real impact.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <form onSubmit={handleSearch} className="relative w-full sm:w-[350px]">
              <svg className="absolute left-4 top-3 w-4 h-4 text-blue-300/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, cause..." 
                className="w-full pl-10 pr-24 py-2.5 bg-white/10 border border-white/20 rounded-xl focus:bg-white/20 focus:border-[#00E5FF] focus:outline-none focus:ring-1 focus:ring-[#00E5FF] transition-all text-sm font-medium text-white placeholder-blue-200/50"
              />
              <button type="submit" className="absolute right-1.5 top-1.5 bottom-1.5 bg-[#007A78] hover:bg-[#00E5FF] text-white hover:text-[#0B2948] px-4 rounded-lg text-xs font-black transition-all shadow-sm tracking-wider uppercase">
                Search
              </button>
            </form>

            {/* THE NEW BUTTON: NGOs Near Me */}
            <button 
              onClick={handleNearMeClick} 
              disabled={isLocating}
              className="flex items-center justify-center gap-2 bg-[#00E5FF] hover:bg-[#007A78] text-[#0B2948] hover:text-white px-5 py-2.5 rounded-xl font-black transition-all shadow-md disabled:opacity-50 text-xs tracking-wider uppercase w-full sm:w-auto shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              {isLocating ? 'Locating...' : 'Near Me'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. THE DIRECTORY GRID */}
      <section className="max-w-7xl mx-auto px-6 pt-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="animate-pulse bg-white border border-slate-100 rounded-3xl h-64 shadow-sm"></div>)}
          </div>
        ) : ngos.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-16 text-center max-w-3xl mx-auto mt-8">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"></path></svg>
            </div>
            <h3 className="text-2xl font-black text-[#0B2948] mb-3 font-serif">No organizations found.</h3>
            <p className="text-slate-500 mb-8 text-sm">We couldn't find any verified NGOs matching your criteria. Try adjusting your search terms.</p>
            <button onClick={() => { setSearchTerm(''); setSearchParams({}); setNgos([...ngos].sort((a, b) => a.name.localeCompare(b.name))); }} className="px-6 py-2.5 bg-[#0B2948] text-white font-bold rounded-xl hover:bg-[#007A78] transition-colors shadow-md text-sm">
              Clear Search & Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ngos.map(ngo => {
              const isVerified = ngo.panNumber || ngo.darpanId;
              const rawAvatar = ngo.avatar || ngo.logo || ngo.image;
              const hasAvatar = !!rawAvatar;
              const avatarUrl = hasAvatar ? getImageUrl(rawAvatar) : null;
              
              return (
                <Link key={ngo._id} to={`/ngo/${ngo._id}`} className="group bg-white border border-slate-100 rounded-3xl p-8 hover:shadow-xl hover:border-blue-100 transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#00E5FF] to-[#007A78] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-14 h-14 rounded-full border border-slate-100 bg-slate-50 overflow-hidden shrink-0 shadow-sm flex items-center justify-center">
                      {hasAvatar ? <img src={avatarUrl} alt={ngo.name} className="w-full h-full object-cover" /> : <span className="text-lg font-bold text-[#0B2948]">{ngo.name.charAt(0)}</span>}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-[#0B2948] group-hover:text-[#007A78] transition-colors leading-tight line-clamp-2">{ngo.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{ngo.cause || "Social Welfare"}</p>
                    </div>
                  </div>
                  
                  <p className="text-slate-500 text-sm flex-grow mb-6 line-clamp-3 leading-relaxed">
                    {ngo.about || ngo.description || "Dedicated to driving social impact, community development, and operational transparency."}
                  </p>
                  
                  <div className="flex items-center justify-between border-t border-slate-50 pt-5 mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <svg className="w-3.5 h-3.5 mr-1 text-[#007A78]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        {ngo.address ? ngo.address.split(',')[0] : "Location on file"}
                      </div>
                      
                      {/* THE DISTANCE BADGE: Shows up if the user clicked 'Near Me' */}
                      {ngo.distance && ngo.distance !== Infinity && (
                        <div className="text-[10px] font-black text-[#00E5FF] bg-[#0B2948] px-2 py-1.5 rounded-lg shadow-sm">
                          📍 {ngo.distance < 1 ? '< 1' : ngo.distance.toFixed(1)} km
                        </div>
                      )}
                    </div>

                    {isVerified && (
                      <span className="flex items-center bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                        Verified
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}