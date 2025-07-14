document.addEventListener('DOMContentLoaded', () => {
    // --- グローバル設定 ---
    const config = {
        pageId: null,
        jsonFile: null,
        itemType: null,
    };

    // --- ページ判定と初期化 ---
    const bodyId = document.body.id;
    if (bodyId === 'page-plugins') {
        config.pageId = 'plugins';
        config.jsonFile = 'plugins.json';
        config.itemType = 'プラグイン';
        initializeListPage();
    } else if (bodyId === 'page-scripts') {
        config.pageId = 'scripts';
        config.jsonFile = 'scripts.json';
        config.itemType = 'スクリプト';
        initializeListPage();
    } else {
        // 静的ページ用の共通処理
        initializeStaticPage();
    }

    // --- 静的ページ用初期化 ---
    function initializeStaticPage() {
        setupToTopButton();
    }

    // --- 一覧ページ用初期化 ---
    function initializeListPage() {
        // --- DOM要素の取得 ---
        const searchInput = document.getElementById('searchInput');
        const searchButton = document.getElementById('searchButton');
        const itemListContainer = document.getElementById('itemList');
        const sidebarTagList = document.getElementById('sidebarTagList');
        const sortOrderSelect = document.getElementById('sortOrder');
        const itemsPerPageSelect = document.getElementById('itemsPerPage');
        const paginationContainer = document.getElementById('pagination');
        const gridButton = document.getElementById('gridButton');
        const listButton = document.getElementById('listButton');
        const refreshButton = document.getElementById('refreshButton');

        // --- 状態管理用変数 ---
        let allItems = [];
        let filteredItems = [];
        let activeTags = new Set();
        let currentPage = 1;

        // --- メイン処理 ---
        fetchData();
        setupEventListeners();
        setupToTopButton();

        // --- データ取得 ---
        async function fetchData() {
            try {
                const response = await fetch(config.jsonFile);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                allItems = data.map(item => ({
                    ...item,
                    createdAt: new Date(item.createdAt)
                }));
                createTagButtonsInSidebar();
                filterAndRender();
            } catch (error) {
                console.error("データの読み込みに失敗しました:", error);
                itemListContainer.innerHTML = `<p style="color: red; text-align: center;">データを読み込めませんでした。ファイルパスやJSONの形式を確認してください。</p>`;
            }
        }

        // --- イベントリスナー設定 ---
        function setupEventListeners() {
            searchButton.addEventListener('click', () => handleFilterChange());
            searchInput.addEventListener('keydown', e => e.key === 'Enter' && handleFilterChange());
            sortOrderSelect.addEventListener('change', () => handleFilterChange());
            itemsPerPageSelect.addEventListener('change', () => handleFilterChange());
            refreshButton.addEventListener('click', () => fetchData());
            gridButton.addEventListener('click', () => setViewMode('grid'));
            listButton.addEventListener('click', () => setViewMode('list'));
        }

        // --- フィルター/ソート/ページ変更ハンドラ ---
        function handleFilterChange() {
            currentPage = 1;
            filterAndRender();
        }

        // --- ビューモード切り替え ---
        function setViewMode(mode) {
            if (mode === 'grid') {
                itemListContainer.classList.remove('list-mode');
                gridButton.classList.add('active');
                listButton.classList.remove('active');
            } else {
                itemListContainer.classList.add('list-mode');
                listButton.classList.add('active');
                gridButton.classList.remove('active');
            }
        }

        // --- フィルタリングとレンダリングのメイン関数 ---
        function filterAndRender() {
            // フィルター処理
            let tempItems = allItems.filter(item => {
                const searchText = searchInput.value.toLowerCase().trim();
                const searchTerms = searchText.split(/\s+/).filter(term => term);
                const keywords = searchTerms.filter(term => !term.startsWith('#'));
                const searchTags = searchTerms.filter(term => term.startsWith('#')).map(t => t.substring(1));

                const matchesKeyword = keywords.every(kw =>
                    item.name.toLowerCase().includes(kw) || item.description.toLowerCase().includes(kw)
                );

                const combinedActiveTags = new Set([...activeTags, ...searchTags]);
                const itemTagsLower = item.tags.map(tag => tag.toLowerCase());
                const matchesTags = Array.from(combinedActiveTags).every(tag => itemTagsLower.includes(tag));

                return matchesKeyword && matchesTags;
            });

            // ソート処理
            const sortOrder = sortOrderSelect.value;
            tempItems.sort((a, b) => {
                switch (sortOrder) {
                    case 'name-asc': return a.name.localeCompare(b.name, 'ja');
                    case 'name-desc': return b.name.localeCompare(a.name, 'ja');
                    case 'date-newest': return b.createdAt - a.createdAt;
                    case 'date-oldest': return a.createdAt - b.createdAt;
                    default: return 0;
                }
            });

            filteredItems = tempItems;
            render();
        }

        // --- レンダリング関連 ---
        function render() {
            itemListContainer.classList.add('fade-out');
            setTimeout(() => {
                renderItems();
                renderPagination();
                itemListContainer.classList.remove('fade-out');
            }, 200);
        }

        // アイテムリストのレンダリング
        function renderItems() {
            itemListContainer.innerHTML = '';
            const itemsPerPage = itemsPerPageSelect.value === 'all' ? filteredItems.length : parseInt(itemsPerPageSelect.value);
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const itemsToDisplay = filteredItems.slice(startIndex, endIndex);

            if (itemsToDisplay.length === 0) {
                itemListContainer.innerHTML = `<p style="text-align: center; color: var(--text-color-dark);">条件に合う${config.itemType}は見つかりませんでした。</p>`;
                return;
            }

            itemsToDisplay.forEach(item => itemListContainer.appendChild(createItemCard(item)));
            addItemTagClickListeners();
        }
        
        // アイテムカード生成
        function createItemCard(item) {
            const card = document.createElement('div');
            card.className = 'item-card';
            const createdAtFormatted = item.createdAt.toLocaleDateString('ja-JP');
            const tagsHtml = item.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

            card.innerHTML = `
                <div class="card-header">
                    <h2>${item.name}</h2>
                    <div class="tags">${tagsHtml}</div>
                </div>
                <p class="description-text">${item.description}</p>
                <div class="card-footer">
                    <div class="info">更新: ${createdAtFormatted}</div>
                    <div class="link">
                        <a href="${item.url}" target="_blank" rel="noopener noreferrer">ダウンロード</a>
                    </div>
                </div>
            `;
            return card;
        }

        // ページネーションのレンダリング
        function renderPagination() {
            paginationContainer.innerHTML = '';
            const itemsPerPage = itemsPerPageSelect.value;
            if (itemsPerPage === 'all') return;

            const totalPages = Math.ceil(filteredItems.length / parseInt(itemsPerPage));
            if (totalPages <= 1) return;

            // ... (省略) ... ページネーションボタン生成ロジックは複雑なので要約
            // 簡略化のため、Prev, Next, そしてページ番号ボタンを生成
            const createButton = (text, page, isDisabled = false, isActive = false) => {
                const button = document.createElement('button');
                button.textContent = text;
                button.disabled = isDisabled;
                if (isActive) button.classList.add('active');
                button.addEventListener('click', () => {
                    currentPage = page;
                    render();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
                return button;
            };

            paginationContainer.appendChild(createButton('Prev', currentPage - 1, currentPage === 1));

            for (let i = 1; i <= totalPages; i++) {
                 if (i === currentPage || totalPages <= 5 || (i >= currentPage - 1 && i <= currentPage + 1) || i === 1 || i === totalPages) {
                    paginationContainer.appendChild(createButton(i, i, false, i === currentPage));
                 } else if (i === currentPage - 2 || i === currentPage + 2) {
                    const dots = document.createElement('span');
                    dots.textContent = '...';
                    paginationContainer.appendChild(dots);
                 }
            }
            
            paginationContainer.appendChild(createButton('Next', currentPage + 1, currentPage === totalPages));
        }

        // --- タグ関連 ---
        // サイドバーのタグボタン生成
        function createTagButtonsInSidebar() {
            const allUniqueTags = new Set(allItems.flatMap(item => item.tags));
            sidebarTagList.innerHTML = '';
            Array.from(allUniqueTags).sort((a,b) => a.localeCompare(b,'ja')).forEach(tag => {
                const button = document.createElement('button');
                button.textContent = tag;
                button.addEventListener('click', () => {
                    toggleSidebarTag(tag, button);
                    handleFilterChange();
                });
                sidebarTagList.appendChild(button);
            });
        }
        
        // サイドバーのタグ選択切り替え
        function toggleSidebarTag(tag, button) {
             const tagLower = tag.toLowerCase();
             if(activeTags.has(tagLower)) {
                 activeTags.delete(tagLower);
                 button.classList.remove('active');
             } else {
                 activeTags.add(tagLower);
                 button.classList.add('active');
             }
        }

        // カード内のタグクリック処理
        function addItemTagClickListeners() {
            itemListContainer.querySelectorAll('.item-card .tag').forEach(tagSpan => {
                tagSpan.addEventListener('click', (e) => {
                    const clickedTag = e.target.textContent.trim();
                    if (!searchInput.value.toLowerCase().includes(`#${clickedTag.toLowerCase()}`)) {
                        searchInput.value = `${searchInput.value} #${clickedTag}`.trim();
                        handleFilterChange();
                    }
                });
            });
        }
    }

    // --- 共通UI処理 ---
    // トップへ戻るボタン
    function setupToTopButton() {
        const toTopButton = document.getElementById('toTopButton');
        if (!toTopButton) return;

        window.addEventListener('scroll', () => {
            toTopButton.classList.toggle('show', window.scrollY > 300);
        });

        toTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});
