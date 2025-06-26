import React, { useEffect, useState, useRef } from 'react'; // Import useRef
import { Routes, Route, Link, useLocation } from 'react-router-dom'; // Removed useNavigate as we'll use anchors
import Masonry from 'react-masonry-css';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const API_URL = 'http://localhost:5000';

function Navbar() {
  const location = useLocation();

  const scrollToGallery = () => {
    const gallerySection = document.getElementById('gallery-section');
    if (gallerySection) {
      gallerySection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
      <Link to="/gallery" className={location.pathname === '/gallery' ? 'active' : ''}>Gallery</Link>
      <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Contact</Link>
    </nav>
  );
}

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallButton(false);
    }
  };

  if (!showInstallButton) return null;

  return (
    <div className="install-prompt">
      <button onClick={handleInstallClick} className="install-button">
        📱 Install App
      </button>
    </div>
  );
}

function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="offline-indicator">
      📶 You're offline - Some features may be limited
    </div>
  );
}

function Home() {
  return (
    <div className="hero-section">
      <div className="hero-content">
        <h1>Alex Novo</h1>
        <h2>Fine Art & Portrait Photographer</h2>
        <p>
          Capturing moments, creating art. <br />
          Explore my curated collection of works.
        </p>
      </div>
    </div>
  );
}

// NOVO Loader Component
function NovoLoader() {
  return (
    <div className="novo-loader-overlay">
      <div className="novo-loader"></div>
    </div>
  );
}

// Gallery Component with Optimized Images
function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/images`);
      if (response.ok) {
        const data = await response.json();
        setImages(data);
      } else {
        setError('Failed to load images');
      }
    } catch (error) {
      setError('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (idx) => setSelectedIdx(idx);
  const closeModal = () => setSelectedIdx(null);
  const showPrev = () => setSelectedIdx(idx => (idx > 0 ? idx - 1 : images.length - 1));
  const showNext = () => setSelectedIdx(idx => (idx < images.length - 1 ? idx + 1 : 0));

  if (loading) return <div className="loading-gallery">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="gallery-container">
      <h2>Photo Gallery</h2>
      <div className="aww-gallery-grid">
        {images.map((img, idx) => (
          <div key={img.filename || idx} className="aww-gallery-item" onClick={() => openModal(idx)}>
            <img
              src={`${API_URL}/uploads/${img.filename}`}
              alt={`gallery-item-${idx}`}
              className="aww-gallery-img"
              loading="lazy"
            />
            <div className="aww-gallery-overlay">
              <div className="aww-gallery-title">{img.filename}</div>
            </div>
          </div>
        ))}
      </div>
      {selectedIdx !== null && images[selectedIdx] && (
        <div className="simple-modal" onClick={closeModal}>
          <div className="simple-modal-content" onClick={e => e.stopPropagation()}>
            <img
              src={`${API_URL}/uploads/${images[selectedIdx].filename}`}
              alt="full-size"
              className="simple-modal-img"
            />
            <button className="simple-modal-close" onClick={closeModal}>×</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Contact() {
  return (
    <div className="page contact-page">
      <h1>Contact Me</h1>
      <p>
        <b>Email:</b> info@alexnovo.com<br/>
        <b>Phone:</b> +1 (555) 987-6543<br/>
        <b>Instagram:</b> @alexnovophoto
      </p>
      <p style={{color:'#aaa', fontSize:'0.9em', marginTop: '1.5rem'}}>
        This is dummy contact info. Please replace it with your real details for a live site.
      </p>
    </div>
  );
}

function Upload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    setSuccess('');
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        let errorMessage = 'Upload failed';
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }
      setSuccess('Upload successful! Images will appear in the gallery.');
    } catch (e) {
      setError(`Upload failed: ${e.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page upload-page">
      <h1>Upload Image</h1>
      <Link to="/" className="upload-link">Back to Home/Gallery</Link>
      <div className="upload-section">
        <label className="upload-btn">
          {uploading ? 'Uploading...' : 'Choose Image to Upload'}
          <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} hidden />
        </label>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        <p style={{color:'#aaa', fontSize:'0.9em'}}>
          Accepted file types: JPEG, PNG, GIF, WebP, BMP, TIFF.
        </p>
      </div>
    </div>
  );
}

// New component to combine Home and Gallery on one page
function MainPage() {
  return (
    <>
      <Home />
      <Gallery />
    </>
  );
}

export default function App() {
  return (
    <div className="fullscreen-bg">
      <OfflineIndicator />
      <InstallPrompt />
      <Navbar />
      <Routes>
        <Route path="/" element={<MainPage />} /> {/* Render MainPage on the root */}
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/upload" element={<Upload />} />
      </Routes>
    </div>
  );
}