import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

function NotFoundPage() {
  const location = useLocation();
  
  // 404エラーをGoogle Analyticsなどに送信する場合に使用
  useEffect(() => {
    // タイトルを設定
    document.title = '404 Not Found | AviUtl2 プラグイン/スクリプト一覧';
    
    // ここでエラートラッキングを実装できます
    console.error(`Page not found: ${location.pathname}`);
    
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: '404 - Page Not Found',
        page_path: location.pathname + location.search + location.hash,
        page_location: window.location.href,
        non_interaction: true
      });
    }
  }, [location]);

  return (
    <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      
      <div className="not-found-container" style={{ 
        textAlign: 'center', 
        padding: '4rem 0',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            fontSize: '6rem',
            fontWeight: 'bold',
            color: 'var(--accent-color)',
            lineHeight: 1,
            marginBottom: '1rem'
          }}>
            404
          </div>
          <h1 style={{ 
            fontSize: '1.8rem', 
            marginBottom: '1rem',
            color: 'var(--text-color)'
          }}>
            ページが見つかりません
          </h1>
          <p style={{ 
            marginBottom: '2rem', 
            color: 'var(--text-color-dark)',
            maxWidth: '600px',
            lineHeight: '1.6'
          }}>
            お探しのページは移動または削除された可能性があります。<br />
            URLが正しく入力されているかご確認ください。
          </p>
        </div>
        
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          justifyContent: 'center',
          marginTop: '1.5rem'
        }}>
          <Link 
            to="/" 
            className="button" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.8rem 2rem',
              backgroundColor: 'var(--accent-color)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              transition: 'all 0.3s ease',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
            onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={e => e.currentTarget.style.opacity = '1'}
          >
            <i className="ri-home-4-line" style={{ marginRight: '8px' }}></i>
            トップページに戻る
          </Link>
          
          <Link 
            to="/scripts" 
            className="button" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.8rem 1.5rem',
              backgroundColor: 'var(--bg-color-lighter)',
              color: 'var(--text-color)',
              textDecoration: 'none',
              borderRadius: '4px',
              transition: 'all 0.3s ease',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-color-light)'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--bg-color-lighter)'}
          >
            <i className="ri-code-s-slash-line" style={{ marginRight: '8px' }}></i>
            スクリプト一覧を見る
          </Link>
        </div>
        
        <div style={{ marginTop: '3rem', color: 'var(--text-color-dark)', fontSize: '0.9rem' }}>
          <p>URLをご確認の上、再度お試しいただくか、以下の情報もご確認ください。</p>
          <div style={{ marginTop: '1rem' }}>
            <Link 
              to="/how-to-install" 
              style={{ 
                color: 'var(--accent-color)',
                textDecoration: 'none',
                margin: '0 0.5rem',
                whiteSpace: 'nowrap'
              }}
              onMouseOver={e => e.currentTarget.textDecoration = 'underline'}
              onMouseOut={e => e.currentTarget.textDecoration = 'none'}
            >
              導入方法
            </Link>
            <span style={{ color: 'var(--border-color)' }}>|</span>
            <a
              href="https://forms.gle/se44AVdbB1bWnbkd7" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: 'var(--accent-color)',
                textDecoration: 'none',
                margin: '0 0.5rem',
                whiteSpace: 'nowrap'
              }}
              onMouseOver={e => e.currentTarget.textDecoration = 'underline'}
              onMouseOut={e => e.currentTarget.textDecoration = 'none'}
            >
              情報提供
            </a>
            <span style={{ color: 'var(--border-color)' }}>|</span>
            <a 
              href="https://github.com/lineside0418/AviUtl2_Plugins/issues" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: 'var(--accent-color)',
                textDecoration: 'none',
                margin: '0 0.5rem',
                whiteSpace: 'nowrap'
              }}
              onMouseOver={e => e.currentTarget.textDecoration = 'underline'}
              onMouseOut={e => e.currentTarget.textDecoration = 'none'}
            >
              お問い合わせ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
