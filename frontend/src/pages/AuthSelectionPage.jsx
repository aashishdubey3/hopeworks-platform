import { Link } from 'react-router-dom';

export default function AuthSelectionPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center py-12 px-6 font-sans">
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="text-4xl font-serif font-bold text-[#1C2331] mb-4">Welcome to HopeWorks</h1>
        <p className="text-gray-600 text-lg max-w-xl mx-auto">
          Choose how you want to interact with the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full animate-fade-in">
        
        {/* Donor / User Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 md:p-12 flex flex-col items-center text-center hover:shadow-xl transition-all hover:-translate-y-1">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-[#007A78]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#1C2331] mb-3">I am a Supporter</h2>
          <p className="text-gray-500 mb-8 flex-grow">
            Donate to verified causes, track your impact, and instantly download your 80G tax receipts.
          </p>
          <div className="w-full space-y-3">
            <Link to="/donor-login" className="block w-full bg-[#007A78] hover:bg-[#006A68] text-white font-bold py-3 px-4 rounded-md transition-colors">
              Continue as Supporter
            </Link>
          </div>
        </div>

        {/* NGO Card (Keeps your exact working flow!) */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 md:p-12 flex flex-col items-center text-center hover:shadow-xl transition-all hover:-translate-y-1">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-[#1C2331]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#1C2331] mb-3">We are an NGO</h2>
          <p className="text-gray-500 mb-8 flex-grow">
            Register your organization, launch funding campaigns, and manage your compliance data. (Requires Admin Approval)
          </p>
          <div className="w-full space-y-3">
            <Link to="/login" className="block w-full bg-[#1C2331] hover:bg-black text-white font-bold py-3 px-4 rounded-md transition-colors">
              NGO Login / Register
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}