// src/pages/PluginListPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getPlugins } from '../api/microcms'; // MicroCMSからデータを取得する関数をインポート
import { Link } from 'react-router-dom'; // Linkコンポーネントをインポート

function PluginListPage() {
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  // SetオブジェクトはuseStateの初期値として関数を渡すのがおすすめだよ
  const [activeTags, setActiveTags] = useState(() => new Set());
  const [sortOrder, setSortOrder] = useState('name-asc'); // デフォルトは名前昇順
  const [itemsPerPage, setItemsPerPage] = useState('12');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [isLoading, setIsLoading] = useState(false); // ローディング状態を管理

  // データ取得関数
  const fetchItems = useCallback(async () => {
    try {
      const { contents } = await getPlugins({ limit: 100 });
      setAllItems(contents);
      return true;
    } catch (error) {
      console.error('Error fetching plugins:', error);
      return false;
    }
  }, []);

  // 初回マウント時にデータを取得
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // リロード処理
  const handleReload = useCallback(async () => {
    // フェードアウト
    setIsLoading(true);
    
    // アニメーション用に少し待機
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // データを再取得
    await fetchItems();
    
    // フェードイン
    setIsLoading(false);
    
    // 検索条件をリセット
    setSearchInput('');
    setActiveTags(new Set());
    setCurrentPage(1);
  }, [fetchItems]);

  // フィルタリングとソートのロジック
  // searchInput, activeTags, sortOrder, allItems が変更されたときに再計算するよ
  useEffect(() => {
    let tempItems = [...allItems];

    // 検索フィルターのロジック
    const searchText = searchInput.toLowerCase().trim();
    const searchTerms = searchText.split(/\s+/).filter(term => term); // スペースで区切って検索語句の配列にする
    const keywords = searchTerms.filter(term => !term.startsWith('#')); // #が付いていないものがキーワード
    const searchTagsFromInput = searchTerms.filter(term => term.startsWith('#')).map(t => t.substring(1)); // #が付いているものがタグ

    tempItems = tempItems.filter(item => {
      // キーワード検索
      const matchesKeyword = keywords.every(kw =>
        item.name.toLowerCase().includes(kw) || item.description.toLowerCase().includes(kw)
      );

      // タグ検索
      // アクティブなタグ（サイドバーから選択されたもの）と検索入力からのタグを結合するよ
      const combinedActiveTags = new Set([...Array.from(activeTags), ...searchTagsFromInput]);
      const itemTagsLower = item.tags.map(tag => tag.toLowerCase());
      const matchesTags = Array.from(combinedActiveTags).every(tag => itemTagsLower.includes(tag));

      return matchesKeyword && matchesTags; // 両方の条件を満たすものを表示
    });

    // ソートのロジック
    tempItems.sort((a, b) => {
      switch (sortOrder) {
        case 'name-asc': return a.name.localeCompare(b.name, 'ja'); // 名前 (昇順)
        case 'name-desc': return b.name.localeCompare(a.name, 'ja'); // 名前 (降順)
        // MicroCMSが自動で付与する publishedAt (公開日時) を使用するよ
        // publishedAtはISO 8601形式の文字列なので、Dateオブジェクトに変換して比較するんだ
        case 'date-newest': return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(); // 公開日時 (新しい順)
        case 'date-oldest': return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(); // 公開日時 (古い順)
        default: return 0;
      }
    });

    setFilteredItems(tempItems);
    setCurrentPage(1); // フィルターやソートの条件が変わったら、ページを最初のページにリセットするよ
  }, [allItems, searchInput, activeTags, sortOrder]); // 依存配列

  // ページングの総ページ数を計算
  const totalPages = useMemo(() => {
    const itemsPerPageNum = itemsPerPage === 'all' ? filteredItems.length : parseInt(itemsPerPage);
    return Math.ceil(filteredItems.length / itemsPerPageNum);
  }, [filteredItems.length, itemsPerPage]);

  // 現在のページに表示するアイテムを計算
  const itemsToDisplay = useMemo(() => {
    const itemsPerPageNum = itemsPerPage === 'all' ? filteredItems.length : parseInt(itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPageNum;
    const endIndex = startIndex + itemsPerPageNum;
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, currentPage, itemsPerPage]);

  // サイドバーに表示するユニークなタグのリストを生成
  const allUniqueTags = useMemo(() => {
    // allItems（全プラグイン）から、重複しないタグを抽出してソートするよ
    const tags = new Set(allItems.flatMap(item => item.tags));
    return Array.from(tags).sort((a, b) => a.localeCompare(b, 'ja'));
  }, [allItems]);

  // サイドバーのタグをクリックしたときの処理
  const toggleSidebarTag = useCallback((tag) => {
    setActiveTags(prev => {
      const newSet = new Set(prev); // Setオブジェクトは直接変更できないので、新しいSetを作成するよ
      if (newSet.has(tag.toLowerCase())) {
        newSet.delete(tag.toLowerCase());
      } else {
        newSet.add(tag.toLowerCase());
      }
      return newSet;
    });
  }, []);

  // アイテムカード内のタグをクリックしたときの処理
  const handleTagClickFromCard = useCallback((tag) => {
    // 検索ボックスにそのタグがまだ含まれていなければ追加するよ
    if (!searchInput.toLowerCase().includes(`#${tag.toLowerCase()}`)) {
      setSearchInput(prev => `${prev} #${tag}`.trim());
    }
  }, [searchInput]);

  // ページネーションボタンの表示
  const renderPaginationButtons = () => {
    const buttons = [];
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          className={i === currentPage ? 'active' : ''} // 現在のページならactiveクラスを付けるよ
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  return (
    <div className="main-layout-container">
      <div className="content-area">
        <h1>プラグイン一覧</h1>

        {/* 検索エリア */}
        <div className="search-area" id="searchArea">
            <div className="search-notice">
                <strong>ご注意ください :</strong> 本サイトの情報は<strong>非公式</strong>であり、更新が不定期かつ不正確な場合があります。<br/>
                各プラグインの導入方法はご自身でご確認ください。お問い合わせはX: <a href="https://twitter.com/_lineside_" target="_blank" rel="noopener noreferrer">@_lineside_</a>まで。
            </div>
             <div className="search-notice notice-info">
                新しいプラグイン情報をご存知ですか？ <a href="https://forms.gle/se44AVdbB1bWnbkd7" target="_blank" rel="noopener noreferrer">こちらから教えてください！</a>
            </div>
            <div className="search-input-group">
                <input
                  type="text"
                  id="searchInput"
                  placeholder="キーワードまたは #タグ名 で検索..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  // Enterキーを押したときの処理はonChangeでリアルタイムにフィルターされるため不要
                />
                <button id="searchButton" className="search-button" title="検索" onClick={() => {/* 何もしない */}}>
                    <i className="ri-search-line"></i>
                </button>
            </div>

            <div className="controls-row">
                <div className="view-mode-controls">
                    <button id="gridButton" className={viewMode === 'grid' ? 'active' : ''} title="グリッド表示" onClick={() => setViewMode('grid')}><i className="ri-grid-fill"></i></button>
                    <button id="listButton" className={viewMode === 'list' ? 'active' : ''} title="リスト表示" onClick={() => setViewMode('list')}><i className="ri-list-unordered"></i></button>
                </div>
                <button 
                  id="refreshButton" 
                  title="リストを更新"
                  onClick={handleReload}
                  className={`refresh-button ${isLoading ? 'refreshing' : ''}`}
                  disabled={isLoading}
                >
                  <i className="ri-refresh-line"></i>
                </button>

                <div className="sort-controls">
                    <span className="icon-button" title="並び順"><i className="ri-sort-asc"></i></span>
                    <select id="sortOrder" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                        <option value="name-asc">名前 (昇順)</option>
                        <option value="name-desc">名前 (降順)</option>
                        <option value="date-newest">公開日時 (新しい順)</option> {/* ここを「公開日時」に修正 */}
                        <option value="date-oldest">公開日時 (古い順)</option> {/* ここを「公開日時」に修正 */}
                    </select>
                </div>
                <div className="items-per-page-controls">
                    <span className="icon-button" title="表示数"><i className="ri-list-check-2"></i></span>
                    <select id="itemsPerPage" value={itemsPerPage} onChange={(e) => setItemsPerPage(e.target.value)}>
                        <option value="12">12</option>
                        <option value="24">24</option>
                        <option value="36">36</option>
                        <option value="60">60</option>
                        <option value="120">120</option>
                        <option value="all">全て</option>
                    </select>
                </div>
            </div>
        </div>

        <div className={`item-list ${viewMode === 'list' ? 'list-mode' : ''} ${isLoading ? 'fade-out' : 'fade-in'}`}>
          {/* 表示するアイテムがない場合 */}
          {itemsToDisplay.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-color-dark)' }}>
              条件に合うプラグインは見つかりませんでした。
            </p>
          ) : (
            // アイテムカードをマップして表示
            itemsToDisplay.map(item => (
              <ItemCard key={item.id} item={item} onTagClick={handleTagClickFromCard} />
            ))
          )}
        </div>

        {/* ページネーション */}
        <div className="pagination">
          {currentPage > 1 && (
            <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Prev</button>
          )}
          {renderPaginationButtons()}
          {currentPage < totalPages && (
            <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
          )}
        </div>

      </div>

      {/* サイドバー */}
      <aside className="sidebar-area">
          <h2>タグ一覧</h2>
          <div className="sidebar-tag-list">
              {allUniqueTags.map(tag => (
                  <button
                      key={tag}
                      className={activeTags.has(tag.toLowerCase()) ? 'active' : ''}
                      onClick={() => toggleSidebarTag(tag)}
                  >
                      {tag}
                  </button>
              ))}
          </div>
      </aside>
    </div>
  );
}

// ItemCardコンポーネント (script.jsの createItemCard 関数部分をReactで書くよ)
function ItemCard({ item, onTagClick }) {
  // createdAtがないので、MicroCMSが自動で付与するpublishedAtを使用するよ
  // publishedAtはISO 8601形式の文字列なので、Dateオブジェクトに変換するんだ
  const publishedAtDate = item.publishedAt ? new Date(item.publishedAt) : null;
  const publishedAtFormatted = publishedAtDate ? publishedAtDate.toLocaleDateString('ja-JP') : '不明';

  return (
    <div className="item-card">
      <div className="card-header">
        <h2>{item.name}</h2>
        <div className="tags">
          {item.tags.map(tag => (
            <span key={tag} className="tag" onClick={() => onTagClick(tag)}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      <p className="description-text">{item.description}</p>
      <div className="card-footer">
        <div className="info">更新: {publishedAtFormatted}</div> {/* ここを「更新」に修正 */}
        <div className="link">
          <a href={item.url} target="_blank" rel="noopener noreferrer">ダウンロード</a>
        </div>
      </div>
    </div>
  );
}

export default PluginListPage;