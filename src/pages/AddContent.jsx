import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import { compressImage } from '../utils/compressImage';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { supabase } from '../supabaseClient';
import { ArrowLeft, Upload, Check, Loader, X } from 'lucide-react';

const AddContent = () => {
  useDocumentTitle('Add Content');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('BIAB');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);
  
  const { fetchContent } = useContent();
  const navigate = useNavigate();

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setUploading(true);
        // Display local preview first
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
        
        // Keep the original file for Supabase upload
        setImageFile(file);
        setUploading(false);
      } catch (err) {
        console.error('Error selecting image:', err);
        setUploading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      alert('Upload eerst een foto!');
      return;
    }

    setUploading(true);

    try {
      // 1. Compress image before upload
      const compressedDataUrl = await compressImage(imageFile, 1200, 1200, 0.8);
      
      // Convert Data URL to Blob for Supabase upload
      const res = await fetch(compressedDataUrl);
      const blob = await res.blob();
      
      const fileName = `${Date.now()}-${imageFile.name}`;
      const filePath = `uploads/${fileName}`;

      // 2. Upload to Supabase Storage (Bucket: 'photos')
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      // 3. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      // 4. Save to Database
      const { error: dbError } = await supabase
        .from('content')
        .insert([{
          image_url: publicUrl,
          caption: caption,
          category: category
        }]);

      if (dbError) throw dbError;

      // 5. Success
      await fetchContent();
      setSuccess(true);
      setTimeout(() => navigate('/admin/dashboard'), 1500);

    } catch (err) {
      console.error('Full upload error:', err);
      alert('Er is een fout opgetreden bij het uploaden. Controleer of je de "photos" bucket hebt aangemaakt en ingesteld op "Public" in Supabase.');
    } finally {
      setUploading(false);
    }
  };

  const categories = ['BIAB', 'Pedicure', 'Gel Overlay', 'Fullset', 'Nail Art', 'Verlenging'];

  return (
    <div className="container py-5 mt-5 fade-in">
      <Link to="/admin/dashboard" style={{ display: 'flex', alignItems: 'center', color: 'var(--dark-text)', textDecoration: 'none', marginBottom: '30px' }}>
        <ArrowLeft size={18} style={{ marginRight: '8px' }} />
        Terug naar Dashboard
      </Link>

      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="glass-panel" style={{ padding: '40px' }}>
            <h2 className="mb-4 text-gold">Nieuwe Content Toevoegen (LIVE)</h2>
            <p className="text-muted mb-4">Upload een nieuwe foto naar Supabase. Deze verschijnt direct voor alle bezoekers.</p>

            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-4">
                  <div 
                    onClick={() => fileInputRef.current.click()}
                    style={{ 
                      width: '100%', 
                      aspectRatio: '1/1', 
                      border: '2px dashed var(--gold)', 
                      borderRadius: '20px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      cursor: 'pointer',
                      overflow: 'hidden',
                      position: 'relative',
                      backgroundColor: '#fff'
                    }}
                  >
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {!uploading && (
                          <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(''); }}>
                            <X size={16} />
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '20px' }}>
                        <Upload size={40} style={{ color: 'var(--gold)', marginBottom: '15px' }} />
                        <p style={{ fontWeight: '600' }}>Klik om een foto te uploaden</p>
                        <p className="text-muted" style={{ fontSize: '0.85rem' }}>PNG, JPG of WEBP (Max 10MB)</p>
                      </div>
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                    accept="image/*" 
                    style={{ display: 'none' }}
                  />
                </div>

                <div className="col-md-6">
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>Bijschrift (Caption)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Beschrijf je werk..." 
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '12px 20px', 
                        borderRadius: '12px', 
                        border: '1px solid #ddd',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '30px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>Categorie</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '12px 20px', 
                        borderRadius: '12px', 
                        border: '1px solid #ddd',
                        outline: 'none',
                        backgroundColor: 'white'
                      }}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    className="btn-gold" 
                    style={{ width: '100%', height: '55px' }}
                    disabled={uploading || success}
                  >
                    {uploading ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Loader className="spin" size={20} style={{ marginRight: '10px' }} /> Uploaden...
                      </div>
                    ) : success ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={20} style={{ marginRight: '8px' }} /> Live op de site!
                      </div>
                    ) : (
                      'Opslaan & LIVE Publiceren'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default AddContent;
