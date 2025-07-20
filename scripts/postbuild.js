import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// プロジェクトのルートディレクトリからのパスを基準にする
const projectRoot = path.resolve(__dirname, '..'); // scriptsフォルダから一つ上
const distDir = path.join(projectRoot, 'dist'); // distフォルダのパス

// --- 404.html コピー処理 ---
const indexPath = path.join(distDir, 'index.html');
const notFoundPath = path.join(distDir, '404.html');

try {
  // index.htmlが存在するか確認してからコピー
  if (fs.existsSync(indexPath)) {
    fs.copyFileSync(indexPath, notFoundPath); // ファイルをコピーするよ
    console.log('✅ Copied index.html to 404.html successfully!');
  } else {
    console.warn('⚠️  index.html not found in dist folder. 404.html was not copied.');
  }
} catch (err) {
  console.error('❌ Error copying index.html to 404.html:', err);
  // エラーが発生してもビルドを継続する
}

// このスクリプトの後に sitemap 生成スクリプトが呼ばれるはず