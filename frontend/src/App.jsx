import React, { useEffect, useState, useRef } from 'react'; // Import useRef
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'; // Removed useNavigate as we'll use anchors
import Masonry from 'react-masonry-css';
import { motion, AnimatePresence } from 'framer-motion';
import imageCompression from 'browser-image-compression';
import './App.css';
import introBg from './assets/intro-bg.jpg';

const API_URL = 'http://localhost:5000';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Smooth scroll to gallery section
  const handleGalleryClick = (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      // Go to home, then scroll after navigation
      navigate('/', { state: { scrollToGallery: true } });
    } else {
      const gallerySection = document.getElementById('gallery-section');
      if (gallerySection) {
        gallerySection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Smooth scroll to top (intro section)
  const handleHomeClick = (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Smooth scroll to contact section
  const handleContactClick = (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollToContact: true } });
    } else {
      const contactSection = document.getElementById('contact-section');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="navbar">
      <a
        href="#home"
        className={location.pathname === '/' ? 'active' : ''}
        onClick={handleHomeClick}
        style={{ cursor: 'pointer' }}
      >
        Home
      </a>
      <a
        href="#gallery-section"
        className={location.pathname === '/' ? '' : ''}
        onClick={handleGalleryClick}
        style={{ cursor: 'pointer' }}
      >
        Gallery
      </a>
      <a
        href="#contact-section"
        className={location.pathname === '/' ? '' : ''}
        onClick={handleContactClick}
        style={{ cursor: 'pointer' }}
      >
        Contact
      </a>
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
        <h1>Vaisakh Y P</h1>
        <h2>Fine Art & Portrait Photographer</h2>
        <p>
          I'm Vaisakh Y P, a passionate fine art and portrait photographer.<br />
          Through my lens, I capture emotion, light, and storytelling in every frame.<br />
          Whether it's a quiet moment or a powerful portrait, I strive to turn each image into a lasting piece of art.
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
        let data = await response.json();
        // Sort by timestamp (newest first), fallback to filename
        data.sort((a, b) => {
          if (a.timestamp && b.timestamp) {
            return b.timestamp - a.timestamp;
          }
          // fallback: sort by filename descending
          return b.filename.localeCompare(a.filename);
        });
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
    <div className="gallery-container" id="gallery-section">
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

function VideoGallery() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/videos')
      .then(res => res.json())
      .then(data => {
        setVideos(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load videos');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading-gallery">Loading videos...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="gallery-container" id="video-gallery-section">
      <h2>Video Gallery</h2>
      <div className="aww-gallery-grid">
        {videos.map((video, idx) => (
          <div key={video.filename || idx} className="aww-gallery-item">
            <VideoHoverPlayer src={`http://localhost:5000${video.url}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

function VideoHoverPlayer({ src }) {
  const videoRef = useRef(null);
  return (
    <video
      ref={videoRef}
      src={src}
      className="aww-gallery-img"
      muted
      preload="metadata"
      poster=""
      onMouseEnter={() => videoRef.current && videoRef.current.play()}
      onMouseLeave={() => videoRef.current && videoRef.current.pause()}
      onTouchStart={() => videoRef.current && videoRef.current.play()}
      onTouchEnd={() => videoRef.current && videoRef.current.pause()}
      loop
      playsInline
      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
    />
  );
}

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSending(true);
    setResult(null);
    try {
      const res = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setResult({ success: true, message: 'Message sent successfully!' });
        setForm({ name: '', email: '', message: '' });
      } else {
        const data = await res.json();
        setResult({ success: false, message: data.error || 'Failed to send message.' });
      }
    } catch (err) {
      setResult({ success: false, message: 'Failed to send message.' });
    } finally {
      setSending(false);
    }
  };

  const whatsappLink = `https://wa.me/919656595993?text=${encodeURIComponent(
    'Hello Vaisakh, I would like to get in touch with you!'
  )}`;

  return (
    <div className="page contact-page">
      <h1>Contact Me</h1>
      <form className="contact-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <textarea
          name="message"
          placeholder="Your Message"
          value={form.message}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={sending}>
          {sending ? 'Sending...' : 'Send Message'}
        </button>
        {result && (
          <div className={result.success ? 'success' : 'error'} style={{ marginTop: '1rem' }}>
            {result.message}
          </div>
        )}
      </form>
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-btn"
          style={{
            display: 'inline-block',
            background: '#25D366',
            color: '#fff',
            padding: '0.8em 2em',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '1.1rem',
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            transition: 'background 0.2s',
          }}
        >
          Message on WhatsApp
        </a>
      </div>
    </div>
  );
}

function Upload() {
  const [activeTab, setActiveTab] = useState('images');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [results, setResults] = useState([]);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoError, setVideoError] = useState('');
  const [videoSuccess, setVideoSuccess] = useState('');
  const [videoResults, setVideoResults] = useState([]);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    setError('');
    setSuccess('');
    setResults([]);
    let allSuccess = true;
    const newResults = [];
    for (const file of files) {
      let compressedFile = file;
      try {
        compressedFile = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });
      } catch (err) {
        console.warn('Compression failed, uploading original:', err);
      }
      const formData = new FormData();
      formData.append('image', compressedFile, file.name);
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
        newResults.push({ name: file.name, status: 'success' });
      } catch (e) {
        allSuccess = false;
        newResults.push({ name: file.name, status: 'error', message: e.message });
      }
    }
    setResults(newResults);
    setUploading(false);
    setSuccess(allSuccess ? 'All images uploaded successfully!' : 'Some images failed to upload.');
  };

  const handleVideoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setVideoUploading(true);
    setVideoError('');
    setVideoSuccess('');
    setVideoResults([]);
    let allSuccess = true;
    const newResults = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append('video', file, file.name);
      try {
        const res = await fetch('http://localhost:5000/api/upload-video', {
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
        newResults.push({ name: file.name, status: 'success' });
      } catch (e) {
        allSuccess = false;
        newResults.push({ name: file.name, status: 'error', message: e.message });
      }
    }
    setVideoResults(newResults);
    setVideoUploading(false);
    setVideoSuccess(allSuccess ? 'All videos uploaded successfully!' : 'Some videos failed to upload.');
  };

  return (
    <div className="page upload-page">
      <h1>Upload Media</h1>
      <div className="upload-tabs">
        <button className={activeTab === 'images' ? 'active' : ''} onClick={() => setActiveTab('images')}>Images</button>
        <button className={activeTab === 'videos' ? 'active' : ''} onClick={() => setActiveTab('videos')}>Videos</button>
      </div>
      {activeTab === 'images' && (
        <div className="upload-section">
          <label className="upload-btn">
            {uploading ? 'Uploading...' : 'Choose Images to Upload'}
            <input type="file" accept="image/*" multiple onChange={handleUpload} disabled={uploading} hidden />
          </label>
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
          {results.length > 0 && (
            <ul style={{ margin: '1rem 0', padding: 0, listStyle: 'none', color: '#fff' }}>
              {results.map((r, i) => (
                <li key={i} style={{ color: r.status === 'success' ? '#4caf50' : '#f44336' }}>
                  {r.name}: {r.status === 'success' ? 'Uploaded' : `Error - ${r.message}`}
                </li>
              ))}
            </ul>
          )}
          <p style={{ color: '#aaa', fontSize: '0.9em' }}>
            You can select and upload multiple images at once.<br />Accepted file types: JPEG, PNG, GIF, WebP, BMP, TIFF.
          </p>
        </div>
      )}
      {activeTab === 'videos' && (
        <div className="upload-section">
          <label className="upload-btn">
            {videoUploading ? 'Uploading...' : 'Choose Videos to Upload'}
            <input type="file" accept="video/mp4,video/webm,video/quicktime" multiple onChange={handleVideoUpload} disabled={videoUploading} hidden />
          </label>
          {videoError && <div className="error">{videoError}</div>}
          {videoSuccess && <div className="success">{videoSuccess}</div>}
          {videoResults.length > 0 && (
            <ul style={{ margin: '1rem 0', padding: 0, listStyle: 'none', color: '#fff' }}>
              {videoResults.map((r, i) => (
                <li key={i} style={{ color: r.status === 'success' ? '#4caf50' : '#f44336' }}>
                  {r.name}: {r.status === 'success' ? 'Uploaded' : `Error - ${r.message}`}
                </li>
              ))}
            </ul>
          )}
          <p style={{ color: '#aaa', fontSize: '0.9em' }}>
            You can select and upload multiple videos at once.<br />Accepted file types: MP4, WebM, MOV.
          </p>
        </div>
      )}
    </div>
  );
}

// New component to combine Home and Gallery on one page
function MainPage() {
  const location = useLocation();
  useEffect(() => {
    if (location.state && location.state.scrollToGallery) {
      const gallerySection = document.getElementById('gallery-section');
      if (gallerySection) {
        setTimeout(() => {
          gallerySection.scrollIntoView({ behavior: 'smooth' });
        }, 100); // Wait for render
      }
    }
    if (location.state && location.state.scrollToContact) {
      const contactSection = document.getElementById('contact-section');
      if (contactSection) {
        setTimeout(() => {
          contactSection.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);
  return (
    <>
      <Home />
      <Gallery />
      <VideoGallery />
      <div id="contact-section">
        <Contact />
      </div>
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
        <Route path="/" element={<MainPage />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/upload" element={<Upload />} />
      </Routes>
    </div>
  );
}