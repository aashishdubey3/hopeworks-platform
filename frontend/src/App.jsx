import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';

// Core Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboard from './pages/AdminDashboard';
import AuthSelectionPage from './pages/AuthSelectionPage';

// Features
import CampaignsPage from './pages/CampaignsPage';
import CampaignDetailsPage from './pages/CampaignDetailsPage';
import CreateCampaignPage from './pages/CreateCampaignPage'; // <-- Added missing import
import DonatePage from './pages/DonatePage';
import CsrPage from './pages/CsrPage'; 
import NgoDirectoryPage from './pages/NgoDirectoryPage';
import NgoProfilePage from './pages/NgoProfilePage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import EditCampaign from './pages/EditCampaign';
import DonorLoginPage from './pages/DonorLoginPage';
import DonorSignupPage from './pages/DonorSignupPage';
import DonorDashboard from './pages/DonorDashboard';
import InfoPage from './pages/InfoPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            
            {/* NGO Authentication & Dashboard Flow */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/auth" element={<AuthSelectionPage />} />
            
            {/* Platform Features */}
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/campaigns/new" element={<CreateCampaignPage />} /> 
            <Route path="/campaign/:id" element={<CampaignDetailsPage />} />
            <Route path="/corporate" element={<CsrPage />} /> 
            <Route path="/donate/:id" element={<DonatePage />} />
            <Route path="/donor-login" element={<DonorLoginPage />} />
            <Route path="/donor-signup" element={<DonorSignupPage />} />
            <Route path="/my-impact" element={<DonorDashboard />} />
            <Route path="/about" element={<InfoPage title="Our Mission" description="HopeWorks connects verified causes with supporters through transparent, documented impact." />} />
            <Route path="/compliance" element={<InfoPage title="80G Tax Compliance" description="We help supporters and partner organizations maintain transparent receipts and compliance documentation." />} />
            <Route path="/contact" element={<InfoPage title="Contact Us" description="Reach our support team for donation, NGO onboarding, and platform questions." />} />
            <Route path="/privacy" element={<InfoPage title="Privacy Policy" description="We protect donor, NGO, and campaign data with secure handling and transparency practices." />} />
            <Route path="/terms" element={<InfoPage title="Terms of Service" description="Use of HopeWorks is governed by our platform terms and community standards." />} />
            <Route path="/ngos" element={<NgoDirectoryPage />} />
            <Route path="/ngo/:id" element={<NgoProfilePage />} />
            
            {/* Admin */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/verify-email-page" element={<VerifyEmailPage />} />
            <Route path="/campaigns/edit/:id" element={<EditCampaign />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;