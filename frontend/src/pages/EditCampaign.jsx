import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FormInput from '../components/FormInput';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function EditCampaign() {
  const { id } = useParams(); // Get the campaign ID from the URL
  const navigate = useNavigate();
  const { loggedInNgo } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: '',
    cause: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // 1. Fetch Existing Campaign Data
  useEffect(() => {
    const fetchCampaignData = async () => {
      try {
        const response = await api.get(`/campaigns/${id}`);
        const campaign = response.data;
        
        // Populate the form with existing data
        setFormData({
          title: campaign.title || '',
          description: campaign.description || '',
          goal: campaign.goal || campaign.goalAmount || '',
          cause: campaign.cause || ''
        });

        // Set the existing image preview if one exists
        if (campaign.image || campaign.imageUrl) {
            const imgPath = campaign.image || campaign.imageUrl;
            setImagePreview(imgPath.startsWith('http') ? imgPath : `${api.defaults.baseURL.replace('/api', '')}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`);
        }

      } catch (err) {
        setError("Failed to load campaign details. Ensure the campaign exists.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (loggedInNgo) {
        fetchCampaignData();
    } else {
        navigate('/login');
    }
  }, [id, loggedInNgo, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Preview the new image instantly
    }
  };

  // 2. Submit the Updates
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    // We must use FormData because we might be sending a new file
    const submissionData = new FormData();
    submissionData.append('title', formData.title);
    submissionData.append('description', formData.description);
    submissionData.append('goal', formData.goal);
    submissionData.append('cause', formData.cause);
    
    if (imageFile) {
      submissionData.append('image', imageFile);
    }

    try {
      // Send a PUT request to update the specific campaign
      await api.put(`/campaigns/${id}`, submissionData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/dashboard'); // Go back to Creator Studio on success
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update campaign. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] text-[#0B2948] font-bold font-serif animate-pulse text-2xl">Loading Ledger Data...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-16 px-6 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100 relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#0B2948] to-[#007A78]"></div>

        <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-[#0B2948] text-sm font-bold flex items-center gap-2 mb-8 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Studio
        </button>

        <h1 className="text-3xl font-black font-serif text-[#0B2948] mb-2">Edit Micro-Project</h1>
        <p className="text-slate-500 mb-10 font-medium">Update the details of your active ledger.</p>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3 text-sm font-bold shadow-sm">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-8 items-start">
            <div className="w-32 h-32 shrink-0 bg-white rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-[#007A78] transition-colors shadow-sm">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
              ) : (
                <svg className="w-8 h-8 text-slate-400 group-hover:text-[#007A78] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <span className="bg-[#0B2948] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">Change</span>
              </div>
              <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
            <div className="flex-grow pt-2">
              <h3 className="font-bold text-[#0B2948] mb-1">Project Banner</h3>
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">Upload a high-quality 16:9 image to attract donors. Max size 5MB.</p>
              <div className="text-xs font-bold text-[#007A78] bg-emerald-50 inline-block px-3 py-1 rounded-md border border-emerald-100">Optional: Leave blank to keep current image.</div>
            </div>
          </div>

          <FormInput 
            label="Project Title" 
            name="title" 
            value={formData.title} 
            onChange={handleChange} 
            placeholder="e.g., Solar Panels for Rural School"
            required 
            disabled={isSaving}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput 
              label="Funding Goal (₹)" 
              type="number" 
              name="goal" 
              value={formData.goal} 
              onChange={handleChange} 
              placeholder="e.g., 50000"
              required 
              disabled={isSaving}
            />
            <FormInput 
              label="Primary Cause Category" 
              name="cause" 
              value={formData.cause} 
              onChange={handleChange} 
              placeholder="e.g., Education, Healthcare"
              required 
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0B2948] mb-2">Detailed Project Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="6"
              className="w-full px-5 py-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007A78] transition-all font-medium leading-relaxed resize-y disabled:opacity-50"
              placeholder="Explain the urgency, impact, and exact breakdown of how the funds will be utilized..."
              required
              disabled={isSaving}
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={isSaving} 
            className="w-full bg-[#0B2948] hover:bg-[#007A78] text-white font-black text-lg py-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isSaving ? 'Saving Ledger Updates...' : 'Publish Project Updates'}
          </button>
        </form>
      </div>
    </div>
  );
}