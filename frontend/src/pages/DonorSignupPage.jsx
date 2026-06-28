import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const getDonorAccounts = () => {
  try {
    return JSON.parse(localStorage.getItem('donorAccounts') || '[]');
  } catch {
    return [];
  }
};

const persistDonorSession = (user) => {
  localStorage.setItem(
    'userInfo',
    JSON.stringify({
      ...user,
      role: 'donor',
      token: 'donor-local-session'
    })
  );
  localStorage.setItem('token', 'donor-local-session');
};

export default function DonorSignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in your name, email, and password.');
      return;
    }

    const accounts = getDonorAccounts();
    const existing = accounts.find((account) => account.email.toLowerCase() === formData.email.trim().toLowerCase());

    if (existing) {
      setError('A donor account already exists for this email. Please log in instead.');
      return;
    }

    const newAccount = {
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('donorAccounts', JSON.stringify([...accounts, newAccount]));
    persistDonorSession(newAccount);
    setSuccess('Your donor account is ready. Redirecting to your dashboard...');

    setTimeout(() => navigate('/my-impact'), 600);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(0,122,120,0.16),_transparent_35%),linear-gradient(135deg,_#f8fbff,_#f4f8fb)] px-6 py-16 flex items-center justify-center">
      <div className="w-full max-w-5xl rounded-[32px] border border-slate-200 bg-white/90 p-8 shadow-2xl backdrop-blur lg:grid lg:grid-cols-[1fr_0.9fr]">
        <div className="pr-0 lg:pr-8">
          <div className="mb-5 inline-flex items-center rounded-full border border-[#007A78]/20 bg-[#E6F2F2] px-3 py-1 text-sm font-semibold text-[#007A78]">
            Donor account setup
          </div>
          <h1 className="font-serif text-4xl font-black text-[#0B2948]">Create your supporter profile</h1>
          <p className="mt-3 text-lg leading-relaxed text-slate-600">
            Register once and unlock donation history, receipt downloads, and a premium impact dashboard.
          </p>

          <div className="mt-8 space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">Secure account for donation tracking</div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">Instant access to every 80G receipt</div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">A dashboard that keeps every contribution organized</div>
          </div>
        </div>

        <div className="mt-8 rounded-[28px] bg-[#0B2948] p-8 text-white lg:mt-0">
          <h2 className="text-2xl font-serif font-black">Join as a donor</h2>
          <p className="mt-2 text-sm text-slate-300">Create your account to donate and track your impact.</p>

          {error && <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200">{error}</div>}
          {success && <div className="mt-5 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200">{success}</div>}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Full name</label>
              <input name="name" value={formData.name} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400 outline-none focus:border-[#00E5FF]" placeholder="Aarav Sharma" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Email address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400 outline-none focus:border-[#00E5FF]" placeholder="you@example.com" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Phone (optional)</label>
              <input name="phone" value={formData.phone} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400 outline-none focus:border-[#00E5FF]" placeholder="9876543210" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Create password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400 outline-none focus:border-[#00E5FF]" placeholder="Minimum 6 characters" />
            </div>
            <button type="submit" className="mt-2 w-full rounded-2xl bg-[#007A78] px-4 py-3 font-bold text-white transition hover:bg-[#006765]">
              Create donor account
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-400">
            Already have an account? <Link to="/donor-login" className="font-semibold text-[#00E5FF]">Log in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
