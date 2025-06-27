import React, { useEffect, useState, useRef } from 'react'; // Import useRef
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'; // Removed useNavigate as we'll use anchors
import Masonry from 'react-masonry-css';
import { motion, AnimatePresence } from 'framer-motion';
import imageCompression from 'browser-image-compression';
import './App.css';
import introBg from './assets/intro-bg.jpg';
import introBgIco from './assets/intro-bg.ico';
import instaProfileQR from './assets/Insta Profile.jpg';
import instaPageQR from './assets/Insta Page.jpg';
import youtubeQR from './assets/Youtube.jpg';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

console.log('API_URL:', API_URL);

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

// InstallPrompt component - DISABLED to prevent mobile install prompts
/*
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
*/

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
      console.log('Fetching images from:', `${API_URL}/api/images`);
      const response = await fetch(`${API_URL}/api/images`);
      if (response.ok) {
        let data = await response.json();
        // Sort by timestamp (newest first), fallback to filename
        // data.sort((a, b) => {
        //   if (a.timestamp && b.timestamp) {
        //     return b.timestamp - a.timestamp;
        //   }
        //   // fallback: sort by filename descending
        //   return b.filename.localeCompare(a.filename);
        // });
        console.log('Data:', data);
        setImages(data);
      } else {
        setError('Failed to load images');
      }
    } catch (error) {
      console.error('Fetch error:', error);
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
              src={`${API_URL}${img.thumbnailUrl}`}
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
              src={`${API_URL}${images[selectedIdx].optimizedUrl}`}
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
  const [videoModal, setVideoModal] = useState({ open: false, src: null });

  useEffect(() => {
    fetch(`${API_URL}/api/videos`)
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
          <div key={video.filename || idx} className="aww-gallery-item" onClick={() => setVideoModal({ open: true, src: `${API_URL}${video.url}` })}>
            <VideoHoverPlayer src={`${API_URL}${video.url}`} />
          </div>
        ))}
      </div>
      {videoModal.open && (
        <div className="qr-modal-overlay" onClick={() => setVideoModal({ open: false, src: null })}>
          <div className="qr-modal-content" onClick={e => e.stopPropagation()}>
            <button className="qr-modal-close" onClick={() => setVideoModal({ open: false, src: null })}>&times;</button>
            <video
              src={videoModal.src}
              className="qr-modal-img"
              controls
              autoPlay
              style={{ background: '#000', borderRadius: '12px', maxHeight: '70vh', width: '100%', maxWidth: '600px' }}
            />
          </div>
        </div>
      )}
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
  const [qrModal, setQrModal] = useState({ open: false, img: null, caption: '', link: '', linkText: '' });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSending(true);
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setResult({ success: true, message: 'Message sent successfully! 📸' });
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
    'Hello Vaisakh! I saw your amazing photography portfolio and would love to connect! 📸✨'
  )}`;

  return (
    <div className="page contact-page">
      <div className="contact-header">
        <h1>Let's Create Magic Together! ✨</h1>
        <p className="contact-subtitle">
          Ready to turn your moments into timeless art? Whether you want to chat about photography, 
          book a session, or just share your favorite memes, I'm all ears! 🎭
        </p>
      </div>

      <div className="contact-content">
        <div className="contact-info-section">
          <h2>📞 Get In Touch</h2>
          <div className="contact-details">
            <div className="contact-item">
              <span className="contact-icon">👤</span>
              <div>
                <strong>Vaisakh Y P</strong>
                <span>Your friendly neighborhood photographer</span>
              </div>
            </div>
            
            <div className="contact-item">
              <span className="contact-icon">📧</span>
              <div>
                <strong>Email</strong>
                <a href="mailto:ysakhyp@live.in">ysakhyp@live.in</a>
              </div>
            </div>
            
            <div className="contact-item">
              <span className="contact-icon">📱</span>
              <div>
                <strong>Phone</strong>
                <a href="tel:+918893706307">+91 88937 06307</a>
                <a href="tel:+919656595993">+91 96565 95993</a>
              </div>
            </div>
          </div>

          <div className="social-links">
            <h3>🌐 Follow My Adventures</h3>
            <div className="social-grid">
              <a 
                href="https://www.instagram.com/frames_by_ysh/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link instagram"
              >
                <span className="social-icon">📸</span>
                <span>Frames by YSH</span>
              </a>
              
              <a 
                href="https://www.instagram.com/ysakhyp/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link instagram"
              >
                <span className="social-icon">👤</span>
                <span>Personal Profile</span>
              </a>
              
              <a 
                href="https://www.facebook.com/vaisakh.yp" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link facebook"
              >
                <span className="social-icon">📘</span>
                <span>Facebook</span>
              </a>
              
              <a 
                href="https://www.youtube.com/@framesandvisualsbyYsh" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link youtube"
              >
                <span className="social-icon">📺</span>
                <span>YouTube</span>
              </a>
            </div>
            <div className="qr-section">
              <div className="qr-grid">
                <div className="qr-item">
                  <img src={instaProfileQR} alt="Instagram Personal Profile QR" className="qr-image" onClick={() => setQrModal({ open: true, img: instaProfileQR, caption: 'Insta Profile', link: 'https://www.instagram.com/ysakhyp/', linkText: '@ysakhyp' })} />
                  <div className="qr-caption">
                    <span>Insta Profile</span><br />
                    <a href="https://www.instagram.com/ysakhyp/" target="_blank" rel="noopener noreferrer">@ysakhyp</a>
                  </div>
                </div>
                <div className="qr-item">
                  <img src={instaPageQR} alt="Instagram Page QR" className="qr-image" onClick={() => setQrModal({ open: true, img: instaPageQR, caption: 'Insta Page', link: 'https://www.instagram.com/frames_by_ysh/', linkText: '@frames_by_ysh' })} />
                  <div className="qr-caption">
                    <span>Insta Page</span><br />
                    <a href="https://www.instagram.com/frames_by_ysh/" target="_blank" rel="noopener noreferrer">@frames_by_ysh</a>
                  </div>
                </div>
                <div className="qr-item">
                  <img src={youtubeQR} alt="YouTube Channel QR" className="qr-image" onClick={() => setQrModal({ open: true, img: youtubeQR, caption: 'YouTube', link: 'https://www.youtube.com/@framesandvisualsbyYsh', linkText: 'framesandvisualsbyYsh' })} />
                  <div className="qr-caption">
                    <span>YouTube</span><br />
                    <a href="https://www.youtube.com/@framesandvisualsbyYsh" target="_blank" rel="noopener noreferrer">framesandvisualsbyYsh</a>
                  </div>
                </div>
              </div>
              <div className="qr-note">Scan any QR to connect instantly!</div>
            </div>
          </div>
        </div>

        <div className="contact-form-section">
          <h2>💌 Send Me a Message</h2>
          <p className="form-subtitle">
            Have a project in mind? Want to collaborate? Or just want to say hi? 
            Drop me a line and let's make something beautiful together! 🎨
          </p>
          
          <form className="contact-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Your Awesome Name ✨"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email Address 📧"
              value={form.email}
              onChange={handleChange}
              required
            />
            <textarea
              name="message"
              placeholder="Tell me about your vision, project, or just share a joke! 😄"
              value={form.message}
              onChange={handleChange}
              required
              rows="5"
            />
            <button type="submit" disabled={sending} className="submit-btn">
              {sending ? '📤 Sending...' : '🚀 Send Message'}
            </button>
            {result && (
              <div className={`result-message ${result.success ? 'success' : 'error'}`}>
                {result.message}
              </div>
            )}
          </form>

          <div className="whatsapp-section">
            <p>💬 Prefer instant messaging?</p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-btn"
            >
              📱 Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="contact-footer">
        <p>🎭 Available for: Portraits • Events • Commercial • Creative Projects • Coffee Chats ☕</p>
        <p>📍 Based in Kerala, India • Available Worldwide 🌍</p>
      </div>
      {qrModal.open && (
        <div className="qr-modal-overlay" onClick={() => setQrModal({ ...qrModal, open: false })}>
          <div className="qr-modal-content" onClick={e => e.stopPropagation()}>
            <button className="qr-modal-close" onClick={() => setQrModal({ ...qrModal, open: false })}>&times;</button>
            <img src={qrModal.img} alt={qrModal.caption} className="qr-modal-img" />
            <div className="qr-modal-caption">
              <span>{qrModal.caption}</span><br />
              <a href={qrModal.link} target="_blank" rel="noopener noreferrer">{qrModal.linkText}</a>
            </div>
          </div>
        </div>
      )}
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
        const res = await fetch(`${API_URL}/api/upload-video`, {
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading time for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 seconds loading time

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <InitialLoader />;
  }

  return (
    <div className="fullscreen-bg">
      <OfflineIndicator />
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

// Enhanced Initial Loader Component
function InitialLoader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15 + 5; // Random progress increments
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="initial-loader-overlay">
      <div className="initial-loader-content">
        <div className="loader-logo">
          <div className="camera-icon">
            <div className="camera-body"></div>
            <div className="camera-lens"></div>
            <div className="camera-flash"></div>
          </div>
        </div>
        
        <h1 className="loader-title">Vaisakh Y P</h1>
        <p className="loader-subtitle">Fine Art & Portrait Photography</p>
        
        <div className="loader-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
          <span className="progress-text">{Math.round(progress)}%</span>
        </div>
        
        <div className="loader-dots">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>
    </div>
  );
}