import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const getStoredDonor = (email) => {
  try {
    const accounts = JSON.parse(localStorage.getItem('donorAccounts') || '[]');
    return accounts.find((account) => account.email?.toLowerCase() === email.toLowerCase()) || null;
  } catch {
    return null;
  }
};

export default function DonorLoginPage() {
  const navigate = useNavigate();
  const { setLoggedInNgo } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('userInfo') || 'null');
    if (savedUser?.email) {
      navigate('/my-impact');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please add your email and password to continue.');
      setLoading(false);
      return;
    }

    const localDonor = getStoredDonor(formData.email.trim().toLowerCase());
    if (localDonor?.password && localDonor.password === formData.password) {
      const donorSession = {
        ...localDonor,
        name: localDonor.name || formData.name.trim() || localDonor.email,
        email: localDonor.email,
        role: 'donor',
        token: 'donor-local-session'
      };
      localStorage.removeItem('ngoData');
      localStorage.removeItem('ngoInfo');
      localStorage.removeItem('loggedInNgoId');
      setLoggedInNgo(null);
      localStorage.setItem('userInfo', JSON.stringify(donorSession));
      localStorage.setItem('token', donorSession.token);
      setLoading(false);
      navigate('/my-impact');
      return;
    }

    try {
      const response = await api.post('/auth/login', {
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });

      const donorSession = {
        ...response.data,
        name: formData.name.trim() || response.data.name || response.data.email,
        email: response.data.email,
        role: 'donor',
        token: response.data.token
      };

      localStorage.removeItem('ngoData');
      localStorage.removeItem('ngoInfo');
      localStorage.removeItem('loggedInNgoId');
      setLoggedInNgo(null);
      localStorage.setItem('userInfo', JSON.stringify(donorSession));
      localStorage.setItem('token', donorSession.token);
      setLoading(false);
      navigate('/my-impact');
    } catch (loginError) {
      setLoading(false);
      const message = loginError?.response?.data?.message || 'Unable to sign in with those credentials.';
      setError(message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(0,122,120,0.16),_transparent_35%),linear-gradient(135deg,_#f8fbff,_#f4f8fb)] px-6 py-16">
      <div className="grid w-full max-w-5xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[32px] border border-slate-200 bg-white/80 p-8 shadow-2xl backdrop-blur md:p-10">
          <div className="mb-5 inline-flex items-center rounded-full border border-[#007A78]/20 bg-[#E6F2F2] px-3 py-1 text-sm font-semibold text-[#007A78]">
            Supporter portal
          </div>
          <h1 className="mb-3 font-serif text-4xl font-black text-[#0B2948]">Access your giving dashboard</h1>
          <p className="text-lg leading-relaxed text-slate-600">
            Track every NGO you supported, see payment dates, and download every 80G receipt from one premium dashboard.
          </p>

          <div className="mt-8 grid gap-3 text-sm text-slate-600">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="font-bold text-[#007A78]">•</span>
              Real-time impact summary with donations, NGOs, and receipts
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="font-bold text-[#007A78]">•</span>
              One-click receipt downloads for every contribution
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="font-bold text-[#007A78]">•</span>
              Clean timeline showing when each donation happened
            </div>
          </div>
        </div>

        <div className="rounded-[32px] bg-[#0B2948] p-8 text-white shadow-2xl md:p-10">
          <h2 className="mb-2 font-serif text-3xl font-black">Welcome back, supporter</h2>
          <p className="mb-7 text-slate-300">Use your existing NGO credentials or create a donor account if you want a dedicated supporter profile.</p>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Your name (optional)</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400 outline-none ring-0 focus:border-[#00E5FF]"
                placeholder="Aarav Sharma"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Email address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400 outline-none focus:border-[#00E5FF]"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400 outline-none focus:border-[#00E5FF]"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-2xl bg-[#007A78] px-4 py-3 font-bold text-white transition hover:bg-[#006765] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Signing in...' : 'Open my impact dashboard'}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-400">
            New donor? <Link to="/donor-signup" className="font-semibold text-[#00E5FF]">Create a donor account</Link> to unlock full tracking and receipt downloads.
          </p>

          <div className="mt-6 border-t border-white/10 pt-4 text-sm text-slate-400">
            Looking for NGO access? <Link to="/login" className="font-semibold text-[#00E5FF]">Go to NGO login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
