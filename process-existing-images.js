const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const UPLOADS_DIR = path.join(__dirname, 'uploads');
const OPTIMIZED_DIR = path.join(__dirname, 'uploads', 'optimized');
const THUMBNAILS_DIR = path.join(__dirname, 'uploads', 'thumbnails');

// Ensure directories exist
[UPLOADS_DIR, OPTIMIZED_DIR, THUMBNAILS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Image optimization function
async function optimizeImage(originalPath, filename) {
  try {
    const ext = path.extname(filename).toLowerCase();
    const nameWithoutExt = path.basename(filename, ext);
    
    // Create optimized version (max 1920px width, 80% quality)
    const optimizedFilename = `${nameWithoutExt}-optimized${ext}`;
    const optimizedPath = path.join(OPTIMIZED_DIR, optimizedFilename);
    
    console.log(`Processing ${filename} -> optimized version...`);
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
    
    console.log(`Processing ${filename} -> thumbnail version...`);
    await sharp(originalPath)
      .resize(400, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({ quality: 70, progressive: true })
      .toFile(thumbnailPath);
    
    console.log(`✅ Completed processing ${filename}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to process ${filename}:`, error.message);
    return false;
  }
}

async function processAllImages() {
  console.log('🔄 Starting to process existing images...');
  
  try {
    const files = fs.readdirSync(UPLOADS_DIR);
    
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'].includes(ext);
    });

    console.log(`Found ${imageFiles.length} images to process`);
    
    let successCount = 0;
    for (const filename of imageFiles) {
      const originalPath = path.join(UPLOADS_DIR, filename);
      const success = await optimizeImage(originalPath, filename);
      if (success) successCount++;
    }
    
    console.log(`\n🎉 Processing complete! ${successCount}/${imageFiles.length} images processed successfully.`);
    console.log('You can now restart your server and the gallery should work properly.');
    
  } catch (error) {
    console.error('❌ Error processing images:', error);
  }
}

processAllImages(); 