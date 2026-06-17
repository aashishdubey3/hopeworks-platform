import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  // THE FIX: Pull the live 'loggedInNgo' directly from the Context brain!
  const { loggedInNgo, logout } = useAuth(); 
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const [donor, setDonor] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // We only need to manually check the Donor now. 
    // The NGO is handled automatically by the AuthContext!
    setDonor(JSON.parse(localStorage.getItem('userInfo')));
    setDropdownOpen(false); 
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (logout) logout(); // This safely clears the NGO context & tokens
    localStorage.removeItem('userInfo'); // Clear donor info just in case
    setDropdownOpen(false);
    navigate('/auth'); // Or '/login' depending on your flow
  };

  // Helper function to safely render the Cloudinary URL
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path.startsWith('/') ? '' : '/'}${path}`;
  };

  // THE FIX: Use loggedInNgo instead of the old 'ngo' state
  const userInitial = loggedInNgo?.name?.charAt(0).toUpperCase() || donor?.name?.charAt(0).toUpperCase() || 'U';
  const isNgo = !!loggedInNgo;
  const activeUser = loggedInNgo || donor;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-[#007A78] selection:text-white">
      
      {/* GOD-LEVEL NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link to="/" className="text-2xl font-black tracking-tighter text-[#0F172A] hover:opacity-80 transition-opacity">
            Hope<span className="text-[#007A78]">Works</span><span className="text-[#007A78] text-3xl leading-none">.</span>
          </Link>
          
          <nav className="flex items-center gap-8 text-sm font-semibold tracking-wide">
            <Link to="/campaigns" className="text-gray-600 hover:text-[#007A78] transition-colors relative group">
              Campaigns
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#007A78] transition-all group-hover:w-full"></span>
            </Link>
            <Link to="/ngos" className="text-gray-600 hover:text-[#007A78] transition-colors relative group">
              Directory
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#007A78] transition-all group-hover:w-full"></span>
            </Link>
            
            <div className="pl-8 border-l border-gray-200 flex items-center relative" ref={dropdownRef}>
              {activeUser ? (
                <>
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`relative w-11 h-11 rounded-full border-2 flex items-center justify-center font-bold text-lg transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 overflow-hidden ${
                      isNgo ? 'border-[#0F172A] bg-slate-50 text-[#0F172A]' : 'border-[#007A78] bg-teal-50 text-[#007A78]'
                    }`}
                  >
                    {activeUser.avatar ? (
                      <img src={getImageUrl(activeUser.avatar)} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      userInitial
                    )}
                    
                    {isNgo && (loggedInNgo.darpanId || loggedInNgo.isVerified) && (
                      <span className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-10">✓</span>
                    )}
                  </button>

                  <div className={`absolute top-14 right-0 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-200 transform origin-top-right ${dropdownOpen ? 'scale-100 opacity-100 visible' : 'scale-95 opacity-0 invisible'}`}>
                    <div className="p-4 border-b border-gray-50 bg-slate-50">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Signed in as</p>
                      <p className="text-sm font-bold text-[#0F172A] truncate">{activeUser.name}</p>
                    </div>
                    <div className="py-2">
                      <Link to={isNgo ? "/dashboard" : "/my-impact"} onClick={() => setDropdownOpen(false)} className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-slate-50 hover:text-[#007A78] transition-colors">
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        {isNgo ? "Creator Studio" : "Impact Portfolio"}
                      </Link>
                      <Link to="/settings" onClick={() => setDropdownOpen(false)} className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-slate-50 hover:text-[#007A78] transition-colors">
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        Account Settings
                      </Link>
                    </div>
                    <div className="border-t border-gray-50 py-1">
                      <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        Secure Sign Out
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <Link to="/auth" className="px-6 py-2.5 bg-[#0F172A] hover:bg-[#007A78] text-white text-sm font-bold rounded-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                  Sign In
                </Link>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow w-full">
        {children}
      </main>

      {/* GOD-LEVEL INDUSTRY MEGA-FOOTER */}
      <footer className="bg-[#0B1120] text-slate-400 pt-24 pb-12 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#007A78] opacity-[0.07] blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <Link to="/" className="text-3xl font-black tracking-tighter text-white hover:opacity-80 transition-opacity">
                Hope<span className="text-[#00E5FF]">Works</span><span className="text-[#00E5FF]">.</span>
              </Link>
              <p className="text-sm leading-relaxed text-slate-400 max-w-xs">
                The industry standard for verified philanthropy. Building absolute trust through mathematical transparency and trackable micro-projects.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">Platform</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link to="/campaigns" className="hover:text-[#00E5FF] transition-colors">Explore Live Projects</Link></li>
                <li><Link to="/ngos" className="hover:text-[#00E5FF] transition-colors">Verified Organizations</Link></li>
                <li><Link to="/corporate" className="hover:text-[#00E5FF] transition-colors">Corporate CSR Portal</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">Trust & Safety</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link to="/about" className="hover:text-[#00E5FF] transition-colors">Our Mission</Link></li>
                <li><Link to="/compliance" className="hover:text-[#00E5FF] transition-colors">80G Tax Compliance</Link></li>
                <li><Link to="/contact" className="hover:text-[#00E5FF] transition-colors">Help Center & Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">Stay Updated</h4>
              <p className="text-sm mb-4 text-slate-400">Get impact reports and new verified causes delivered securely to your inbox.</p>
              <form className="flex shadow-lg" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="Enter your email" className="bg-white/5 border border-white/10 rounded-l-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E5FF] w-full transition-colors" />
                <button type="button" className="bg-[#00E5FF] text-[#0B1120] px-5 py-3 rounded-r-lg font-bold hover:bg-[#00B3CC] transition-colors text-sm">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>© {new Date().getFullYear()} HopeWorks Technologies. All rights reserved.</p>
            <div className="flex gap-4 items-center">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              
              {/* THE DISCRETE ADMIN LINK */}
              <Link to="/admin" className="text-xs font-bold text-slate-500 hover:text-[#00E5FF] transition-colors ml-4 border-l border-white/10 pl-4">
                Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </footer>
      
    </div>
  );
}