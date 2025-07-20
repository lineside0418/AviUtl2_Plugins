import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="site-footer">
      
      <div className="footer-container">
        <div className="footer-links">
          <div className="footer-section">
            <h3>メニュー</h3>
            <ul>
              <li><Link to="/">ホーム</Link></li>
              <li><Link to="/scripts">スクリプト一覧</Link></li>
              <li><Link to="/how-to-install">導入方法</Link></li>
              <li><a href="https://forms.gle/se44AVdbB1bWnbkd7" target="_blank" rel="noopener noreferrer">情報提供</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>情報</h3>
            <ul>
              <li><a href="https://github.com/lineside0418/AviUtl2_Plugins" target="_blank" rel="noopener noreferrer">GitHubリポジトリ</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>連絡先</h3>
            <p>ご質問やご要望がありましたら、<br />GitHubのIssueよりお願いします。</p>
            <div className="social-links">
              <a href="https://github.com/lineside0418/AviUtl2_Plugins/issues" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <i className="ri-github-fill"></i>
              </a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {currentYear} AviUtl2 プラグイン/スクリプト一覧 - All Rights Reserved</p>
          <p>Powered by React and MicroCMS</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
