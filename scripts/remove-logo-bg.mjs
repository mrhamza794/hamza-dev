import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logoDir = path.join(__dirname, "../public/assets/logo");

function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function sampleEdgeBackground(data, width, height, channels) {
  const points = [];
  const step = Math.max(1, Math.floor(Math.min(width, height) / 24));

  for (let x = 0; x < width; x += step) {
    points.push([x, 0], [x, height - 1]);
  }
  for (let y = 0; y < height; y += step) {
    points.push([0, y], [width - 1, y]);
  }

  let r = 0;
  let g = 0;
  let b = 0;
  for (const [x, y] of points) {
    const i = (y * width + x) * channels;
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }
  const n = points.length;
  return { r: r / n, g: g / n, b: b / n };
}

function floodRemoveLightBackground(data, width, height, channels, bg, tolerance) {
  const total = width * height;
  const visited = new Uint8Array(total);
  const remove = new Uint8Array(total);
  const queue = [];

  const tryPush = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    const i = idx * channels;
    const dist = colorDistance(data[i], data[i + 1], data[i + 2], bg.r, bg.g, bg.b);
    if (dist > tolerance) return;
    visited[idx] = 1;
    remove[idx] = 1;
    queue.push(idx);
  };

  for (let x = 0; x < width; x++) {
    tryPush(x, 0);
    tryPush(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    tryPush(0, y);
    tryPush(width - 1, y);
  }

  while (queue.length) {
    const idx = queue.pop();
    const x = idx % width;
    const y = Math.floor(idx / width);
    tryPush(x - 1, y);
    tryPush(x + 1, y);
    tryPush(x, y - 1);
    tryPush(x, y + 1);
  }

  const feather = 28;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const i = idx * channels;
      if (remove[idx]) {
        data[i + 3] = 0;
        continue;
      }

      const dist = colorDistance(data[i], data[i + 1], data[i + 2], bg.r, bg.g, bg.b);
      if (dist < tolerance + feather) {
        const nearRemoved =
          (x > 0 && remove[idx - 1]) ||
          (x < width - 1 && remove[idx + 1]) ||
          (y > 0 && remove[idx - width]) ||
          (y < height - 1 && remove[idx + width]);
        if (nearRemoved) {
          data[i + 3] = Math.round(((dist - tolerance) / feather) * 255);
        }
      }
    }
  }
}

async function removeDarkBackground(data, width, height, channels, bg) {
  const tolerance = 38;
  const feather = 36;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const dist = colorDistance(r, g, b, bg.r, bg.g, bg.b);
      const lum = (r + g + b) / 3;

      let alpha = 255;
      if (dist < tolerance || (lum < 42 && dist < tolerance * 1.7)) {
        alpha = 0;
      } else if (dist < tolerance + feather) {
        alpha = Math.round(((dist - tolerance) / feather) * 255);
      }
      data[i + 3] = alpha;
    }
  }
}

async function processLogo(inputName, outputName, mode) {
  const input = path.join(logoDir, inputName);
  const output = path.join(logoDir, outputName);

  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const bg = sampleEdgeBackground(data, width, height, channels);

  if (mode === "dark") {
    await removeDarkBackground(data, width, height, channels, bg);
  } else {
    floodRemoveLightBackground(data, width, height, channels, bg, 58);
  }

  await sharp(data, { raw: { width, height, channels: 4 } }).png({ compressionLevel: 9 }).toFile(output);
  console.log(`Wrote ${outputName} (bg ~ rgb(${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)}))`);
}

await processLogo("logo-dark.png", "logo-dark-transparent.png", "dark");
await processLogo("logo-light.png", "logo-light-transparent.png", "light");
