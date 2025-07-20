// src/pages/ScriptListPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getScripts } from '../api/microcms'; // MicroCMSからスクリプトデータを取得する関数をインポート
import { Link } from 'react-router-dom'; // Linkコンポーネントをインポート

function ScriptListPage() { // コンポーネント名をScriptListPageに変更
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [activeTags, setActiveTags] = useState(() => new Set());
  const [sortOrder, setSortOrder] = useState('name-asc');
  const [itemsPerPage, setItemsPerPage] = useState('12');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');

  // データ取得
  useEffect(() => {
    const fetchItems = async () => {
      // MicroCMSからスクリプトデータを全件取得するよ。
      const { contents } = await getScripts({ limit: 100 }); // getPluginsをgetScriptsに変更
      setAllItems(contents);
    };
    fetchItems();
  }, []);

  // フィルタリングとソートのロジック
  useEffect(() => {
    let tempItems = [...allItems];

    const searchText = searchInput.toLowerCase().trim();
    const searchTerms = searchText.split(/\s+/).filter(term => term);
    const keywords = searchTerms.filter(term => !term.startsWith('#'));
    const searchTagsFromInput = searchTerms.filter(term => term.startsWith('#')).map(t => t.substring(1));

    tempItems = tempItems.filter(item => {
      const matchesKeyword = keywords.every(kw =>
        item.name.toLowerCase().includes(kw) || item.description.toLowerCase().includes(kw)
      );

      const combinedActiveTags = new Set([...Array.from(activeTags), ...searchTagsFromInput]);
      const itemTagsLower = item.tags.map(tag => tag.toLowerCase());
      const matchesTags = Array.from(combinedActiveTags).every(tag => itemTagsLower.includes(tag));

      return matchesKeyword && matchesTags;
    });

    // ソートのロジック
    tempItems.sort((a, b) => {
      switch (sortOrder) {
        case 'name-asc': return a.name.localeCompare(b.name, 'ja');
        case 'name-desc': return b.name.localeCompare(a.name, 'ja');
        case 'date-newest': return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        case 'date-oldest': return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
        default: return 0;
      }
    });

    setFilteredItems(tempItems);
    setCurrentPage(1);
  }, [allItems, searchInput, activeTags, sortOrder]);

  const totalPages = useMemo(() => {
    const itemsPerPageNum = itemsPerPage === 'all' ? filteredItems.length : parseInt(itemsPerPage);
    return Math.ceil(filteredItems.length / itemsPerPageNum);
  }, [filteredItems.length, itemsPerPage]);

  const itemsToDisplay = useMemo(() => {
    const itemsPerPageNum = itemsPerPage === 'all' ? filteredItems.length : parseInt(itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPageNum;
    const endIndex = startIndex + itemsPerPageNum;
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, currentPage, itemsPerPage]);

  const allUniqueTags = useMemo(() => {
    const tags = new Set(allItems.flatMap(item => item.tags));
    return Array.from(tags).sort((a, b) => a.localeCompare(b, 'ja'));
  }, [allItems]);

  const toggleSidebarTag = useCallback((tag) => {
    setActiveTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tag.toLowerCase())) {
        newSet.delete(tag.toLowerCase());
      } else {
        newSet.add(tag.toLowerCase());
      }
      return newSet;
    });
  }, []);

  const handleTagClickFromCard = useCallback((tag) => {
    if (!searchInput.toLowerCase().includes(`#${tag.toLowerCase()}`)) {
      setSearchInput(prev => `${prev} #${tag}`.trim());
    }
  }, [searchInput]);

  const renderPaginationButtons = () => {
    const buttons = [];
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          className={i === currentPage ? 'active' : ''}
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
        <h1>スクリプト一覧</h1> {/* タイトルを「スクリプト一覧」に変更 */}

        {/* 検索エリア */}
        <div className="search-area" id="searchArea">
            <div className="search-notice">
                <strong>ご注意ください :</strong> 本サイトの情報は<strong>非公式</strong>であり、更新が不定期かつ不正確な場合があります。<br/>
                各スクリプトの導入方法はご自身でご確認ください。お問い合わせはX: <a href="https://twitter.com/_lineside_" target="_blank" rel="noopener noreferrer">@_lineside_</a>まで。
            </div>
             <div className="search-notice notice-info">
                新しいスクリプト情報をご存知ですか？ <a href="https://forms.gle/se44AVdbB1bWnbkd7" target="_blank" rel="noopener noreferrer">こちらから教えてください！</a>
            </div>
            <div className="search-input-group">
                <input
                  type="text"
                  id="searchInput"
                  placeholder="キーワードまたは #タグ名 で検索..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
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
                <button id="refreshButton" title="リストを更新" onClick={() => { /* MicroCMSなので基本的に強制更新は不要だが、必要な場合はAPIを再取得する処理をここに書く */ }}><i className="ri-refresh-line"></i></button>

                <div className="sort-controls">
                    <span className="icon-button" title="並び順"><i className="ri-sort-asc"></i></span>
                    <select id="sortOrder" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                        <option value="name-asc">名前 (昇順)</option>
                        <option value="name-desc">名前 (降順)</option>
                        <option value="date-newest">公開日時 (新しい順)</option>
                        <option value="date-oldest">公開日時 (古い順)</option>
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

        <div className={`item-list ${viewMode === 'list' ? 'list-mode' : ''}`}>
          {itemsToDisplay.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-color-dark)' }}>
              条件に合うスクリプトは見つかりませんでした。 {/* メッセージを「スクリプト」に変更 */}
            </p>
          ) : (
            itemsToDisplay.map(item => (
              <ItemCard key={item.id} item={item} onTagClick={handleTagClickFromCard} />
            ))
          )}
        </div>

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

// ItemCardコンポーネントは共通で使えるので変更なし
function ItemCard({ item, onTagClick }) {
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
        <div className="info">更新: {publishedAtFormatted}</div>
        <div className="link">
          <a href={item.url} target="_blank" rel="noopener noreferrer">ダウンロード</a>
        </div>
      </div>
    </div>
  );
}

export default ScriptListPage; // exportするコンポーネント名をScriptListPageに変更