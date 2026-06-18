import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button';
import api from '../utils/api'; 

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedCampaigns, setHighlightedCampaigns] = useState([]);
  const [campaignsVisible, setCampaignsVisible] = useState(false);
  const campaignsRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const { data } = await api.get('/campaigns');
        setHighlightedCampaigns(data.slice(0, 8)); 
      } catch (error) {
        console.error("Failed to load campaigns", error);
      }
    };
    fetchCampaigns();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCampaignsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (campaignsRef.current) observer.observe(campaignsRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) navigate(`/ngos?search=${encodeURIComponent(searchTerm)}`);
  };

  const getImageUrl = (camp) => {
    const path = camp.image || camp.imageUrl || camp.photo;
    if (!path) return "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000&auto=format&fit=crop"; 
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path.startsWith('/') ? '' : '/'}${path}`;
  };

  return (
    <div className="w-full animate-fade-in bg-[#F8FAFC]">
      
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>

      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-br from-[#0B2948] to-[#06182C] text-white py-24 md:py-28 px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-[#00E5FF] rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-[#007A78] rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <div className="inline-block px-4 py-1.5 rounded-full border border-[#00E5FF]/20 bg-white/5 backdrop-blur-md mb-6 text-xs font-bold tracking-widest text-[#00E5FF] uppercase shadow-sm">
            The Standard for Philanthropy
          </div>
          <h1 className="font-serif text-4xl md:text-6xl font-black mb-5 leading-tight tracking-tight">
            Amplify Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#33FFCC]">Impact.</span>
          </h1>
          <p className="text-lg text-blue-100/80 mb-10 font-light max-w-xl leading-relaxed">
            Discover, fund, and track fully verified organizations through absolute mathematical transparency.
          </p>
          
          <form onSubmit={handleSearch} className="flex w-full max-w-lg mx-auto shadow-2xl rounded-full bg-white/10 backdrop-blur-xl border border-white/20 p-1 pl-5 focus-within:ring-2 focus-within:ring-[#00E5FF] transition-all">
            <input 
              type="text" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder="Search causes or organizations..." 
              className="flex-1 bg-transparent border-none text-white text-sm placeholder-blue-200/50 focus:ring-0 outline-none" 
            />
            <button type="submit" className="px-6 py-2.5 bg-[#007A78] text-white text-sm font-bold rounded-full hover:bg-[#00605F] transition-colors shadow-lg transform hover:scale-105 duration-200">
              Search
            </button>
          </form>

          {/* THE NEW FEATURE: Location Based "Near Me" Button */}
          <div className="mt-6">
            <button 
              onClick={() => navigate('/ngos?nearMe=true')} 
              className="flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold rounded-full transition-all backdrop-blur-md transform hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              Locate NGOs Near Me
            </button>
          </div>
        </div>
      </section>

      {/* 2. CORPORATE CSR CTA */}
      <section className="max-w-4xl mx-auto px-6 -mt-10 relative z-20">
        <div className="bg-white/95 backdrop-blur-xl border border-white shadow-xl rounded-2xl p-8 md:p-10 text-center transform transition-all hover:-translate-y-1">
          <div className="w-12 h-12 bg-[#E6F2F2] rounded-xl flex items-center justify-center mx-auto mb-4 rotate-3">
            <svg className="w-6 h-6 text-[#007A78]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#0B2948] mb-3">Corporate CSR Portal</h2>
          <p className="text-slate-500 mb-6 max-w-xl mx-auto leading-relaxed text-sm">
            Fulfill your legal mandates with confidence. Explore fully vetted, Section 80G-certified NGOs and receive automated tax compliance documentation.
          </p>
          <Button variant="secondary" onClick={() => navigate('/corporate')} className="px-8 py-3 text-sm rounded-lg border-[#0B2948] text-[#0B2948] hover:bg-[#0B2948] hover:text-white transition-colors">
            Explore Corporate Partnerships
          </Button>
        </div>
      </section>

      {/* 3. SCROLL-TRIGGERED CAROUSEL */}
      <section className="py-20 overflow-hidden" ref={campaignsRef}>
        <div className="max-w-7xl mx-auto px-6 mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-[#0B2948] mb-1 font-serif">Live Micro-Projects</h2>
            <p className="text-slate-500 font-medium text-sm">Verified causes actively seeking deployment.</p>
          </div>
          <Link to="/campaigns" className="hidden md:flex items-center text-[#007A78] text-sm font-bold hover:text-[#0B2948] transition-colors group">
            Explore All 
            <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4-4m4 4H3"></path></svg>
          </Link>
        </div>
        
        <div className="relative w-full max-w-7xl mx-auto">
          <div className="absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-[#F8FAFC] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-[#F8FAFC] to-transparent z-10 pointer-events-none"></div>

          {highlightedCampaigns.length === 0 ? (
            <div className="px-6 flex gap-6">
              {[1, 2, 3].map(i => <div key={i} className="animate-pulse shrink-0 w-[300px] bg-white border border-slate-100 shadow-sm rounded-2xl h-[400px]"></div>)}
            </div>
          ) : (
            <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory px-6 pb-8 pt-4 gap-6">
              {highlightedCampaigns.map((camp, index) => {
                const raised = camp.raised || camp.raisedAmount || 0;
                const goal = camp.goal || camp.goalAmount || 1;
                const progress = Math.min((raised / goal) * 100, 100);

                return (
                  <article 
                    key={camp._id} 
                    onClick={() => navigate(`/campaign/${camp._id}`)}
                    className={`shrink-0 w-[280px] sm:w-[320px] snap-start group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-700 cursor-pointer flex flex-col transform ${
                      campaignsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div className="relative h-44 overflow-hidden bg-slate-100 rounded-t-2xl">
                      <img 
                        src={getImageUrl(camp)} 
                        alt={camp.title} 
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-[#0B2948] shadow-sm uppercase tracking-wider">
                        Tax Deductible
                      </div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="font-bold text-lg text-[#0B2948] mb-1 line-clamp-2 leading-tight">{camp.title}</h3>
                      {camp.ngo?.name && <p className="text-xs text-[#007A78] font-bold mb-3">{camp.ngo.name}</p>}
                      <p className="text-slate-600 mb-5 flex-grow text-xs line-clamp-2 leading-relaxed">{camp.description}</p>
                      
                      <div className="mt-auto pt-4 border-t border-slate-50">
                        <div className="flex justify-between text-xs font-bold mb-2">
                          <span className="text-[#0B2948]">₹{raised.toLocaleString('en-IN')} <span className="font-normal text-slate-500">raised</span></span>
                          <span className="text-slate-400">₹{goal.toLocaleString('en-IN')} <span className="font-normal">goal</span></span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-5">
                          <div className="bg-[#007A78] h-full rounded-full transition-all duration-1000 relative" style={{ width: `${progress}%` }}>
                            <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-pulse"></div>
                          </div>
                        </div>
                        <button className="w-full bg-[#0B2948] text-white text-sm font-bold py-2.5 rounded-lg shadow-sm hover:bg-[#007A78] transition-colors">
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
      </section>

      {/* 4. THE OPTIMISTIC CTA BAR */}
      <section className="relative bg-gradient-to-br from-[#0B2948] to-[#06182C] overflow-hidden mt-8 border-t border-[#00E5FF]/20 shadow-2xl">
        <div className="absolute top-[-50%] left-[-10%] w-96 h-96 bg-[#00E5FF] opacity-20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-50%] right-[-10%] w-96 h-96 bg-[#007A78] opacity-30 rounded-full blur-[100px]"></div>

        <div className="max-w-4xl mx-auto px-6 py-20 relative z-10">
          <div className="flex flex-col items-center text-center text-white mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-black mb-4 leading-tight drop-shadow-sm">
              Ready to make a <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#33FFCC]">difference?</span>
            </h2>
            <p className="text-blue-100/80 mb-8 text-lg font-light leading-relaxed max-w-2xl">
              Join our network today. Start amplifying your impact and building absolute trust within the philanthropic ecosystem.
            </p>
            <Link to="/auth" className="bg-[#007A78] hover:bg-[#00E5FF] hover:text-[#0B2948] text-white font-black py-3.5 px-10 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(0,122,120,0.4)] hover:shadow-[0_0_25px_rgba(0,229,255,0.6)] transform hover:-translate-y-1 text-sm uppercase tracking-wider">
              Get Started Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}