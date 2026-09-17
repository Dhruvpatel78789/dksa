import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

async function calculateDirSize(dir) {
  let total = 0;
  try {
    const files = await fs.readdir(dir);
    for (const file of files) {
      if (file.startsWith('.')) continue;
      const stat = await fs.stat(path.join(dir, file));
      total += stat.size;
    }
  } catch (e) {
    // dir might not exist
  }
  return total;
}

async function main() {
  const publicDir = path.join(process.cwd(), 'public');
  const framesDir = path.join(publicDir, 'frames');
  const productsDir = path.join(publicDir, 'products');

  console.log('Calculating initial sizes...');
  const initialFramesSize = await calculateDirSize(framesDir);
  const initialProductsSize = await calculateDirSize(productsDir);
  
  let initialHeroSize = 0;
  try {
    initialHeroSize = (await fs.stat(path.join(publicDir, 'review-hero.jpg'))).size;
  } catch (e) {}

  const initialTotalSize = initialFramesSize + initialProductsSize + initialHeroSize;
  console.log(`Initial total size: ${(initialTotalSize / 1024 / 1024).toFixed(2)} MB`);

  // 1. Process frames
  console.log('Processing frames...');
  const frameFiles = (await fs.readdir(framesDir))
    .filter(f => f.startsWith('frame_') && f.endsWith('.png'))
    .sort();

  let keptCount = 0;
  for (let i = 0; i < frameFiles.length; i++) {
    const file = frameFiles[i];
    const filePath = path.join(framesDir, file);

    if (i % 3 === 0) {
      // Keep this frame, convert to webp and rename sequentially
      const newFileName = `frame_${String(keptCount).padStart(3, '0')}.webp`;
      const newFilePath = path.join(framesDir, newFileName);
      
      await sharp(filePath)
        .webp({ quality: 80 })
        .toFile(newFilePath);
      
      await fs.unlink(filePath); // delete original png
      keptCount++;
    } else {
      // Don't keep this frame, just delete it
      await fs.unlink(filePath);
    }
  }
  console.log(`Converted ${keptCount} frames to WebP. Deleted remaining PNGs.`);

  // 2. Process products
  console.log('Processing products...');
  try {
    const productFiles = (await fs.readdir(productsDir))
      .filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'));

    for (const file of productFiles) {
      const filePath = path.join(productsDir, file);
      const newFileName = file.replace(/\.(png|jpg|jpeg)$/, '.webp');
      const newFilePath = path.join(productsDir, newFileName);
      
      await sharp(filePath)
        .webp({ quality: 80 })
        .toFile(newFilePath);
      
      await fs.unlink(filePath);
    }
    console.log(`Converted ${productFiles.length} product images to WebP.`);
  } catch (e) {
    console.error('Error processing products:', e);
  }

  // 3. Process review-hero.jpg
  console.log('Processing review-hero.jpg...');
  try {
    const heroPath = path.join(publicDir, 'review-hero.jpg');
    const newHeroPath = path.join(publicDir, 'review-hero.webp');
    await sharp(heroPath)
      .webp({ quality: 80 })
      .toFile(newHeroPath);
    await fs.unlink(heroPath);
    console.log('Converted review-hero.jpg to WebP.');
  } catch (e) {
    console.error('Error processing review-hero.jpg:', e);
  }

  // Calculate final sizes
  const finalFramesSize = await calculateDirSize(framesDir);
  const finalProductsSize = await calculateDirSize(productsDir);
  let finalHeroSize = 0;
  try {
    finalHeroSize = (await fs.stat(path.join(publicDir, 'review-hero.webp'))).size;
  } catch (e) {}

  const finalTotalSize = finalFramesSize + finalProductsSize + finalHeroSize;
  console.log(`\nFinal sizes:`);
  console.log(`Frames: ${(finalFramesSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Products: ${(finalProductsSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total after conversion: ${(finalTotalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total savings: ${((initialTotalSize - finalTotalSize) / 1024 / 1024).toFixed(2)} MB`);
}

main().catch(console.error);
