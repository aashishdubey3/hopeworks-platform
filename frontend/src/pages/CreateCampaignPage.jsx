import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import api from '../utils/api';

// --- NATIVE CANVAS CROP UTILITY ---
// This takes the area the user selected and generates a fresh, cropped image file
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return;
      // Convert Blob to File so Multer can read it perfectly
      const file = new File([blob], 'cropped-campaign-cover.jpg', { type: 'image/jpeg' });
      resolve({ file, url: URL.createObjectURL(blob) });
    }, 'image/jpeg');
  });
}

// --- MAIN COMPONENT ---
export default function CreateCampaignPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({ title: '', cause: '', goal: '', description: '' });
  
  // Image & Crop States
  const [rawImage, setRawImage] = useState(null); // The original uploaded file
  const [finalImage, setFinalImage] = useState(null); // The cropped file ready for backend
  const [preview, setPreview] = useState(null); // What the user sees on the form
  
  // Cropper UI States
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleTextChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // 1. User selects a file -> Open Cropper Modal
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRawImage(URL.createObjectURL(file));
      setShowCropper(true);
    }
  };

  // 2. Tracks the exact pixels the user is highlighting
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // 3. User clicks "Confirm Crop"
  const handleCropSave = async () => {
    try {
      // Run our canvas utility
      const { file, url } = await getCroppedImg(rawImage, croppedAreaPixels);
      setFinalImage(file); // Save for backend
      setPreview(url);     // Show on UI
      setShowCropper(false); // Close Modal
    } catch (e) {
      console.error(e);
      setError("Failed to crop image.");
    }
  };

  // 4. Submit to Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const uploadData = new FormData();
    uploadData.append('title', formData.title);
    uploadData.append('cause', formData.cause);
    uploadData.append('goal', formData.goal);
    uploadData.append('description', formData.description);
    if (finalImage) uploadData.append('image', finalImage); // Sending the CROPPED file!

    try {
      await api.post('/campaigns', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      navigate('/dashboard'); // Success! Send them to dashboard.
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish campaign.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 animate-fade-in relative">
      
      {/* --- THE GOD-LEVEL CROPPER MODAL --- */}
      {showCropper && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B2948]/90 backdrop-blur-sm px-4">
          <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col animate-fade-in">
            <h3 className="text-2xl font-black text-[#0B2948] mb-2 font-serif">Adjust Cover Photo</h3>
            <p className="text-slate-500 text-sm mb-6">Drag to move, use the slider to zoom. This ensures your project looks perfect on the homepage.</p>
            
            {/* The Interactive Cropper */}
            <div className="relative w-full h-80 bg-slate-900 rounded-2xl overflow-hidden mb-6">
              <Cropper
                image={rawImage}
                crop={crop}
                zoom={zoom}
                aspect={16 / 9} // Forces perfect widescreen ratio!
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            {/* Zoom Slider */}
            <div className="flex items-center gap-4 mb-8 px-2">
              <span className="text-slate-400 font-bold text-sm">Zoom</span>
              <input 
                type="range" 
                value={zoom} 
                min={1} 
                max={3} 
                step={0.1} 
                onChange={(e) => setZoom(Number(e.target.value))} 
                className="w-full accent-[#007A78]" 
              />
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-4">
              <button type="button" onClick={() => setShowCropper(false)} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
                Cancel
              </button>
              <button type="button" onClick={handleCropSave} className="px-8 py-3 bg-[#007A78] text-white font-bold rounded-xl shadow-lg hover:bg-[#006A68] transition-colors transform hover:-translate-y-0.5">
                Confirm & Crop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- STANDARD FORM UI --- */}
      <div className="mb-10">
        <h1 className="text-4xl font-serif font-black text-[#0B2948] mb-2">Launch Micro-Project</h1>
        <p className="text-slate-500 font-medium">Create a fully transparent, trackable funding ledger.</p>
      </div>

      {error && <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 font-bold mb-8 rounded-r-md">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12 relative z-10">
        
        {/* Image Upload Area */}
        <div className="mb-10">
          <label className="block text-sm font-bold text-[#0B2948] mb-3 uppercase tracking-wider">Campaign Cover Photo</label>
          <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group overflow-hidden">
            
            {/* If we have a final cropped preview, show it! */}
            {preview ? (
              <>
                <img src={preview} alt="Cropped Preview" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-[#0B2948]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-white text-[#0B2948] px-6 py-3 rounded-full font-bold shadow-lg">Change Photo</span>
                </div>
                <input type="file" accept="image/*" onChange={handleImageSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              </>
            ) : (
              <>
                <input type="file" accept="image/*" onChange={handleImageSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className="text-center">
                  <svg className="w-12 h-12 text-slate-400 mx-auto mb-3 group-hover:text-[#007A78] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  <p className="text-sm font-bold text-slate-500">Drag and drop or click to select</p>
                  <p className="text-xs text-slate-400 mt-1">You will be able to crop it in the next step</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Input Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <label className="block text-sm font-bold text-[#0B2948] mb-2">Project Title</label>
            <input type="text" name="title" required value={formData.title} onChange={handleTextChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#007A78] focus:bg-white transition-all font-medium" placeholder="e.g., 50 Desks for Rural School" />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#0B2948] mb-2">Primary Cause</label>
            <input type="text" name="cause" required value={formData.cause} onChange={handleTextChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#007A78] focus:bg-white transition-all font-medium" placeholder="e.g., Education" />
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-bold text-[#0B2948] mb-2">Financial Goal (₹)</label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-slate-400 font-bold">₹</span>
            <input type="number" name="goal" required min="1000" value={formData.goal} onChange={handleTextChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#007A78] focus:bg-white transition-all font-medium" placeholder="50000" />
          </div>
        </div>

        <div className="mb-10">
          <label className="block text-sm font-bold text-[#0B2948] mb-2">Detailed Ledger Description</label>
          <textarea name="description" required rows="5" value={formData.description} onChange={handleTextChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#007A78] focus:bg-white transition-all font-medium" placeholder="Describe exactly how these funds will be deployed..."></textarea>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-[#0B2948] hover:bg-[#007A78] text-white font-black text-lg py-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-70">
          {loading ? 'Processing & Uploading to Cloudinary...' : 'Publish Micro-Project'}
        </button>
      </form>
    </div>
  );
}