import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "public/images");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".png"));

const MAX_WIDTH = 960;

for (const file of files) {
  const srcPath = path.join(dir, file);
  const destPath = path.join(dir, file.replace(/\.png$/, ".webp"));
  const image = sharp(srcPath);
  const metadata = await image.metadata();
  const width = Math.min(metadata.width ?? MAX_WIDTH, MAX_WIDTH);

  await image
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(destPath);

  const outMeta = await sharp(destPath).metadata();
  const srcSize = fs.statSync(srcPath).size;
  const destSize = fs.statSync(destPath).size;

  console.log(
    `${file} -> ${path.basename(destPath)}: ${outMeta.width}x${outMeta.height}, ` +
      `${(srcSize / 1024).toFixed(0)}KiB -> ${(destSize / 1024).toFixed(0)}KiB`,
  );

  fs.unlinkSync(srcPath);
}
