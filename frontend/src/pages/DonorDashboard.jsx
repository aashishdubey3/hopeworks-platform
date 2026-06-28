import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const currency = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);

export default function DonorDashboard() {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filterNgo, setFilterNgo] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('donorDashboardTheme') === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
    if (!userInfo?.token) {
      navigate('/donor-login');
      return;
    }

    setUser(userInfo);

    const fetchHistory = async () => {
      try {
        const response = await api.get('/payments/my', { params: { email: userInfo?.email } });
        setDonations(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Failed to fetch donation history', error);
        setDonations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem('donorDashboardTheme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/donor-login');
  };

  const summary = useMemo(() => {
    const filteredDonations = donations.filter((donation) => {
      const donationDate = new Date(donation.createdAt || donation.date || Date.now());
      const monthKey = `${donationDate.getFullYear()}-${String(donationDate.getMonth() + 1).padStart(2, '0')}`;
      const ngoKey = donation.campaign?.ngo?.name || donation.ngoName || donation.campaign?.ngo || donation.campaignTitle || 'general';
      const matchesNgo = filterNgo === 'all' || ngoKey === filterNgo;
      const matchesMonth = filterMonth === 'all' || monthKey === filterMonth;
      return matchesNgo && matchesMonth;
    });

    const totalAmount = filteredDonations.reduce((sum, donation) => sum + Number(donation.amount || 0), 0);
    const ngoCount = new Set(filteredDonations.map((donation) => donation.campaign?.ngo?.name || donation.ngoName || donation.campaign?.ngo || donation.campaignTitle || 'general')).size;
    const availableReceipts = filteredDonations.filter((donation) => donation.taxReceiptUrl || donation.receiptUrl).length;
    const progressPercent = donations.length ? Math.min(100, Math.round((availableReceipts / donations.length) * 100)) : 0;

    const monthlyDonations = filteredDonations.filter((donation) => {
      const date = new Date(donation.createdAt || donation.date || Date.now());
      return date.getMonth() === new Date().getMonth() && date.getFullYear() === new Date().getFullYear();
    });

    return { totalAmount, ngoCount, availableReceipts, progressPercent, filteredDonations, monthlyDonations };
  }, [donations, filterNgo, filterMonth]);

  const ngoOptions = useMemo(() => {
    const unique = [...new Set(donations.map((donation) => donation.ngoName || donation.campaign?.ngo?.name || donation.campaign?.ngo || donation.campaignTitle || 'General'))];
    return unique.filter(Boolean);
  }, [donations]);

  const monthOptions = useMemo(() => {
    const months = [...new Set(donations.map((donation) => {
      const date = new Date(donation.createdAt || donation.date || Date.now());
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }))].sort((a, b) => b.localeCompare(a));

    return months;
  }, [donations]);

  const trendSeries = useMemo(() => {
    const months = [...new Set(summary.filteredDonations.map((donation) => {
      const date = new Date(donation.createdAt || donation.date || Date.now());
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }))].sort();

    return months.slice(-6).map((monthKey) => {
      const amount = summary.filteredDonations
        .filter((donation) => {
          const date = new Date(donation.createdAt || donation.date || Date.now());
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` === monthKey;
        })
        .reduce((sum, donation) => sum + Number(donation.amount || 0), 0);

      return {
        key: monthKey,
        label: new Date(`${monthKey}-01`).toLocaleDateString('en-IN', { month: 'short' }),
        amount
      };
    });
  }, [summary.filteredDonations]);

  const favoriteNgos = useMemo(() => {
    const grouped = summary.filteredDonations.reduce((acc, donation) => {
      const name = donation.campaign?.ngo?.name || donation.ngoName || donation.campaign?.ngo || donation.campaignTitle || 'General';
      if (!name) return acc;
      if (!acc[name]) acc[name] = { name, count: 0, total: 0 };
      acc[name].count += 1;
      acc[name].total += Number(donation.amount || 0);
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => b.total - a.total).slice(0, 3);
  }, [summary.filteredDonations]);

  const handleDownloadAll = () => {
    const receipts = summary.filteredDonations.filter((donation) => donation.taxReceiptUrl || donation.receiptUrl);
    receipts.forEach((donation, index) => {
      const url = donation.taxReceiptUrl || donation.receiptUrl;
      if (url) {
        setTimeout(() => {
          const link = document.createElement('a');
          link.href = url;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.click();
        }, index * 250);
      }
    });
  };

  const isDark = darkMode;
  const shellClass = isDark ? 'min-h-screen bg-slate-950 text-slate-100' : 'min-h-screen bg-[linear-gradient(180deg,_#f7fbff_0%,_#eef6ff_100%)] text-slate-800';
  const cardClass = isDark ? 'border-slate-800 bg-slate-900/90 shadow-2xl shadow-black/25' : 'border-slate-200 bg-white shadow-2xl shadow-slate-200/60';
  const mutedText = isDark ? 'text-slate-400' : 'text-slate-500';
  const softCard = isDark ? 'border-slate-800 bg-slate-950/70' : 'border-slate-200 bg-slate-50';

  if (loading) {
    return (
      <div className={`flex min-h-screen flex-col items-center justify-center ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-[linear-gradient(135deg,_#f7fbff,_#f2f7fb)] text-[#0B2948]'}`}>
        <div className={`mb-4 h-12 w-12 animate-spin rounded-full border-4 ${isDark ? 'border-[#00E5FF] border-t-transparent' : 'border-[#0B2948] border-t-transparent'}`}></div>
        <p className="text-sm font-black uppercase tracking-[0.3em]">Loading your impact dashboard...</p>
      </div>
    );
  }

  return (
    <div className={`${shellClass} pb-16 font-sans`}>
      <div className={`${isDark ? 'bg-[#07121f]' : 'bg-[#0B2948]'} px-6 pb-24 pt-12 text-white`}>
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className={`mb-4 inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${isDark ? 'border-white/15 bg-white/10 text-slate-200' : 'border-white/15 bg-white/10 text-slate-200'}`}>
              Premium supporter impact dashboard
            </div>
            <h1 className="font-serif text-4xl font-black sm:text-5xl">Your giving portfolio</h1>
            <p className={`mt-3 max-w-2xl text-base ${isDark ? 'text-slate-300' : 'text-slate-300'}`}>
              Welcome back, {user?.name || 'supporter'}. Your donations, favorite causes, and annual receipts are now organized like a private impact studio.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode((value) => !value)}
              className={`rounded-2xl border px-4 py-2.5 text-sm font-bold transition ${isDark ? 'border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700' : 'border-slate-200 bg-white/10 text-white hover:bg-white/20'}`}
            >
              {isDark ? '☀️ Light mode' : '🌙 Dark mode'}
            </button>
            <button
              onClick={handleLogout}
              className="rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-2.5 text-sm font-bold text-red-300 transition hover:bg-red-500/20"
            >
              Log out
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto -mt-12 max-w-6xl space-y-8 px-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className={`rounded-[28px] border p-6 ${cardClass}`}>
            <p className={`text-sm font-semibold uppercase tracking-[0.25em] ${mutedText}`}>Total donated</p>
            <h2 className={`mt-3 font-serif text-3xl font-black ${isDark ? 'text-[#00E5FF]' : 'text-[#007A78]'}`}>{currency(summary.totalAmount)}</h2>
          </div>
          <div className={`rounded-[28px] border p-6 ${cardClass}`}>
            <p className={`text-sm font-semibold uppercase tracking-[0.25em] ${mutedText}`}>NGOs supported</p>
            <h2 className={`mt-3 font-serif text-3xl font-black ${isDark ? 'text-white' : 'text-[#0B2948]'}`}>{summary.ngoCount}</h2>
          </div>
          <div className={`rounded-[28px] border p-6 ${cardClass}`}>
            <p className={`text-sm font-semibold uppercase tracking-[0.25em] ${mutedText}`}>Receipts ready</p>
            <h2 className={`mt-3 font-serif text-3xl font-black ${isDark ? 'text-white' : 'text-[#0B2948]'}`}>{summary.availableReceipts}</h2>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className={`rounded-[32px] border p-6 ${cardClass}`}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className={`text-sm font-semibold uppercase tracking-[0.2em] ${mutedText}`}>Monthly impact summary</p>
                <h3 className={`font-serif text-xl font-black ${isDark ? 'text-white' : 'text-[#0B2948]'}`}>This month at a glance</h3>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${isDark ? 'bg-[#0f2c3f] text-[#00E5FF]' : 'bg-[#E6F2F2] text-[#007A78]'}`}>{summary.monthlyDonations.length} gifts</span>
            </div>
            <div className={`rounded-[24px] border p-4 ${softCard}`}>
              <p className={`text-sm ${mutedText}`}>You gave</p>
              <p className={`mt-2 font-serif text-3xl font-black ${isDark ? 'text-[#00E5FF]' : 'text-[#007A78]'}`}>{currency(summary.monthlyDonations.reduce((sum, donation) => sum + Number(donation.amount || 0), 0))}</p>
              <p className={`mt-2 text-sm ${mutedText}`}>Average gift {currency(summary.monthlyDonations.length ? summary.monthlyDonations.reduce((sum, donation) => sum + Number(donation.amount || 0), 0) / summary.monthlyDonations.length : 0)}</p>
            </div>
          </div>

          <div className={`rounded-[32px] border p-6 ${cardClass}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-semibold uppercase tracking-[0.2em] ${mutedText}`}>Filter your history</p>
                <h3 className={`font-serif text-xl font-black ${isDark ? 'text-white' : 'text-[#0B2948]'}`}>Refine the timeline</h3>
              </div>
              <button onClick={handleDownloadAll} className={`rounded-2xl px-4 py-2 text-sm font-bold text-white transition ${isDark ? 'bg-[#00E5FF] text-[#07121f] hover:bg-[#4be7ff]' : 'bg-[#0B2948] hover:bg-[#007A78]'}`}>
                Download all receipts
              </button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <select value={filterNgo} onChange={(e) => setFilterNgo(e.target.value)} className={`rounded-2xl border px-3 py-2.5 text-sm outline-none ${isDark ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-200 bg-slate-50'}`}>
                <option value="all">All NGOs</option>
                {ngoOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className={`rounded-2xl border px-3 py-2.5 text-sm outline-none ${isDark ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-200 bg-slate-50'}`}>
                <option value="all">All dates</option>
                {monthOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className={`rounded-[32px] border p-6 ${cardClass}`}>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className={`text-sm font-semibold uppercase tracking-[0.2em] ${mutedText}`}>Donation trends</p>
                <h3 className={`font-serif text-xl font-black ${isDark ? 'text-white' : 'text-[#0B2948]'}`}>A visual pulse of your generosity</h3>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${isDark ? 'bg-[#0f2c3f] text-[#00E5FF]' : 'bg-[#E6F2F2] text-[#007A78]'}`}>Last 6 months</span>
            </div>
            {trendSeries.length > 0 ? (
              <div>
                <div className="flex h-44 items-end gap-3">
                  {trendSeries.map((point) => {
                    const height = Math.max(14, (point.amount / Math.max(...trendSeries.map((item) => item.amount), 1)) * 100);
                    return (
                      <div key={point.key} className="flex flex-1 flex-col items-center">
                        <div className={`flex h-36 w-full items-end rounded-2xl border p-2 ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}>
                          <div className="w-full rounded-xl bg-gradient-to-t from-[#007A78] to-[#00E5FF]" style={{ height: `${height}%` }}></div>
                        </div>
                        <p className={`mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] ${mutedText}`}>{point.label}</p>
                      </div>
                    );
                  })}
                </div>
                <div className={`mt-4 rounded-2xl border p-4 text-sm ${softCard}`}>
                  <p className={mutedText}>Your strongest month was {trendSeries.reduce((best, item) => item.amount > best.amount ? item : best, trendSeries[0] || { label: '—', amount: 0 }).label} with {currency(trendSeries.reduce((best, item) => item.amount > best.amount ? item : best, trendSeries[0] || { label: '—', amount: 0 }).amount)} in impact.</p>
                </div>
              </div>
            ) : (
              <div className={`rounded-[24px] border p-8 text-center ${softCard}`}>
                <p className={`text-sm ${mutedText}`}>Your donation trend will appear here as soon as you give.</p>
              </div>
            )}
          </div>

          <div className={`rounded-[32px] border p-6 ${cardClass}`}>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className={`text-sm font-semibold uppercase tracking-[0.2em] ${mutedText}`}>Favorite NGOs</p>
                <h3 className={`font-serif text-xl font-black ${isDark ? 'text-white' : 'text-[#0B2948]'}`}>Your most cherished causes</h3>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${isDark ? 'bg-[#0f2c3f] text-[#00E5FF]' : 'bg-[#E6F2F2] text-[#007A78]'}`}>Top 3</span>
            </div>
            <div className="space-y-3">
              {favoriteNgos.length > 0 ? favoriteNgos.map((ngo) => (
                <div key={ngo.name} className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${softCard}`}>
                  <div>
                    <p className={`font-semibold ${isDark ? 'text-slate-100' : 'text-[#0B2948]'}`}>{ngo.name}</p>
                    <p className={`text-sm ${mutedText}`}>{ngo.count} gifts • {currency(ngo.total)}</p>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isDark ? 'bg-[#0f2c3f] text-[#00E5FF]' : 'bg-[#E6F2F2] text-[#007A78]'}`}>★</div>
                </div>
              )) : (
                <div className={`rounded-[24px] border p-8 text-center ${softCard}`}>
                  <p className={`text-sm ${mutedText}`}>Your favorite NGOs will appear once you start supporting causes.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`overflow-hidden rounded-[32px] border ${cardClass}`}>
          <div className={`flex flex-col gap-4 border-b px-6 py-7 md:flex-row md:items-center md:justify-between ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <div>
              <h3 className={`font-serif text-2xl font-black ${isDark ? 'text-white' : 'text-[#0B2948]'}`}>Donation timeline</h3>
              <p className={`mt-2 text-sm ${mutedText}`}>Track which NGOs you donated to, when you donated, and download each receipt instantly.</p>
            </div>
            <Link to="/campaigns" className={`rounded-2xl px-4 py-2.5 text-sm font-bold text-white transition ${isDark ? 'bg-[#00E5FF] text-[#07121f] hover:bg-[#4be7ff]' : 'bg-[#0B2948] hover:bg-[#007A78]'}`}>
              Explore more causes
            </Link>
          </div>

          {summary.filteredDonations.length === 0 ? (
            <div className="px-8 py-16 text-center">
              <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${isDark ? 'bg-[#0f2c3f] text-[#00E5FF]' : 'bg-[#E6F2F2] text-[#007A78]'}`}>✦</div>
              <h4 className={`font-serif text-xl font-black ${isDark ? 'text-white' : 'text-[#0B2948]'}`}>No donations yet</h4>
              <p className={`mx-auto mt-2 max-w-md text-sm ${mutedText}`}>
                Your impact stories will appear here as soon as you support a verified campaign.
              </p>
              <Link to="/campaigns" className={`mt-6 inline-flex text-sm font-bold ${isDark ? 'text-[#00E5FF]' : 'text-[#007A78]'} hover:underline`}>
                Discover trusted NGOs →
              </Link>
            </div>
          ) : (
            <div className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
              {summary.filteredDonations.map((donation) => {
                const receiptUrl = donation.taxReceiptUrl || donation.receiptUrl;
                const donationDate = donation.createdAt || donation.date;
                const campaignTitle = donation.campaign?.title || donation.campaignTitle || 'General donation';
                const ngoTitle = donation.campaign?.ngo?.name || donation.ngoName || 'Verified NGO';

                return (
                  <div key={donation._id} className="flex flex-col gap-6 px-6 py-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isDark ? 'bg-[#0f2c3f] text-[#00E5FF]' : 'bg-[#E6F2F2] text-[#007A78]'}`}>
                        {campaignTitle.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className={`font-serif text-lg font-black ${isDark ? 'text-white' : 'text-[#0B2948]'}`}>{campaignTitle}</h4>
                        <p className={`mt-1 text-sm ${mutedText}`}>{ngoTitle}</p>
                        <p className={`mt-2 text-sm ${mutedText}`}>
                          Donated on {new Date(donationDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <p className={`mt-2 text-xs font-semibold uppercase tracking-[0.25em] ${mutedText}`}>
                          Tx ID: {donation.paymentId || donation._id?.slice(-8) || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-3 md:items-end">
                      <div className="text-right">
                        <p className={`text-sm font-semibold uppercase tracking-[0.2em] ${mutedText}`}>Amount</p>
                        <p className={`font-serif text-2xl font-black ${isDark ? 'text-white' : 'text-[#0B2948]'}`}>{currency(Number(donation.amount || 0))}</p>
                      </div>
                      {receiptUrl ? (
                        <a
                          href={receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold text-white transition ${isDark ? 'bg-[#00E5FF] text-[#07121f] hover:bg-[#4be7ff]' : 'bg-[#007A78] hover:bg-[#006765]'}`}
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                          Download 80G receipt
                        </a>
                      ) : (
                        <span className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold ${isDark ? 'border-amber-500/30 bg-amber-500/10 text-amber-300' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                          Receipt generating...
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}