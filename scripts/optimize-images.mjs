import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const dirs = ["public/images", "public/brand", "public/kit", "public/time", "public/provas"];
const MAX_WIDTH = 960;
const converted = [];

function pngFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".png"));
}

for (const dir of dirs) {
  for (const file of pngFiles(dir)) {
    const srcPath = path.join(dir, file);
    const destPath = path.join(dir, file.replace(/\.png$/, ".webp"));
    const image = sharp(srcPath);
    const metadata = await image.metadata();
    const width = Math.min(metadata.width ?? MAX_WIDTH, MAX_WIDTH);
    await image
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(destPath);
    fs.unlinkSync(srcPath);
    converted.push([`/${dir}/${file}`, `/${dir}/${file.replace(/\.png$/, ".webp")}`]);
    const srcSize = fs.statSync(srcPath).size;
    const destSize = fs.statSync(destPath).size;
    console.log(`${file} -> ${file.replace(/\.png$/, ".webp")}: ${(destSize / 1024).toFixed(0)}KiB`);
  }
}

function rewriteRefs(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) rewriteRefs(p);
    else if (/\.(ts|tsx|js|mjs)$/.test(f)) {
      let c = fs.readFileSync(p, "utf8");
      let changed = false;
      for (const [src, dest] of converted) {
        if (c.includes(src)) {
          c = c.split(src).join(dest);
          changed = true;
        }
      }
      if (changed) fs.writeFileSync(p, c);
    }
  }
}
rewriteRefs("src");

console.log(`\nConvertidos ${converted.length} PNGs e referências atualizadas.`);
