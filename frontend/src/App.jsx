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