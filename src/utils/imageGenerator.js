// src/utils/imageGenerator.js
const fs = require('fs');
const path = require('path');
const { createCanvas, registerFont } = require('canvas');
require('dotenv').config();

const IMAGE_PATH = process.env.IMAGE_CACHE_PATH || 'cache/summary.png';

function ensureCacheDir() {
  const dir = path.dirname(IMAGE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function generateSummaryImage({ total, top5, timestamp }) {
  ensureCacheDir();
  const width = 800, height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#111';
  ctx.font = 'bold 28px Arial';
  ctx.fillText('Country Summary', 30, 50);

  ctx.font = '16px Arial';
  ctx.fillText(`Total countries: ${total}`, 30, 90);
  ctx.fillText(`Last refresh: ${new Date(timestamp).toISOString()}`, 30, 115);

  ctx.font = '18px Arial';
  ctx.fillText('Top 5 Countries by Estimated GDP', 30, 160);

  ctx.font = '16px Arial';
  top5.forEach((c, i) => {
    const y = 200 + i * 60;
    ctx.fillText(`${i + 1}. ${c.name} — ${Number(c.estimated_gdp || 0).toLocaleString(undefined, {maximumFractionDigits:2})}`, 40, y);
    if (c.flag_url) {
      // small synchronous fetch of flag image is complicated; skip embedding images to keep code simple
      // Optionally you can load a local flag file if available.
    }
  });

  const out = fs.createWriteStream(IMAGE_PATH);
  const stream = canvas.createPNGStream();
  stream.pipe(out);
  return new Promise((resolve, reject) => {
    out.on('finish', () => resolve(IMAGE_PATH));
    out.on('error', reject);
  });
}

module.exports = { generateSummaryImage, IMAGE_PATH };
