import React from 'react';
import { Link, NavLink } from 'react-router-dom';

function Header() {
  return (
    <header className="site-header">
      <div className="header-container">
        <Link to="/" className="site-logo">AviUtl2 - プラグイン/スクリプト一覧</Link>
        <nav className="global-nav">
          <ul>
            <li><NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>プラグイン一覧</NavLink></li>
            <li><NavLink to="/scripts" className={({ isActive }) => isActive ? 'active' : ''}>スクリプト一覧</NavLink></li>
            <li><NavLink to="/how-to-install" className={({ isActive }) => isActive ? 'active' : ''}>導入方法</NavLink></li>
            <li><a href="https://forms.gle/se44AVdbB1bWnbkd7" target="_blank" rel="noopener noreferrer">情報提供</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
