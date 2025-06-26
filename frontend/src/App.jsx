import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import Masonry from 'react-masonry-css';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const API_URL = 'http://localhost:5000';

function Navbar() {
  const location = useLocation();
  return (
    <nav className="navbar">
      <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
      <Link to="/gallery" className={location.pathname === '/gallery' ? 'active' : ''}>Gallery</Link>
      <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Contact</Link>
    </nav>
  );
}

function Home() {
  return (
    <div className="hero-section">
      <div className="hero-content">
        <h1>Alex Novo</h1>
        <h2>Fine Art & Portrait Photographer</h2>
        <p>
          Capturing the world in light and color.<br />
          Explore my portfolio below.
        </p>
      </div>
    </div>
  );
}

function Gallery() {
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/images`)
      .then(res => res.json())
      .then(setImages)
      .catch(() => setError('Failed to load images'));
  }, []);

  const breakpointColumnsObj = {
    default: 3,
    1100: 2,
    700: 1
  };

  return (
    <div className="page gallery-page">
      <h1>My Photography Gallery</h1>
      {error && <div className="error">{error}</div>}
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="masonry-grid"
        columnClassName="masonry-grid_column"
      >
        {images.map((img, idx) => (
          <motion.div
            key={img.filename}
            className="masonry-item"
            whileHover={{ scale: 1.03, boxShadow: '0 8px 32px #000c' }}
            onClick={() => setSelected(img)}
          >
            <img src={`${API_URL}${img.url}`} alt="gallery" className="masonry-img" />
          </motion.div>
        ))}
      </Masonry>
      <AnimatePresence>
        {selected && (
          <motion.div
            className="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.img
              src={`${API_URL}${selected.url}`}
              alt="large"
              className="modal-img"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Contact() {
  return (
    <div className="page contact-page">
      <h1>Contact</h1>
      <p>
        <b>Email:</b> example@yourdomain.com<br/>
        <b>Phone:</b> +1 (555) 123-4567<br/>
        <b>Instagram:</b> @yourhandle
      </p>
      <p style={{color:'#888', fontSize:'0.9em'}}>This is dummy contact info. Replace with your real details later.</p>
    </div>
  );
}

function Upload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

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
      if (!res.ok) throw new Error('Upload failed');
      setSuccess('Upload successful!');
      setTimeout(() => navigate('/gallery'), 1200);
    } catch {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page upload-page">
      <h1>Upload Image</h1>
      <Link to="/gallery" className="upload-link">Back to Gallery</Link>
      <div className="upload-section">
        <label className="upload-btn">
          {uploading ? 'Uploading...' : 'Choose Image'}
          <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} hidden />
        </label>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="fullscreen-bg">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/upload" element={<Upload />} />
      </Routes>
    </div>
  );
}
