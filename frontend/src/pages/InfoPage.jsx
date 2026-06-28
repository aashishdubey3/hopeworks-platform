import { Link } from 'react-router-dom';

export default function InfoPage({ title, description }) {
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#f7fbff,_#f2f7fb)] px-6 py-16">
      <div className="mx-auto max-w-4xl rounded-[32px] border border-slate-200 bg-white p-10 shadow-2xl">
        <div className="mb-6 inline-flex rounded-full border border-[#007A78]/20 bg-[#E6F2F2] px-3 py-1 text-sm font-semibold text-[#007A78]">
          HopeWorks platform
        </div>
        <h1 className="font-serif text-4xl font-black text-[#0B2948]">{title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">{description}</p>
        <div className="mt-8 rounded-[24px] border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
          This section is now live and ready for your full content. You can expand it with detailed policy, support, or mission content at any time.
        </div>
        <Link to="/" className="mt-8 inline-flex text-sm font-bold text-[#007A78] hover:underline">
          Return home →
        </Link>
      </div>
    </div>
  );
}
