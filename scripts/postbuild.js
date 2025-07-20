import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, '..', 'src');
const buildDir = path.join(__dirname, '..', 'dist');

// Ensure the styles directory exists in the build directory
const stylesDir = path.join(buildDir, 'styles');
if (!fs.existsSync(stylesDir)) {
  fs.mkdirSync(stylesDir, { recursive: true });
}

// Copy optimized.css to the build directory
const optimizedCssSrc = path.join(srcDir, 'styles', 'optimized.css');
const optimizedCssDest = path.join(stylesDir, 'optimized.css');

try {
  // Check if the source file exists
  if (fs.existsSync(optimizedCssSrc)) {
    // Read the source file
    const cssContent = fs.readFileSync(optimizedCssSrc, 'utf8');
    
    // Write to the destination
    fs.writeFileSync(optimizedCssDest, cssContent, 'utf8');
    console.log('✅ Optimized CSS copied to build directory');
  } else {
    console.warn('⚠️  optimized.css not found in src/styles/');
  }
} catch (err) {
  console.error('❌ Error copying optimized CSS:', err);
  // エラーが発生してもビルドを継続する
}
