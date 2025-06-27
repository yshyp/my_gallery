const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 5000;

// Ensure directories exist
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const OPTIMIZED_DIR = path.join(__dirname, 'uploads', 'optimized');
const THUMBNAILS_DIR = path.join(__dirname, 'uploads', 'thumbnails');

[UPLOADS_DIR, OPTIMIZED_DIR, THUMBNAILS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Multer setup for original uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${timestamp}-${name}${ext}`);
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'), false);
    }
  }
});

app.use(cors());
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/optimized', express.static(OPTIMIZED_DIR));
app.use('/thumbnails', express.static(THUMBNAILS_DIR));

// Image optimization function
async function optimizeImage(originalPath, filename) {
  try {
    const ext = path.extname(filename).toLowerCase();
    const nameWithoutExt = path.basename(filename, ext);
    
    // Create optimized version (max 1920px width, 80% quality)
    const optimizedFilename = `${nameWithoutExt}-optimized${ext}`;
    const optimizedPath = path.join(OPTIMIZED_DIR, optimizedFilename);
    
    await sharp(originalPath)
      .resize(1920, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({ quality: 80, progressive: true })
      .toFile(optimizedPath);
    
    // Create thumbnail (400px width)
    const thumbnailFilename = `${nameWithoutExt}-thumb${ext}`;
    const thumbnailPath = path.join(THUMBNAILS_DIR, thumbnailFilename);
    
    await sharp(originalPath)
      .resize(400, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({ quality: 70, progressive: true })
      .toFile(thumbnailPath);
    
    return {
      original: filename,
      optimized: optimizedFilename,
      thumbnail: thumbnailFilename
    };
  } catch (error) {
    console.error('Image optimization failed:', error);
    return {
      original: filename,
      optimized: filename,
      thumbnail: filename
    };
  }
}

// Upload endpoint with optimization
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Optimize the uploaded image
    const optimized = await optimizeImage(req.file.path, req.file.filename);
    
    res.json({
      filename: req.file.filename,
      optimized: optimized.optimized,
      thumbnail: optimized.thumbnail,
      originalUrl: `/uploads/${req.file.filename}`,
      optimizedUrl: `/optimized/${optimized.optimized}`,
      thumbnailUrl: `/thumbnails/${optimized.thumbnail}`,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed: ' + error.message });
  }
});

// List images endpoint with optimization info
app.get('/api/images', (req, res) => {
  fs.readdir(UPLOADS_DIR, async (err, files) => {
    if (err) return res.status(500).json({ error: 'Failed to list images' });
    
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      // Only include originals, not optimized or thumbnails
      return (
        ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'].includes(ext) &&
        !file.includes('-optimized') &&
        !file.includes('-thumb')
      );
    });

    const images = imageFiles.map(filename => {
      const ext = path.extname(filename);
      const nameWithoutExt = path.basename(filename, ext);
      
      return {
        filename,
        originalUrl: `/uploads/${filename}`,
        optimizedUrl: `/optimized/${nameWithoutExt}-optimized${ext}`,
        thumbnailUrl: `/thumbnails/${nameWithoutExt}-thumb${ext}`,
        timestamp: parseInt(filename.split('-')[0])
      };
    });

    // Sort by timestamp (newest first)
    images.sort((a, b) => b.timestamp - a.timestamp);
    
    res.json(images);
  });
});

// Get image info endpoint
app.get('/api/image/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(UPLOADS_DIR, filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Image not found' });
  }
  
  const stats = fs.statSync(filePath);
  const ext = path.extname(filename);
  const nameWithoutExt = path.basename(filename, ext);
  
  res.json({
    filename,
    size: stats.size,
    originalUrl: `/uploads/${filename}`,
    optimizedUrl: `/optimized/${nameWithoutExt}-optimized${ext}`,
    thumbnailUrl: `/thumbnails/${nameWithoutExt}-thumb${ext}`,
    uploadedAt: stats.mtime
  });
});

// Cleanup old files (optional)
app.delete('/api/image/:filename', (req, res) => {
  const filename = req.params.filename;
  const ext = path.extname(filename);
  const nameWithoutExt = path.basename(filename, ext);
  
  const filesToDelete = [
    path.join(UPLOADS_DIR, filename),
    path.join(OPTIMIZED_DIR, `${nameWithoutExt}-optimized${ext}`),
    path.join(THUMBNAILS_DIR, `${nameWithoutExt}-thumb${ext}`)
  ];
  
  let deletedCount = 0;
  filesToDelete.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      deletedCount++;
    }
  });
  
  res.json({ message: `Deleted ${deletedCount} files` });
});

// Contact form endpoint
app.post('/api/contact', express.json(), async (req, res) => {
  console.log('Received contact form submission');
  const { name, email, message } = req.body;
  console.log('Form data:', { name, email, message });
  if (!name || !email || !message) {
    console.log('Missing fields in contact form');
    return res.status(400).json({ error: 'All fields are required.' });
  }
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ysakhyp@gmail.com',
        pass: 'ahnq pguq agrj qcve',
      },
    });
    await transporter.sendMail({
      from: 'ysakhyp@gmail.com',
      to: 'ysakhyp@gmail.com', // Changed to your Gmail
      subject: `New Contact Form Submission from ${name} (${email})`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}\n\n---\nReply to: ${email}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Form Submission</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #007bff;">${email}</a></p>
            <p><strong>Message:</strong></p>
            <div style="background: white; padding: 15px; border-left: 4px solid #007bff; margin: 10px 0;">
              ${message.replace(/\n/g, '<br/>')}
            </div>
          </div>
          <div style="background: #e9ecef; padding: 15px; border-radius: 5px; text-align: center;">
            <p style="margin: 0; color: #495057;">
              <strong>Reply to:</strong> <a href="mailto:${email}" style="color: #007bff; text-decoration: none;">${email}</a>
            </p>
          </div>
        </div>
      `
    });
    console.log('Email sent successfully');
    res.json({ success: true });
  } catch (err) {
    console.error('Contact form error:', err);
    res.status(500).json({ error: 'Failed to send email.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Uploads: ${UPLOADS_DIR}`);
  console.log(`Optimized: ${OPTIMIZED_DIR}`);
  console.log(`Thumbnails: ${THUMBNAILS_DIR}`);
}); 