import { Link, useLocation } from 'react-router-dom';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // ホームの場合は「ホーム」のみ表示
  if (pathnames.length === 0) {
    return (
      <div className="breadcrumb">
        <span className="breadcrumb-current">ホーム</span>
      </div>
    );
  }

  // ホーム以外のページでは通常のパンくずを表示
  return (
    <div className="breadcrumb">
      <Link to="/">ホーム</Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = getDisplayName(name);

        return isLast ? (
          <span key={name} className="breadcrumb-current">
            › {displayName}
          </span>
        ) : (
          <span key={name}>
            {' › '}
            <Link to={routeTo}>{displayName}</Link>
          </span>
        );
      })}
    </div>
  );
};

const getDisplayName = (path) => {
  const nameMap = {
    'scripts': 'スクリプト一覧',
    'how-to-install': '導入方法',
    'submission': '情報提供',
  };
  return nameMap[path] || path.charAt(0).toUpperCase() + path.slice(1);
};

export default Breadcrumbs;
