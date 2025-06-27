require('dotenv').config();
const express    = require('express');
const multer     = require('multer');
const cors       = require('cors');
const fs         = require('fs');
const path       = require('path');
const sharp      = require('sharp');
const nodemailer = require('nodemailer');

const app  = express();
const PORT = process.env.PORT || 5000;

/*────────────────── Directories ──────────────────*/
const UPLOADS_DIR    = path.join(__dirname, 'uploads');
const OPTIMIZED_DIR  = path.join(UPLOADS_DIR, 'optimized');
const THUMBNAILS_DIR = path.join(UPLOADS_DIR, 'thumbnails');
const VIDEOS_DIR     = path.join(UPLOADS_DIR, 'videos');

[UPLOADS_DIR, OPTIMIZED_DIR, THUMBNAILS_DIR, VIDEOS_DIR].forEach(d =>
  fs.mkdirSync(d, { recursive: true })
);

/*────────────────── Middleware ──────────────────*/
app.use(cors());
app.use(express.json());
app.use('/uploads',    express.static(UPLOADS_DIR));
app.use('/optimized',  express.static(OPTIMIZED_DIR));
app.use('/thumbnails', express.static(THUMBNAILS_DIR));
app.use('/videos',     express.static(VIDEOS_DIR));

/*────────────────── Multer Configs ──────────────────*/
const imageStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOADS_DIR),
  filename   : (_, file, cb) => {
    const ts   = Date.now();
    const ext  = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${ts}-${base}${ext}`);
  }
});
const uploadImage = multer({
  storage : imageStorage,
  limits  : { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_, file, cb) =>
    cb(
      null,
      ['image/jpeg','image/png','image/gif','image/webp','image/bmp','image/tiff']
        .includes(file.mimetype)
    )
});

const videoStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, VIDEOS_DIR),
  filename   : (_, file, cb) => {
    const ts   = Date.now();
    const ext  = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${ts}-${base}${ext}`);
  }
});
const uploadVideo = multer({
  storage : videoStorage,
  limits  : { fileSize: 200 * 1024 * 1024 },
  fileFilter: (_, file, cb) =>
    cb(null, ['video/mp4','video/webm','video/quicktime'].includes(file.mimetype))
});

/*────────────────── Helpers ──────────────────*/
async function optimizeImage(srcPath, filename) {
  const ext  = path.extname(filename).toLowerCase();
  const base = path.basename(filename, ext);
  const opt  = `${base}-optimized${ext}`;
  const thb  = `${base}-thumb${ext}`;

  try {
    await sharp(srcPath)
      .resize({ width: 1920, withoutEnlargement: true })
      .jpeg({ quality: 80, progressive: true })
      .toFile(path.join(OPTIMIZED_DIR, opt));

    await sharp(srcPath)
      .resize({ width: 400, withoutEnlargement: true })
      .jpeg({ quality: 70, progressive: true })
      .toFile(path.join(THUMBNAILS_DIR, thb));
  } catch (e) {
    console.error('Image optimisation error:', e);
  }
  return { opt, thb };
}

/*────────────────── API ROUTES  (MUST COME BEFORE SPA FALLBACK) ──────────────────*/

// Upload Image
app.post('/api/upload', uploadImage.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const { opt, thb } = await optimizeImage(req.file.path, req.file.filename);

  res.json({
    filename     : req.file.filename,
    originalUrl  : `/uploads/${req.file.filename}`,
    optimizedUrl : `/optimized/${opt}`,
    thumbnailUrl : `/thumbnails/${thb}`,
    size         : req.file.size
  });
});

// List Images
app.get('/api/images', (_, res) => {
  fs.readdir(UPLOADS_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: 'Failed to list images' });

    const images = files
      .filter(f => /\.(jpe?g|png|gif|webp|bmp|tiff)$/i.test(f) &&
                   !f.includes('-optimized') && !f.includes('-thumb'))
      .map(f => {
        const [ts] = f.split('-');
        const ext  = path.extname(f);
        const base = path.basename(f, ext);
        return {
          filename     : f,
          originalUrl  : `/uploads/${f}`,
          optimizedUrl : `/optimized/${base}-optimized${ext}`,
          thumbnailUrl : `/thumbnails/${base}-thumb${ext}`,
          timestamp    : Number(ts)
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp);

    res.json(images);
  });
});

// Upload Video
app.post('/api/upload-video', (req, res) => {
  uploadVideo.single('video')(req, res, err => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No video uploaded' });

    res.json({
      filename : req.file.filename,
      url      : `/videos/${req.file.filename}`,
      size     : req.file.size
    });
  });
});

// List Videos
app.get('/api/videos', (_, res) => {
  fs.readdir(VIDEOS_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: 'Failed to list videos' });

    const vids = files
      .filter(f => /\.(mp4|webm|mov)$/i.test(f))
      .map(f => ({ filename: f, url: `/videos/${f}` }))
      .reverse();

    res.json(vids);
  });
});

// Contact
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message)
    return res.status(400).json({ error: 'All fields are required' });

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    await transporter.sendMail({
      from   : process.env.EMAIL_USER,
      to     : process.env.EMAIL_USER,
      subject: `New Contact: ${name} (${email})`,
      text   : `Name: ${name}\nEmail: ${email}\n\n${message}`
    });

    res.json({ success: true });
  } catch (e) {
    console.error('Mail error:', e);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

/*────────────────── SPA FALLBACK (MUST BE LAST) ──────────────────*/
const FRONTEND_BUILD = path.join(__dirname, 'frontend', 'dist');
app.use(express.static(FRONTEND_BUILD));

// Any GET request not handled above → send index.html
app.use((req, res) => {
  res.sendFile(path.join(FRONTEND_BUILD, 'index.html'));
});

/*────────────────── START SERVER ──────────────────*/
app.listen(PORT, () => {
  console.log(`✅  Server listening on http://localhost:${PORT}`);
});
