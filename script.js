const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const pluginList = document.getElementById('pluginList');
const sidebarTagList = document.getElementById('sidebarTagList');
const toTopButton = document.getElementById('toTopButton');
const sortOrderSelect = document.getElementById('sortOrder');
const pluginsPerPageSelect = document.getElementById('pluginsPerPage');
const paginationContainer = document.getElementById('pagination');
const gridButton = document.getElementById('gridButton');
const listButton = document.getElementById('listButton');
const refreshButton = document.getElementById('refreshButton');

let allPlugins = [];
let filteredPlugins = [];
let activeTags = new Set();
let allUniqueTags = new Set();
let currentPage = 1;
let currentPluginsPerPage = parseInt(pluginsPerPageSelect.value);

// プラグインデータを読み込む関数
async function fetchData() {
    try {
        // plugins.jsonを読み込む
        const pluginsResponse = await fetch('plugins.json');
        if (!pluginsResponse.ok) {
            throw new Error(`HTTP error! status: ${pluginsResponse.status} for plugins.json`);
        }
        const pluginsData = await pluginsResponse.json();
        allPlugins = pluginsData.map(plugin => ({
            ...plugin,
            createdAt: new Date(plugin.createdAt) // createdAtだけをDateオブジェクトに変換
        }));

        console.log("Plugins loaded:", allPlugins);

        createTagButtonsInSidebar(); // タグボタンを生成
        filterAndRenderPlugins(); // データ読み込み後に表示を更新
    } catch (error) {
        console.error("データの読み込みに失敗しました:", error);
        pluginList.innerHTML = '<p style="color: red; text-align: center;">データを読み込めませんでした。ファイルパスを確認してください。</p>';
    }
}

// プラグインカードを生成する関数
function createPluginCard(plugin) {
    const card = document.createElement('div');
    card.classList.add('plugin-card');
    card.dataset.tags = plugin.tags.join(',');

    // 更新日時を整形（createdAtを参照するように変更）
    const createdAtFormatted = plugin.createdAt.toLocaleDateString();

    card.innerHTML = `
        <div class="card-header">
            <h2>${plugin.name}</h2>
            <div class="tags">
                ${plugin.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </div>
        <p class="description-text">${plugin.description}</p>
        <div class="card-footer">
            <div class="info">
                更新: ${createdAtFormatted}
            </div>
            <div class="link">
                <a href="${plugin.url}" target="_blank" rel="noopener noreferrer">ダウンロード</a>
            </div>
        </div>
    `;
    return card;
}

// 全てのユニークなタグを収集してサイドバーにボタンを生成する関数
function createTagButtonsInSidebar() {
    allUniqueTags.clear();
    allPlugins.forEach(plugin => {
        plugin.tags.forEach(tag => allUniqueTags.add(tag.trim()));
    });

    sidebarTagList.innerHTML = '';

    const sortedTags = Array.from(allUniqueTags).sort();

    sortedTags.forEach(tag => {
        const button = document.createElement('button');
        button.textContent = tag;
        button.classList.add('tag-button');
        if (activeTags.has(tag.toLowerCase())) {
            button.classList.add('active');
        }
        button.addEventListener('click', () => {
            toggleTag(tag.toLowerCase(), button);
            updateSearchInputWithTags();
            filterAndRenderPlugins();
        });
        sidebarTagList.appendChild(button);
    });
}

// カード内のタグをクリックした時の処理
function addTagClickListeners() {
    document.querySelectorAll('.plugin-card .tag').forEach(tagSpan => {
        const oldListener = tagSpan.__clickListener;
        if (oldListener) {
            tagSpan.removeEventListener('click', oldListener);
        }

        const newListener = (event) => {
            const clickedTag = event.target.textContent.trim();
            let currentSearchText = searchInput.value;
            const existingTags = currentSearchText.toLowerCase().split(/\s+/).filter(term => term.startsWith('#')).map(t => t.substring(1));

            if (!existingTags.includes(clickedTag.toLowerCase())) {
                searchInput.value = (currentSearchText.trim() + ' #' + clickedTag).trim();
                filterAndRenderPlugins();
            }
        };
        tagSpan.addEventListener('click', newListener);
        tagSpan.__clickListener = newListener;
    });
}

function toggleTag(tag, button) {
    if (activeTags.has(tag)) {
        activeTags.delete(tag);
        if (button) button.classList.remove('active');
    } else {
        activeTags.add(tag);
        if (button) button.classList.add('active');
    }
}

function updateSearchInputWithTags() {
    let currentText = searchInput.value;
    let currentKeywords = [];
    currentText.split(/\s+/).forEach(term => {
        if (!term.startsWith('#') && term !== '') {
            currentKeywords.push(term);
        }
    });

    let newSearchText = currentKeywords.join(' ');
    if (newSearchText) {
        newSearchText += ' ';
    }
    newSearchText += Array.from(activeTags).map(tag => '#' + tag).join(' ');

    searchInput.value = newSearchText.trim();
}

// フィルター、ソート、ページネーションをまとめて処理し、レンダリングするメイン関数
function filterAndRenderPlugins() {
    let tempFilteredPlugins = allPlugins.filter(plugin => {
        const searchText = searchInput.value.toLowerCase().trim();
        const searchTerms = searchText.split(/\s+/).filter(term => term !== '');

        let matchesKeyword = true;
        let matchesTags = true;

        // キーワード検索のチェック
        if (searchText) {
            const pluginName = plugin.name.toLowerCase();
            const pluginDescription = plugin.description.toLowerCase();
            const pluginTagsLower = plugin.tags.map(tag => tag.toLowerCase());

            const keywords = searchTerms.filter(term => !term.startsWith('#'));
            const searchInputTags = searchTerms.filter(term => term.startsWith('#')).map(t => t.substring(1));

            if (keywords.length > 0) {
                matchesKeyword = keywords.every(kw => pluginName.includes(kw) || pluginDescription.includes(kw));
            }

            const combinedActiveTags = new Set([...activeTags, ...searchInputTags]);

            if (combinedActiveTags.size > 0) {
                matchesTags = Array.from(combinedActiveTags).every(tag => pluginTagsLower.includes(tag));
            } else {
                matchesTags = true;
            }
        }

        return matchesKeyword && matchesTags;
    });

    // ソート
    const sortOrder = sortOrderSelect.value;
    tempFilteredPlugins.sort((a, b) => {
        if (sortOrder === 'name-asc') {
            return a.name.localeCompare(b.name);
        } else if (sortOrder === 'name-desc') {
            return b.name.localeCompare(a.name);
        } else if (sortOrder === 'date-newest') {
            return b.createdAt.getTime() - a.createdAt.getTime(); // createdAtを参照
        } else if (sortOrder === 'date-oldest') {
            return a.createdAt.getTime() - b.createdAt.getTime(); // createdAtを参照
        }
        return 0;
    });

    filteredPlugins = tempFilteredPlugins;

    renderPlugins();
    renderPagination();
}

// プラグインをレンダリングする関数 (現在のページに基づいて)
function renderPlugins() {
    pluginList.classList.add('fade-out');

    setTimeout(() => {
        pluginList.innerHTML = '';

        let pluginsToDisplay = filteredPlugins;
        if (currentPluginsPerPage !== 'all') {
            const startIndex = (currentPage - 1) * currentPluginsPerPage;
            const endIndex = startIndex + currentPluginsPerPage;
            pluginsToDisplay = filteredPlugins.slice(startIndex, endIndex);
        }

        if (pluginsToDisplay.length === 0) {
            pluginList.innerHTML = '<p style="text-align: center; color: #ccc;">条件に合うプラグインは見つかりませんでした。</p>';
        } else {
            pluginsToDisplay.forEach(plugin => {
                pluginList.appendChild(createPluginCard(plugin));
            });
        }
        addTagClickListeners(); // 新しいカードにもリスナーを設定

        pluginList.classList.remove('fade-out');
        pluginList.classList.add('fade-in');
    }, 300);
}

// ページネーションをレンダリングする関数
function renderPagination() {
    paginationContainer.innerHTML = '';
    const totalPages = currentPluginsPerPage === 'all' ? 1 : Math.ceil(filteredPlugins.length / currentPluginsPerPage);

    if (totalPages <= 1 && currentPluginsPerPage !== 'all') {
        return;
    }

    const maxPageButtons = 5; // 表示するページボタンの最大数
    let startPage, endPage;

    if (totalPages <= maxPageButtons) {
        startPage = 1;
        endPage = totalPages;
    } else {
        startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
        endPage = Math.min(totalPages, currentPage + Math.floor(maxPageButtons / 2));

        if (endPage - startPage + 1 < maxPageButtons) {
            if (startPage === 1) {
                endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
            } else if (endPage === totalPages) {
                startPage = Math.max(1, totalPages - maxPageButtons + 1);
            }
        }
    }

    // Prevボタン
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Prev';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderPlugins();
            renderPagination();
            toTopButton.click(); // ページ切り替え時にトップへスクロール
        }
    });
    paginationContainer.appendChild(prevButton);

    // 最初のページ (必要なら)
    if (startPage > 1) {
        const firstPageButton = document.createElement('button');
        firstPageButton.textContent = '1';
        firstPageButton.addEventListener('click', () => {
            currentPage = 1;
            renderPlugins();
            renderPagination();
            toTopButton.click();
        });
        paginationContainer.appendChild(firstPageButton);
        if (startPage > 2) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            paginationContainer.appendChild(dots);
        }
    }

    // ページ番号ボタン
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        if (i === currentPage) {
            pageButton.classList.add('active');
        }
        pageButton.addEventListener('click', () => {
            currentPage = i;
            renderPlugins();
            renderPagination();
            toTopButton.click();
        });
        paginationContainer.appendChild(pageButton);
    }

    // 最後のページ (必要なら)
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            paginationContainer.appendChild(dots);
        }
        const lastPageButton = document.createElement('button');
        lastPageButton.textContent = totalPages;
        lastPageButton.addEventListener('click', () => {
            currentPage = totalPages;
            renderPlugins();
            renderPagination();
            toTopButton.click();
        });
        paginationContainer.appendChild(lastPageButton);
    }

    // Nextボタン
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderPlugins();
            renderPagination();
            toTopButton.click();
        }
    });
    paginationContainer.appendChild(nextButton);
}

// スクロール時のページトップボタン表示/非表示
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        toTopButton.classList.add('show');
    } else {
        toTopButton.classList.remove('show');
    }
});

// ページトップに戻るボタンのクリックイベント
toTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// イベントリスナーを設定するよ
searchButton.addEventListener('click', () => {
    currentPage = 1;
    filterAndRenderPlugins();
});

searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        currentPage = 1;
        filterAndRenderPlugins();
    }
});

sortOrderSelect.addEventListener('change', () => {
    currentPage = 1;
    filterAndRenderPlugins();
});

pluginsPerPageSelect.addEventListener('change', () => {
    currentPluginsPerPage = parseInt(pluginsPerPageSelect.value);
    currentPage = 1;
    filterAndRenderPlugins();
});

// グリッド/リスト表示切り替えボタンのイベントリスナー
gridButton.addEventListener('click', () => {
    pluginList.classList.remove('list-mode');
    gridButton.classList.add('active');
    listButton.classList.remove('active');
    renderPlugins(); // 表示モードが変わったときも再レンダリングする
});

listButton.addEventListener('click', () => {
    pluginList.classList.add('list-mode');
    listButton.classList.add('active');
    gridButton.classList.remove('active');
    renderPlugins(); // 表示モードが変わったときも再レンダリングする
});

// 更新ボタンのイベントリスナー
refreshButton.addEventListener('click', () => {
    console.log('Refresh button clicked! Reloading plugins data...');
    currentPage = 1; // データを再読み込みしたら、最初のページに戻る
    fetchData(); // プラグインデータを再読み込みする
});

// ページが読み込まれたら初期化するよ
document.addEventListener('DOMContentLoaded', () => {
    fetchData(); // プラグインデータを読み込む
    // 初期表示でグリッドモードをアクティブにする
    gridButton.classList.add('active');
});
