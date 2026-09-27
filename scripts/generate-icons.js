import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Simple CRC32 implementation
function makeCRCTable() {
  let c;
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }
  return crcTable;
}

const crcTable = makeCRCTable();

function crc32(buf) {
  let crc = 0 ^ -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);

  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(body), 0);

  return Buffer.concat([len, body, crcBuf]);
}

function createPng(width, height, isMaskable = false) {
  // Generate RGBA pixel buffer
  const rawData = Buffer.alloc(height * (width * 4 + 1));
  let offset = 0;

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.46;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter byte: None

    for (let x = 0; x < width; x++) {
      // Safe padding for maskable
      const safeRadius = isMaskable ? width * 0.38 : radius;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background color: deep midnight navy #0b1729
      let r = 11;
      let g = 23;
      let b = 41;
      let a = 255;

      // Draw rounded card background if not maskable
      if (!isMaskable) {
        const corner = width * 0.22;
        const inCard =
          x >= corner && x <= width - corner
            ? y >= 0 && y <= height
            : y >= corner && y <= height - corner
            ? x >= 0 && x <= width
            : (x < corner && y < corner && Math.hypot(x - corner, y - corner) <= corner) ||
              (x > width - corner && y < corner && Math.hypot(x - (width - corner), y - corner) <= corner) ||
              (x < corner && y > height - corner && Math.hypot(x - corner, y - (height - corner)) <= corner) ||
              (x > width - corner && y > height - corner && Math.hypot(x - (width - corner), y - (height - corner)) <= corner);

        if (!inCard) {
          a = 0;
        }
      }

      if (a > 0) {
        // Draw decorative grid lines
        if (y % Math.floor(width / 8) === 0 || x % Math.floor(width / 8) === 0) {
          r = Math.min(255, r + 15);
          g = Math.min(255, g + 25);
          b = Math.min(255, b + 40);
        }

        // Draw ascending green trendline / candlesticks
        const scale = width / 100;
        // Candlestick 1
        if (x >= 24 * scale && x <= 32 * scale && y >= 55 * scale && y <= 75 * scale) {
          // Red candle
          r = 244; g = 63; b = 94;
        } else if (x >= 27 * scale && x <= 29 * scale && y >= 45 * scale && y <= 85 * scale) {
          r = 244; g = 63; b = 94;
        }
        // Candlestick 2
        else if (x >= 42 * scale && x <= 50 * scale && y >= 40 * scale && y <= 65 * scale) {
          // Green candle
          r = 16; g = 185; b = 129;
        } else if (x >= 45 * scale && x <= 47 * scale && y >= 32 * scale && y <= 72 * scale) {
          r = 16; g = 185; b = 129;
        }
        // Candlestick 3 (bullish breakout)
        else if (x >= 60 * scale && x <= 68 * scale && y >= 25 * scale && y <= 50 * scale) {
          // Bright emerald green candle
          r = 52; g = 211; b = 153;
        } else if (x >= 63 * scale && x <= 65 * scale && y >= 18 * scale && y <= 58 * scale) {
          r = 52; g = 211; b = 153;
        }
        // Trend arrow line
        const arrowY = 80 * scale - (x / width) * (60 * scale);
        if (Math.abs(y - arrowY) <= 2.5 * scale && x >= 20 * scale && x <= 78 * scale) {
          r = 52; g = 211; b = 153; // Green glow line
        }
      }

      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  // PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth
  ihdr[9] = 6; // Color type: RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace
  const ihdrChunk = createChunk('IHDR', ihdr);

  // IDAT chunk (deflated pixel data)
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate files
const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, false));

// Generate icon.svg
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="112" fill="#0b1729"/>
  <rect x="24" y="24" width="464" height="464" rx="96" fill="none" stroke="#1e3452" stroke-width="6"/>
  <!-- Grid -->
  <line x1="64" y1="128" x2="448" y2="128" stroke="#162942" stroke-width="2" stroke-dasharray="6,6"/>
  <line x1="64" y1="256" x2="448" y2="256" stroke="#162942" stroke-width="2" stroke-dasharray="6,6"/>
  <line x1="64" y1="384" x2="448" y2="384" stroke="#162942" stroke-width="2" stroke-dasharray="6,6"/>
  <line x1="128" y1="64" x2="128" y2="448" stroke="#162942" stroke-width="2" stroke-dasharray="6,6"/>
  <line x1="256" y1="64" x2="256" y2="448" stroke="#162942" stroke-width="2" stroke-dasharray="6,6"/>
  <line x1="384" y1="64" x2="384" y2="448" stroke="#162942" stroke-width="2" stroke-dasharray="6,6"/>
  <!-- Candlesticks -->
  <!-- Red candle 1 -->
  <line x1="140" y1="240" x2="140" y2="420" stroke="#f43f5e" stroke-width="6"/>
  <rect x="120" y="280" width="40" height="100" rx="6" fill="#f43f5e"/>
  <!-- Green candle 2 -->
  <line x1="230" y1="180" x2="230" y2="360" stroke="#10b981" stroke-width="6"/>
  <rect x="210" y="210" width="40" height="110" rx="6" fill="#10b981"/>
  <!-- Green candle 3 -->
  <line x1="320" y1="100" x2="320" y2="300" stroke="#34d399" stroke-width="6"/>
  <rect x="300" y="130" width="40" height="130" rx="6" fill="#34d399"/>
  <!-- Upward Trendline & arrow -->
  <path d="M 100 370 Q 220 280, 390 120" fill="none" stroke="#34d399" stroke-width="12" stroke-linecap="round"/>
  <polygon points="410,105 375,115 395,145" fill="#34d399"/>
  <!-- N50 Badge -->
  <rect x="330" y="380" width="120" height="48" rx="12" fill="#10233d" stroke="#21d19b" stroke-width="3"/>
  <text x="390" y="413" fill="#21d19b" font-family="monospace" font-size="24" font-weight="bold" text-anchor="middle">N50</text>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svg);
console.log('Icons successfully generated in public directory.');
