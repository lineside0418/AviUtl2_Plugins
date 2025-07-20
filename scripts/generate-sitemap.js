import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import process from 'node:process';
import { SitemapStream } from 'sitemap';

// ESモジュール用の __dirname を設定
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// サイトのベースURL
const SITE_URL = 'https://lineside0418.github.io/AviUtl2_Plugins';

// 静的ページの定義
const staticPages = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/scripts', changefreq: 'daily', priority: 0.9 },
  { url: '/how-to-install', changefreq: 'monthly', priority: 0.8 },
  { url: '/submission', changefreq: 'monthly', priority: 0.7 },
  { url: '/privacy', changefreq: 'yearly', priority: 0.5 },
  { url: '/terms', changefreq: 'yearly', priority: 0.5 },
];

// サイトマップを生成する関数
async function generateSitemap() {
  try {
    // 出力先のディレクトリが存在するか確認
    const outDir = path.resolve(__dirname, '../public');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    
    // サイトマップのストリームを作成
    const sitemap = new SitemapStream({
      hostname: SITE_URL,
      lastmodDateOnly: true,
      xmlns: {
        news: false,
        xhtml: false,
        image: false,
        video: false,
      },
    });

    // 書き込みストリームを作成
    const writeStream = fs.createWriteStream(path.join(outDir, 'sitemap.xml'));
    
    // ストリームをパイプで接続
    sitemap.pipe(writeStream);
    
    // 現在の日付を取得 (YYYY-MM-DD形式)
    const today = new Date().toISOString().split('T')[0];
    
    // 静的ページをサイトマップに追加
    staticPages.forEach(page => {
      sitemap.write({
        url: page.url,
        changefreq: page.changefreq,
        priority: page.priority,
        lastmod: page.lastmod || today,
      });
    });
    
    // ここで動的にプラグインやスクリプトのページを追加することも可能
    // 例: 
    // const plugins = await fetchPlugins();
    // plugins.forEach(plugin => {
    //   sitemap.write({
    //     url: `/plugin/${plugin.id}`,
    //     changefreq: 'weekly',
    //     priority: 0.7,
    //     lastmod: plugin.updatedAt || today,
    //   });
    // });
    
    // ストリームを閉じて書き込みを完了
    sitemap.end();
    
    // 書き込み完了を待機
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
    
    console.log('Sitemap generated successfully!');
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

// 実行
generateSitemap();
