import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

export default function NgoProfilePage() {
  const { id } = useParams();
  const [ngo, setNgo] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [news, setNews] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper function to safely render the Cloudinary URL
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path.startsWith('/') ? '' : '/'}${path}`;
  };

  useEffect(() => {
    const fetchNgoData = async () => {
      try {
        const ngoRes = await api.get(`/ngos/${id}`);
        setNgo(ngoRes.data);
        
        try {
          const campRes = await api.get(`/campaigns/ngo/${id}`);
          setCampaigns(campRes.data);
        } catch (e) { console.warn("Campaigns not found"); }

        try {
          const newsRes = await api.get(`/ngos/${id}/news`);
          setNews(newsRes.data);
        } catch (e) { console.warn("News route not set up yet"); }

        try {
          const eventsRes = await api.get(`/ngos/${id}/events`);
          setEvents(eventsRes.data);
        } catch (e) { console.warn("Events route not set up yet"); }

      } catch (error) {
        console.error("Failed to fetch NGO data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNgoData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center animate-pulse">
        <div className="w-12 h-12 border-4 border-[#1C2331] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-serif text-[#1C2331] tracking-widest uppercase text-sm font-bold">Loading Profile...</p>
      </div>
    </div>
  );
  
  if (!ngo) return <div className="text-center py-32 text-red-800 font-serif text-2xl bg-gray-50 min-h-screen">Organization Not Found.</div>;

  const isVerified = (ngo.panNumber && ngo.panNumber.trim() !== "") || (ngo.darpanId && ngo.darpanId.trim() !== "");
  const aboutText = ngo.description || ngo.about || ngo.details || "This organization has not provided a detailed description yet, but is actively operating on the HopeWorks platform.";
  
  // THE FIX: Check the database for the avatar, process it through getImageUrl, or fallback to UI Avatars
  const rawAvatar = ngo.avatar || ngo.logo || ngo.image || ngo.imageUrl || ngo.profilePic;
  const finalAvatarUrl = rawAvatar 
    ? getImageUrl(rawAvatar) 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(ngo.name)}&background=1C2331&color=fff&size=256&font-size=0.4`;

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-12 font-sans">
      <div className="max-w-5xl mx-auto px-6 space-y-8 animate-fade-in">

        {/* 1. THE HEADER CARD */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-sm">
          <img 
            src={finalAvatarUrl} 
            alt={ngo.name} 
            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-sm border border-gray-100 bg-white" 
          />
          <div className="flex-1 text-center md:text-left mt-2">
            <div className="flex flex-col md:flex-row items-center md:items-center gap-3 mb-2">
              <h1 className="text-4xl font-serif font-bold text-[#1C2331]">{ngo.name}</h1>
              {isVerified && (
                <span title="Verified Platform Member" className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-200">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  Verified
                </span>
              )}
            </div>
            <p className="text-gray-500 italic text-lg">{ngo.cause || ngo.category || "Social Welfare & Development"}</p>
          </div>
        </div>

        {/* 2. THE MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* About Us */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <h2 className="text-2xl font-serif font-bold text-[#1C2331] mb-6 border-b border-gray-100 pb-4">About Us</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-[1.05rem]">
                {aboutText}
              </p>
            </div>

            {/* Active Campaigns */}
            <div id="campaigns" className="pt-4">
              <h2 className="text-2xl font-serif font-bold text-[#1C2331] mb-6">Active Campaigns</h2>
              {campaigns.length === 0 ? (
                <div className="bg-white p-10 text-center border border-gray-200 rounded-xl shadow-sm">
                  <p className="text-gray-500 italic font-serif">This organization currently has no active campaigns.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {campaigns.map(camp => {
                    const raised = camp.raised || camp.raisedAmount || 0;
                    const goal = camp.goal || camp.goalAmount || 1;
                    const progress = Math.min((raised / goal) * 100, 100);

                    return (
                      <div key={camp._id} className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
                          <h4 className="font-bold text-xl text-[#1C2331]">{camp.title}</h4>
                          <span className="text-sm font-mono bg-gray-50 border border-gray-200 px-3 py-1 rounded-md text-gray-600 whitespace-nowrap">
                            ₹{raised.toLocaleString('en-IN')} / ₹{goal.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-[#007A78] h-2 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="mt-6">
                          <Link to={`/campaign/${camp._id}`} className="block w-full sm:w-auto text-center bg-[#1C2331] hover:bg-black text-white font-bold py-3 px-6 rounded-md transition-colors">
                            View Project Details
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* NEWS & EVENTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              
              {/* Recent News */}
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#1C2331] mb-6">Latest News</h2>
                {news.length === 0 ? (
                  <div className="bg-white p-6 text-center border border-gray-200 rounded-xl shadow-sm">
                    <p className="text-gray-500 italic text-sm">No recent updates.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {news.map(item => (
                      <div key={item._id} className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm border-l-4 border-l-[#007A78]">
                        <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                        <h4 className="font-bold text-[#1C2331] mb-2 leading-tight">{item.title}</h4>
                        <p className="text-sm text-gray-600 line-clamp-3 whitespace-pre-line">{item.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming Events */}
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#1C2331] mb-6">Upcoming Events</h2>
                {events.length === 0 ? (
                  <div className="bg-white p-6 text-center border border-gray-200 rounded-xl shadow-sm">
                    <p className="text-gray-500 italic text-sm">No upcoming events scheduled.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {events.map(event => (
                      <div key={event._id} className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm border-l-4 border-l-[#1C2331]">
                        <p className="text-xs font-bold text-[#007A78] mb-2 uppercase tracking-wide">
                          🗓️ {new Date(event.date || event.eventDate).toLocaleDateString()}
                        </p>
                        <h4 className="font-bold text-[#1C2331] mb-2 leading-tight">{event.title || event.name}</h4>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{event.description || event.details}</p>
                        <p className="text-xs font-mono text-gray-500 bg-gray-50 inline-block px-2 py-1 rounded">📍 {event.location}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN: Contact & Location */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm sticky top-28">
              <h2 className="text-xl font-serif font-bold text-[#1C2331] mb-6 border-b border-gray-100 pb-4">Contact & Location</h2>
              <div className="space-y-6">
                <div>
                  <p className="font-bold text-[#1C2331] mb-1 text-sm uppercase tracking-wide">Email</p>
                  <a href={`mailto:${ngo.email}`} className="text-gray-600 hover:text-[#007A78] transition-colors break-words">
                    {ngo.email}
                  </a>
                </div>
                <div>
                  <p className="font-bold text-[#1C2331] mb-1 text-sm uppercase tracking-wide">Address</p>
                  <p className="text-gray-600 leading-relaxed mb-2">{ngo.address || "Location currently on file."}</p>
                  {ngo.address && (
                    <a href={`https://maps.google.com/?q=${encodeURIComponent(ngo.address)}`} target="_blank" rel="noopener noreferrer" className="text-[#007A78] font-semibold hover:underline text-sm flex items-center gap-1 mt-3">
                      Get Directions →
                    </a>
                  )}
                  <p className="text-xs text-gray-400 mt-2 italic">Use the link above to find us on Google Maps.</p>
                </div>
                
                {campaigns.length > 0 && (
                  <div className="pt-4 mt-4 border-t border-gray-100">
                    <Link 
                      to={`/donate/${campaigns[0]._id}`} 
                      className="block w-full text-center bg-[#007A78] hover:bg-[#006A68] text-white font-bold py-3 px-4 rounded-md transition-colors shadow-sm"
                    >
                      Donate to Latest Project
                    </Link>
                  </div>
                )}

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}