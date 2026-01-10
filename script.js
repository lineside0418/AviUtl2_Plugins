// ===================================================================================
// アプリケーション本体 - 強化版 (多言語対応)
// ===================================================================================

// 翻訳データ定義
const TRANSLATIONS = {
    ja: {
        nav: {
            plugins: 'プラグイン',
            scripts: 'スクリプト',
            favorites: 'お気に入り',
            install: '導入方法',
            info: '情報提供'
        },
        hero: {
            plugins: { title: 'プラグイン', subtitle: 'AviUtl2を拡張するプラグイン' },
            scripts: { title: 'スクリプト', subtitle: '作業を効率化するスクリプト' },
            favorites: { title: 'お気に入り', subtitle: '保存したアイテム一覧' },
            install: { title: '導入方法', subtitle: 'プラグインとスクリプトの基本的な導入手順' },
            info: { title: '情報提供', subtitle: 'コミュニティの力でAviUtl2をより良く' }
        },
        filter: {
            searchPlaceholder: 'キーワードで検索...',
            sort: {
                newest: '作成日時順',
                nameAsc: '名前順 (A-Z)',
                nameDesc: '名前順 (Z-A)'
            },
            viewGrid: 'グリッド表示',
            viewList: 'リスト表示',
            count: '件',
            itemsPerPage: '表示件数',
            pagePrev: '前へ',
            pageNext: '次へ',
            tagTitle: 'タグフィルター',
            searchMode: '検索モード:',
            noTags: 'タグがありません',
            noItems: 'アイテムが見つかりませんでした。',
            clearFilter: 'フィルターをクリア'
        },
        card: {
            download: 'ダウンロード',
            relatedLink: '関連リンク',
            noDescription: '説明がありません。'
        },
        info: {
            title: '新しい発見をシェアしよう',
            description: 'このサイトに掲載されていないプラグインやスクリプト、<br class="hidden sm:block">または情報の誤りを見つけた場合は、ぜひお知らせください。',
            button: '情報提供フォームへ',
            note: 'Googleフォームが開きます'
        },
        mobileWarning: 'このサイトはPCでの表示に最適化されています。続行しますか？',
        loading: '設定ファイルの読み込みに失敗しました',
        networkError: 'データの取得に失敗しました',
        favAdded: (name) => `「${name}」をお気に入りに追加しました`,
        favRemoved: (name) => `「${name}」をお気に入りから削除しました`,
        errorTitle: 'エラーが発生しました',
        reload: 'ページを再読み込み'
    },
    en: {
        nav: {
            plugins: 'Plugins',
            scripts: 'Scripts',
            favorites: 'Favorites',
            install: 'How to Install',
            info: 'Contribute'
        },
        hero: {
            plugins: { title: 'Plugins', subtitle: 'Extend AviUtl2 with plugins' },
            scripts: { title: 'Scripts', subtitle: 'Scripts to improve your workflow' },
            favorites: { title: 'Favorites', subtitle: 'Your saved items' },
            install: { title: 'How to Install', subtitle: 'Basic installation guide' },
            info: { title: 'Contribute', subtitle: 'Make AviUtl2 better together' }
        },
        filter: {
            searchPlaceholder: 'Search...',
            sort: {
                newest: 'Date Created',
                nameAsc: 'Name (A-Z)',
                nameDesc: 'Name (Z-A)'
            },
            viewGrid: 'Grid View',
            viewList: 'List View',
            count: 'items',
            itemsPerPage: 'Items per page',
            pagePrev: 'Prev',
            pageNext: 'Next',
            tagTitle: 'Tags',
            searchMode: 'Mode:',
            noTags: 'No tags',
            noItems: 'No items found.',
            clearFilter: 'Clear Filters'
        },
        card: {
            download: 'Download',
            relatedLink: 'Related Link',
            noDescription: 'No description available.'
        },
        info: {
            title: 'Share your discoveries',
            description: 'If you find plugins or scripts not listed here,<br class="hidden sm:block">or if you find any errors, please let us know.',
            button: 'Go to Form',
            note: 'Opens Google Forms'
        },
        mobileWarning: 'This site is optimized for PC. Do you want to continue?',
        loading: 'Failed to load configuration file',
        networkError: 'Failed to fetch data',
        favAdded: (name) => `Added "${name}" to favorites`,
        favRemoved: (name) => `Removed "${name}" from favorites`,
        errorTitle: 'An error occurred',
        reload: 'Reload Page'
    }
};

const App = {
    // 状態管理
    state: {
        currentPage: 'plugins',
        language: 'ja', // 'ja' or 'en'
        plugins: [],
        scripts: [],
        favorites: new Set(), // お気に入りIDのセット
        allTags: new Set(),
        isLoading: true,
        error: null,
        filters: {
            search: '',
            tags: new Set(),
            sort: 'newest', // 'newest', 'name-asc', 'name-desc'
        },
        pagination: {
            page: 1,
            limit: 12, // 12, 18, 24, 30
        },
        viewMode: 'grid',
        tagMode: 'or',
        isMobileMenuOpen: false,
        cache: {
            plugins: null,
            scripts: null,
            lastFetch: 0
        }
    },

    // キャッシュの有効期限 (5分)
    CACHE_DURATION: 5 * 60 * 1000,

    // DOM要素
    elements: {
        app: document.getElementById('app'),
        loader: document.getElementById('loader'),
        navLinks: document.querySelectorAll('.nav-link'),
        header: document.getElementById('header'),
        mobileMenu: document.getElementById('mobile-menu'),
        mobileMenuBtn: document.getElementById('mobile-menu-btn'),
        toastContainer: document.getElementById('toast-container'),
    },

    // 初期化
    async init() {
        this.loadSettings(); // 言語設定などをロード
        this.loadFavorites();
        this.setupMobileMenu();
        this.injectLanguageButton(); // 言語切り替えボタンを注入
        
        // モバイル警告
        const t = this.getT();
        const isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile && !sessionStorage.getItem('mobile_warned')) {
            setTimeout(() => {
                if (!window.confirm(t.mobileWarning)) {
                   // 戻る動作等はここ
                } else {
                    sessionStorage.setItem('mobile_warned', 'true');
                }
            }, 100);
        }
        
        this.config = await this.fetchConfig();
        // ★ 3. 初期ロード時に現在の言語のMarkdownを読み込む
        const installFile = this.state.currentLang === 'en' ? 'how_to_install_en.md' : 'how_to_install.md';
        this.howToInstallMarkdown = await this.fetchMarkdown(installFile);

        this.elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.dataset.page;
                if (page) {
                    this.navigate(page);
                    if (this.state.isMobileMenuOpen) this.toggleMobileMenu(false);
                }
            });
        });

        // 言語切り替えボタンのイベントリスナー
        if (this.elements.langToggleBtnGroup) {
            this.elements.langBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    this.switchLanguage(btn.dataset.lang);
                });
            });
        }
        
        // 初期ロード時にボタンのスタイルを更新
        this.updateLangButtonStyles();

        window.addEventListener('popstate', () => {
            this.navigate(this.getCurrentPageFromURL(), false);
        });

        // 初回ロード
        await this.fetchData();
        const page = this.getCurrentPageFromURL();
        this.navigate(page, false);
        
        this.addEventListeners();
        this.updateLanguageUI(); // 初回のUI言語反映
    },

    // 翻訳ヘルパー
    getT() {
        return TRANSLATIONS[this.state.language];
    },

    // 設定読み込み (言語)
    loadSettings() {
        const savedLang = localStorage.getItem('aviutl2_hub_language');
        if (savedLang && ['ja', 'en'].includes(savedLang)) {
            this.state.language = savedLang;
        } else {
            // ブラウザの言語設定を検出
            const browserLang = (navigator.language || navigator.userLanguage).substring(0, 2);
            this.state.language = browserLang === 'ja' ? 'ja' : 'en';
        }
    },

    // 言語切り替え
    toggleLanguage() {
        this.state.language = this.state.language === 'ja' ? 'en' : 'ja';
        localStorage.setItem('aviutl2_hub_language', this.state.language);
        this.updateLanguageUI();
        this.render(); // コンテンツ再描画
    },

    // 言語切り替えボタンをヘッダーに追加
    injectLanguageButton() {
        // デスクトップ用
        const desktopNav = this.elements.header.querySelector('.hidden.md\\:flex');
        if (desktopNav) {
            const btn = document.createElement('button');
            btn.id = 'lang-toggle-desktop';
            btn.className = 'ml-4 px-3 py-1 rounded-full border border-white/20 text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-colors';
            btn.onclick = () => this.toggleLanguage();
            desktopNav.appendChild(btn);
        }

        // モバイルメニュー用
        const mobileMenu = this.elements.mobileMenu.querySelector('div'); // .px-4.py-2.space-y-1
        if (mobileMenu) {
            const container = document.createElement('div');
            container.className = 'pt-4 mt-4 border-t border-white/10';
            const btn = document.createElement('button');
            btn.id = 'lang-toggle-mobile';
            btn.className = 'w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/10';
            btn.onclick = () => {
                this.toggleLanguage();
                this.toggleMobileMenu(false);
            };
            container.appendChild(btn);
            mobileMenu.appendChild(container);
        }
    },

    // UIのテキストを現在の言語に合わせて更新（静的な部分）
    updateLanguageUI() {
        const t = this.getT();
        
        // 言語ボタンのテキスト更新
        const desktopBtn = document.getElementById('lang-toggle-desktop');
        const mobileBtn = document.getElementById('lang-toggle-mobile');
        const label = this.state.language === 'ja' ? 'EN' : 'JP'; // 現在がJAならENへの切り替えを表示
        const mobileLabel = this.state.language === 'ja' ? 'English' : '日本語';

        if (desktopBtn) desktopBtn.textContent = label;
        if (mobileBtn) mobileBtn.textContent = mobileLabel;

        // ナビゲーションリンクの更新
        this.elements.navLinks.forEach(link => {
            const page = link.dataset.page;
            // ロゴ（親要素がtext-2xlのもの）は翻訳対象外にする
            if (link.parentElement.classList.contains('text-2xl')) {
                return;
            }
            if (page && t.nav[page]) {
                link.textContent = t.nav[page];
            }
        });
    },

    // 設定読み込み
    async fetchConfig() {
        try {
            const res = await fetch('config.json');
            if (!res.ok) throw new Error('config.jsonが見つかりません。');
            return await res.json();
        } catch (error) {
            console.error('設定ファイルの読み込みに失敗しました:', error);
            this.showToast(this.getT().loading, 'error');
            return null;
        }
    },

    // Markdown読み込み
    async fetchMarkdown(file) {
        try {
            const res = await fetch(file);
            if (!res.ok) throw new Error(`${file}の読み込みに失敗しました。`);
            return await res.text();
        } catch (error) {
            console.error('Markdownファイルの読み込みに失敗しました:', error);
            return '# Error\n\nFailed to load content.';
        }
    },

    // URLハッシュからページ取得
    getCurrentPageFromURL() {
        const hash = window.location.hash.replace('#', '');
        return ['plugins', 'scripts', 'favorites', 'install', 'info'].includes(hash) ? hash : 'plugins';
    },

    // ページ遷移（アニメーション付き）
    navigate(page, pushState = true) {
        if (this.state.currentPage === page && !this.state.isLoading) return;

        window.scrollTo({ top: 0, behavior: 'smooth' });

        const appElement = this.elements.app;
        
        // フェードアウト
        appElement.style.opacity = '0';
        appElement.style.transform = 'translateY(10px)';
        appElement.style.transition = 'opacity 0.2s ease, transform 0.2s ease';

        setTimeout(() => {
            this.state.currentPage = page;
            this.state.pagination.page = 1; // ページ遷移時は1ページ目に戻す

            if (pushState) {
                history.pushState({ page }, '', `#${page}`);
            }
            
            this.render();
            
            // フェードイン
            requestAnimationFrame(() => {
                appElement.style.opacity = '1';
                appElement.style.transform = 'translateY(0)';
            });
        }, 250);
    },

    // モバイルメニューのセットアップ
    setupMobileMenu() {
        this.elements.mobileMenuBtn.addEventListener('click', () => {
            this.toggleMobileMenu(!this.state.isMobileMenuOpen);
        });
    },

    toggleMobileMenu(isOpen) {
        this.state.isMobileMenuOpen = isOpen;
        if (isOpen) {
            this.elements.mobileMenu.classList.remove('hidden');
            // 少し待ってからクラス追加でアニメーションさせる
            setTimeout(() => this.elements.mobileMenu.classList.add('open'), 10);
        } else {
            this.elements.mobileMenu.classList.remove('open');
            setTimeout(() => this.elements.mobileMenu.classList.add('hidden'), 300);
        }
    },

    // データ取得（キャッシュ機能付き）
    async fetchData() {
        this.state.isLoading = true;
        this.updateLoader(true);

        // コンフィグ未ロード時
        if (!this.config) {
            this.config = await this.fetchConfig();
            if (!this.config) {
                 this.state.error = 'Config Error';
                 this.updateLoader(false);
                 this.render();
                 return;
            }
        }

        // キャッシュチェック
        const now = Date.now();
        if (this.state.cache.plugins && (now - this.state.cache.lastFetch < this.CACHE_DURATION)) {
            // console.log("Using cached data");
            this.state.plugins = this.state.cache.plugins;
            this.state.scripts = this.state.cache.scripts;
            this.processTags();
            this.state.isLoading = false;
            this.updateLoader(false);
            this.render();
            return;
        }

        if (!this.config.microCMSServiceDomain || this.config.microCMSServiceDomain === 'YOUR_SERVICE_DOMAIN') {
            this.state.error = 'microCMSの設定が完了していません。config.jsonを編集してください。';
            this.updateLoader(false);
            this.render();
            return;
        }

        const headers = { 'X-MICROCMS-API-KEY': this.config.microCMSApiKey };
        const baseUrl = `https://${this.config.microCMSServiceDomain}.microcms.io/api/v1`;

        try {
            const [pluginsRes, scriptsRes] = await Promise.all([
                fetch(`${baseUrl}/plugins?limit=100`, { headers }),
                fetch(`${baseUrl}/scripts?limit=100`, { headers }),
            ]);

            if (!pluginsRes.ok) throw new Error('Failed to fetch plugins');
            if (!scriptsRes.ok) throw new Error('Failed to fetch scripts');

            const pluginsData = await pluginsRes.json();
            const scriptsData = await scriptsRes.json();
            
            // microCMSのレスポンスにはidが含まれていることを前提とする
            this.state.plugins = pluginsData.contents;
            this.state.scripts = scriptsData.contents;
            
            // キャッシュ更新
            this.state.cache.plugins = pluginsData.contents;
            this.state.cache.scripts = scriptsData.contents;
            this.state.cache.lastFetch = now;

            this.processTags();
            this.state.error = null;
        } catch (error) {
            console.error('Fetch error:', error);
            const t = this.getT();
            this.state.error = t.networkError;
            this.showToast(t.networkError, 'error');
        } finally {
            this.state.isLoading = false;
            this.updateLoader(false);
            this.render();
        }
    },

    processTags() {
        const tags = new Set();
        [...this.state.plugins, ...this.state.scripts].forEach(item => {
            const itemTags = item.tags ? item.tags.split(',').map(tag => tag.trim()) : [];
            itemTags.forEach(tag => tags.add(tag));
        });
        this.state.allTags = tags;
    },

    updateLoader(isLoading) {
        const loader = this.elements.loader;
        if (isLoading) {
            loader.style.visibility = 'visible';
            loader.style.opacity = '1';
        } else {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.visibility = 'hidden';
            }, 500);
        }
    },

    // お気に入り機能
    loadFavorites() {
        try {
            const saved = localStorage.getItem('aviutl2_hub_favorites');
            if (saved) {
                this.state.favorites = new Set(JSON.parse(saved));
            }
        } catch (e) {
            console.error('Failed to load favorites', e);
        }
    },

    saveFavorites() {
        try {
            localStorage.setItem('aviutl2_hub_favorites', JSON.stringify([...this.state.favorites]));
        } catch (e) {
            console.error('Failed to save favorites', e);
        }
    },

    toggleFavorite(id, name) {
        const t = this.getT();
        if (this.state.favorites.has(id)) {
            this.state.favorites.delete(id);
            this.showToast(t.favRemoved(name));
        } else {
            this.state.favorites.add(id);
            this.showToast(t.favAdded(name), 'success');
        }
        this.saveFavorites();
        
        // UI更新
        const btns = document.querySelectorAll(`.fav-btn[data-id="${id}"]`);
        btns.forEach(btn => {
            btn.classList.toggle('active', this.state.favorites.has(id));
            const icon = btn.querySelector('svg');
            if (icon) icon.setAttribute('fill', this.state.favorites.has(id) ? 'currentColor' : 'none');
        });

        if (this.state.currentPage === 'favorites') {
            this.renderItems();
        }
    },

    // 通知トースト
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type === 'error' ? 'toast-error' : type === 'success' ? 'toast-success' : ''}`;
        
        let icon = '';
        if (type === 'success') icon = '<svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
        else if (type === 'error') icon = '<svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
        else icon = '<svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';

        toast.innerHTML = `${icon}<span>${message}</span>`;
        
        this.elements.toastContainer.appendChild(toast);
        
        requestAnimationFrame(() => toast.classList.add('show'));
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    },

    // レンダリング
    render() {
        this.updateLanguageUI(); // 静的要素の更新

        // ナビゲーションのアクティブ状態
        this.elements.navLinks.forEach(link => {
            const page = link.dataset.page;
            const isActive = page === this.state.currentPage;
            
            if (isActive) {
                link.classList.add('text-white', 'bg-white/10');
                link.classList.remove('text-gray-300');
            } else {
                link.classList.remove('text-white', 'bg-white/10');
                link.classList.add('text-gray-300');
            }
        });

        if (this.state.error) {
            this.elements.app.innerHTML = this.templates.error.call(this, this.state.error);
            return;
        }

        const t = this.getT();
        let content = '';
        const lang = this.state.currentLang;
        const dict = this.i18n[lang];

        switch (this.state.currentPage) {
            case 'plugins':
                content = this.templates.itemsPage.call(this, t.hero.plugins.title, t.hero.plugins.subtitle, this.state.plugins);
                break;
            case 'scripts':
                content = this.templates.itemsPage.call(this, t.hero.scripts.title, t.hero.scripts.subtitle, this.state.scripts);
                break;
            case 'favorites':
                const allItems = [...this.state.plugins, ...this.state.scripts];
                const favItems = allItems.filter(item => this.state.favorites.has(item.id));
                content = this.templates.itemsPage.call(this, t.hero.favorites.title, t.hero.favorites.subtitle, favItems, true);
                break;
            case 'install':
                content = this.templates.installPage.call(this);
                break;
            case 'info':
                content = this.templates.infoPage.call(this);
                break;
        }
        this.elements.app.innerHTML = content;
        
        if (['plugins', 'scripts', 'favorites'].includes(this.state.currentPage)) {
            this.renderItems();
        }
    },

    renderItems() {
        const t = this.getT();
        let items;
        if (this.state.currentPage === 'plugins') items = this.state.plugins;
        else if (this.state.currentPage === 'scripts') items = this.state.scripts;
        else if (this.state.currentPage === 'favorites') {
             const allItems = [...this.state.plugins, ...this.state.scripts];
             items = allItems.filter(item => this.state.favorites.has(item.id));
        }

        // フィルタリング
        let filteredItems = items.filter(item => {
            const searchLower = this.state.filters.search.toLowerCase();
            
            // 検索対象の説明文を言語に合わせて選択
            let description = item.description;
            if (this.state.language === 'en') {
                description = item.description_en || item.description;
            }

            const searchMatch = (item.name?.toLowerCase() || '').includes(searchLower) ||
                                (description?.toLowerCase() || '').includes(searchLower);
            
            const itemTags = new Set(item.tags ? item.tags.split(',').map(tag => tag.trim()) : []);

            let tagMatch = false;
            if (this.state.filters.tags.size === 0) {
                tagMatch = true;
            } else {
                if (this.state.tagMode === 'or') {
                    tagMatch = [...this.state.filters.tags].some(tag => itemTags.has(tag));
                } else {
                    tagMatch = [...this.state.filters.tags].every(tag => itemTags.has(tag));
                }
            }
            return searchMatch && tagMatch;
        });

        // ソート
        if (this.state.filters.sort === 'name-asc') {
            filteredItems.sort((a, b) => a.name.localeCompare(b.name, this.state.language));
        } else if (this.state.filters.sort === 'name-desc') {
            filteredItems.sort((a, b) => b.name.localeCompare(a.name, this.state.language));
        } else if (this.state.filters.sort === 'newest') {
            // 作成日時順 (publishedAt または createdAt を使用)
            filteredItems.sort((a, b) => {
                const dateA = new Date(a.publishedAt || a.createdAt || 0);
                const dateB = new Date(b.publishedAt || b.createdAt || 0);
                return dateB - dateA;
            });
        }
        
        // ページネーション処理
        const totalItems = filteredItems.length;
        const totalPages = Math.ceil(totalItems / this.state.pagination.limit);
        
        // 現在のページが範囲外にならないように調整
        if (this.state.pagination.page > totalPages) {
            this.state.pagination.page = Math.max(1, totalPages);
        }
        
        const startIndex = (this.state.pagination.page - 1) * this.state.pagination.limit;
        const endIndex = startIndex + this.state.pagination.limit;
        const pageItems = filteredItems.slice(startIndex, endIndex);

        const itemsListElement = document.getElementById('items-list');
        const countElement = document.getElementById('items-count');
        
        if (countElement) {
            // 表示件数切り替えUIを含める
            countElement.innerHTML = `
                <div class="flex items-center gap-4 w-full justify-between">
                    <span>${totalItems} ${t.filter.count}</span>
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-400 hidden sm:inline">${t.filter.itemsPerPage}:</span>
                        <select id="items-per-page" class="bg-black/40 border border-white/10 text-gray-300 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5">
                            <option value="12" ${this.state.pagination.limit === 12 ? 'selected' : ''}>12</option>
                            <option value="18" ${this.state.pagination.limit === 18 ? 'selected' : ''}>18</option>
                            <option value="24" ${this.state.pagination.limit === 24 ? 'selected' : ''}>24</option>
                            <option value="30" ${this.state.pagination.limit === 30 ? 'selected' : ''}>30</option>
                        </select>
                    </div>
                </div>
            `;
        }

        if (itemsListElement) {
            itemsListElement.className = this.state.viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'flex flex-col gap-4';
                
            if (pageItems.length > 0) {
                itemsListElement.innerHTML = pageItems.map(item => this.templates.itemCard.call(this, item, this.state.viewMode)).join('');
                
                // ページネーションコントロールの追加
                if (totalPages > 1) {
                    const paginationHtml = `
                        <div class="col-span-full flex justify-center items-center gap-4 mt-8">
                            <button class="pagination-btn px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors" 
                                data-action="prev" ${this.state.pagination.page === 1 ? 'disabled' : ''}>
                                ${t.filter.pagePrev}
                            </button>
                            <span class="text-gray-400 font-mono">${this.state.pagination.page} / ${totalPages}</span>
                            <button class="pagination-btn px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors" 
                                data-action="next" ${this.state.pagination.page === totalPages ? 'disabled' : ''}>
                                ${t.filter.pageNext}
                            </button>
                        </div>
                    `;
                    // itemsListElementの外に追加したいが、構造上リストの最後に追加する形にするか、親要素に追加するか
                    // ここではリストの直後に追加するために親要素に対して操作するのではなく、リスト内に専用のコンテナを置くか、
                    // itemsPageテンプレート側で予めプレースホルダーを用意するのが綺麗だが、今回はinnerHTMLに追加する
                    // gridの場合は col-span-full で対応
                    itemsListElement.insertAdjacentHTML('beforeend', paginationHtml);
                }
            } else {
                itemsListElement.innerHTML = `
                    <div class="col-span-full py-20 text-center glassmorphism rounded-xl border-dashed border-2 border-gray-700">
                        <svg class="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <p class="text-gray-400 text-lg">${t.filter.noItems}</p>
                        <button onclick="App.clearFilters()" class="mt-4 text-blue-400 hover:text-blue-300 underline">${t.filter.clearFilter}</button>
                    </div>`;
            }
        }
    },
    
    clearFilters() {
        this.state.filters.search = '';
        this.state.filters.tags.clear();
        const searchInput = document.getElementById('search-input');
        if(searchInput) searchInput.value = '';
        this.updateTagStyles();
        this.renderItems();
    },

    // イベントリスナー
    addEventListeners() {
        document.getElementById('app').addEventListener('input', (e) => {
            if (e.target.id === 'search-input') {
                this.state.filters.search = e.target.value;
                this.state.pagination.page = 1; // 検索時は1ページ目に戻す
                this.renderItems();
            }
        });

        document.getElementById('app').addEventListener('change', (e) => {
            if (e.target.id === 'sort-select') {
                this.state.filters.sort = e.target.value;
                this.renderItems();
            }
            if (e.target.id === 'items-per-page') {
                this.state.pagination.limit = parseInt(e.target.value);
                this.state.pagination.page = 1; // 件数変更時は1ページ目に戻す
                this.renderItems();
            }
        });

        document.getElementById('app').addEventListener('change', (e) => {
            if (e.target.id === 'sort-select') {
                this.state.filters.sort = e.target.value;
                this.renderItems();
            }
            if (e.target.id === 'items-per-page') {
                this.state.pagination.limit = parseInt(e.target.value);
                this.state.pagination.page = 1; // 件数変更時は1ページ目に戻す
                this.renderItems();
            }
            // ★ 新機能: チェックボックスの入力（非表示のチェックボックスが直接操作された場合）
            if (e.target.classList.contains('item-checkbox')) {
                const itemId = e.target.value;
                if (e.target.checked) {
                    this.state.selectedItems.add(itemId);
                } else {
                    this.state.selectedItems.delete(itemId);
                }
                this.renderItems(); // ★ 見た目の更新のために再描画
                this.updateBatchActionButtons(); // 選択数の更新
            }
        });

        document.getElementById('app').addEventListener('click', (e) => {
            // ページネーション
            const paginationBtn = e.target.closest('.pagination-btn');
            if (paginationBtn) {
                const action = paginationBtn.dataset.action;
                if (action === 'prev') {
                    this.state.pagination.page--;
                } else if (action === 'next') {
                    this.state.pagination.page++;
                }
                // スクロールトップ
                const listTop = document.getElementById('items-list').offsetTop - 120;
                window.scrollTo({ top: listTop, behavior: 'smooth' });
                this.renderItems();
            }

            // タグフィルター
            const tagEl = e.target.closest('.tag-filter');
            if (tagEl) {
                const tag = tagEl.dataset.tag;
                if (this.state.filters.tags.has(tag)) {
                    this.state.filters.tags.delete(tag);
                } else {
                    this.state.filters.tags.add(tag);
                }
                this.state.pagination.page = 1; // フィルター変更時は1ページ目に戻す
                this.updateTagStyles();
                this.renderItems();
            }
            
            // お気に入りボタン
            const favBtn = e.target.closest('.fav-btn');
            if (favBtn) {
                e.preventDefault();
                e.stopPropagation();
                const id = favBtn.dataset.id;
                const name = favBtn.dataset.name;
                this.toggleFavorite(id, name);
            }
            
            // 表示モード切り替え
            if (e.target.closest('#view-grid')) {
                this.state.viewMode = 'grid';
                this.updateViewModeButtons();
                this.renderItems();
            }
            if (e.target.closest('#view-list')) {
                this.state.viewMode = 'list';
                this.updateViewModeButtons();
                this.renderItems();
            }

            // リロード
            if (e.target.closest('#reload-button')) {
                this.fetchData();
            }

            // タグモード切り替え
            if (e.target.closest('#tag-mode-or')) {
                this.state.tagMode = 'or';
                this.updateTagModeButtons();
                this.renderItems();
            }
            if (e.target.closest('#tag-mode-and')) {
                this.state.tagMode = 'and';
                this.updateTagModeButtons();
                this.renderItems();
            }

            // 詳細ボタンの処理
            const detailBtn = e.target.closest('.detail-link');
            if (detailBtn) {
                e.preventDefault();
                const url = detailBtn.dataset.url;
                if (url && url !== '#' && url !== '') {
                    // URLがある場合は新しいタブで開く
                    window.open(url, '_blank');
                } else {
                    // URLがない場合はカスタムモーダルを表示
                    this.showModal();
                }
            }
            
            // ダウンロードボタンの処理
            const downloadBtn = e.target.closest('.download-link');
            if (downloadBtn) {
                e.preventDefault();
                const url = downloadBtn.dataset.url;
                if (url && url !== '#' && url !== '') {
                    // URLがある場合は新しいタブで開く
                    window.open(url, '_blank');
                } else {
                    // URLがない場合はカスタムモーダルを表示 (ダウンロード情報なし)
                    this.showModal();
                }
            }
            
            // ★ 新機能: 一括ダウンロードボタン
            const batchDownloadBtn = e.target.closest('#batch-download-btn');
            if (batchDownloadBtn) {
                App.batchOpenLinks('download');
            }
            
            // ★ 新機能: 一括詳細ボタン
            const batchDetailBtn = e.target.closest('#batch-detail-btn');
            if (batchDetailBtn) {
                App.batchOpenLinks('detail');
            }
            
            // ★ 新機能: すべて選択/選択解除ボタン
            const selectAllBtn = e.target.closest('#select-all-btn');
            if (selectAllBtn) {
                App.toggleSelectAll(true);
            }
            
            const deselectAllBtn = e.target.closest('#deselect-all-btn');
            if (deselectAllBtn) {
                App.toggleSelectAll(false);
            }
        });
    },
    
    // ★ 新機能: 一括リンクオープン処理
    batchOpenLinks(type) {
        const itemIds = Array.from(this.state.selectedItems);
        const allItems = [...this.state.plugins, ...this.state.scripts];
        
        let validLinkCount = 0;

        itemIds.forEach(id => {
            // microCMSのIDはstringなので、== で比較
            const item = allItems.find(i => i.id == id);
            if (item) {
                let url;
                if (type === 'download') {
                    url = item.url;
                } else if (type === 'detail') {
                    url = item.rel_link;
                }
                
                if (url && url !== '#' && url !== '') {
                    window.open(url, '_blank');
                    validLinkCount++;
                }
            }
        });

        // リンクがないアイテムが選択されていた場合や、すべて開けた場合に通知
        if (validLinkCount === 0 && itemIds.length > 0) {
            // すべてリンクがない場合はモーダルを表示
            this.showModal();
        } else if (validLinkCount > 0) {
            // すべて開いた後に選択状態をリセット
            this.state.selectedItems.clear();
            this.renderItems();
            this.updateBatchActionButtons();
        }
    },
    
    // ★ 新機能: すべて選択/選択解除
    toggleSelectAll(select) {
        const itemsListElement = document.getElementById('items-list');
        if (!itemsListElement) return;

        // 現在画面に表示されているアイテムのIDを取得
        const visibleItemCards = itemsListElement.querySelectorAll('.item-card');
        
        visibleItemCards.forEach(card => {
            const id = card.dataset.id; 
            if (id) {
                 if (select) {
                    this.state.selectedItems.add(id);
                } else {
                    this.state.selectedItems.delete(id);
                }
            }
        });

        // チェックボックスの状態をDOMに反映（再描画）
        this.renderItems();
        this.updateBatchActionButtons();
    },

    updateTagStyles() {
        // renderItemsでスタイルはほぼ設定されているが、ここではhoverの再適用などを行う
        document.querySelectorAll('.tag-filter').forEach(tagEl => {
            const tag = tagEl.dataset.tag;
            const isActive = this.state.filters.tags.has(tag);
            
            tagEl.className = `tag-filter text-xs font-medium px-3 py-1 rounded-full transition-all duration-200 border cursor-pointer select-none
                ${isActive 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-400 hover:text-gray-200'}`;
        });
    },

    updateViewModeButtons() {
        const gridBtn = document.getElementById('view-grid');
        const listBtn = document.getElementById('view-list');
        if (gridBtn && listBtn) {
            gridBtn.className = `p-2 rounded-lg transition-colors ${this.state.viewMode === 'grid' ? 'bg-blue-600/80 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`;
            listBtn.className = `p-2 rounded-lg transition-colors ${this.state.viewMode === 'list' ? 'bg-blue-600/80 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`;
        }
    },

    updateTagModeButtons() {
        const orBtn = document.getElementById('tag-mode-or');
        const andBtn = document.getElementById('tag-mode-and');
        if (orBtn && andBtn) {
            orBtn.className = `text-xs font-bold px-3 py-1 rounded transition-colors ${this.state.tagMode === 'or' ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-500 hover:bg-white/20'}`;
            andBtn.className = `text-xs font-bold px-3 py-1 rounded transition-colors ${this.state.tagMode === 'and' ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-500 hover:bg-white/20'}`;
        }
    },

    // HTMLテンプレート
    templates: {
        hero(title, subtitle) {
            return `
                <section class="text-center py-12 sm:py-20 relative">
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/10 blur-3xl -z-10 rounded-full pointer-events-none"></div>
                    <h1 class="text-4xl sm:text-6xl font-bold tracking-tighter text-white mb-4 drop-shadow-lg">${title}</h1>
                    <p class="text-lg text-gray-400 max-w-2xl mx-auto px-4">${subtitle}</p>
                </section>
            `;
        },
        itemsPage(title, subtitle, items, isFavorites = false) {
            const t = this.getT();
            const allTagsSorted = [...App.state.allTags].sort();

            return `
                ${App.templates.hero(title, subtitle)}
                
                <div class="flex flex-col lg:flex-row gap-8 items-start">
                    <!-- メインコンテンツ -->
                    <div class="w-full lg:w-3/4 order-2 lg:order-1">
                        <!-- コントロールバー -->
                        <div class="glassmorphism p-4 mb-6 sticky top-20 z-40 rounded-xl flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xl">
                            
                            <!-- 検索バー -->
                            <div class="relative w-full sm:flex-1 group">
                                <input id="search-input" type="text" placeholder="${t.filter.searchPlaceholder}" 
                                    value="${App.state.filters.search}" 
                                    class="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white placeholder-gray-500">
                                <svg class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" /></svg>
                            </div>

                            <!-- ツール類 -->
                            <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
                                <!-- ソート -->
                                <select id="sort-select" class="bg-black/40 border border-white/10 text-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5">
                                    <option value="newest" ${App.state.filters.sort === 'newest' ? 'selected' : ''}>${t.filter.sort.newest}</option>
                                    <option value="default" ${App.state.filters.sort === 'default' ? 'selected' : ''}>${t.filter.sort.default}</option>
                                    <option value="name-asc" ${App.state.filters.sort === 'name-asc' ? 'selected' : ''}>${t.filter.sort.nameAsc}</option>
                                    <option value="name-desc" ${App.state.filters.sort === 'name-desc' ? 'selected' : ''}>${t.filter.sort.nameDesc}</option>
                                </select>

                                <!-- 表示切り替え -->
                                <div class="flex bg-black/40 rounded-lg p-1 border border-white/10">
                                    <button id="view-grid" class="p-2 rounded-lg transition-colors ${App.state.viewMode === 'grid' ? 'bg-blue-600/80 text-white' : 'text-gray-400 hover:text-white'}" title="${t.filter.viewGrid}">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                                    </button>
                                    <button id="view-list" class="p-2 rounded-lg transition-colors ${App.state.viewMode === 'list' ? 'bg-blue-600/80 text-white' : 'text-gray-400 hover:text-white'}" title="${t.filter.viewList}">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- 件数表示 -->
                        <div id="items-count" class="flex justify-between items-center mb-4 px-2 text-sm text-gray-400 font-mono">
                            Loading...
                        </div>
                        
                        <!-- アイテムリスト -->
                        <div id="items-list" class="min-h-[200px]">
                            <!-- JSで描画 -->
                        </div>

                    </div>

                    <!-- サイドバー（フィルタ） -->
                    <aside class="w-full lg:w-1/4 order-1 lg:order-2">
                        <div class="glassmorphism p-5 rounded-xl sticky top-24 border border-white/10">
                            <div class="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
                                <h3 class="font-bold text-white flex items-center gap-2">
                                    <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                                    ${t.filter.tagTitle}
                                </h3>
                                <button id="reload-button" title="${t.filter.reload}" class="text-gray-500 hover:text-white transition-all hover:rotate-180 p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/></svg>
                                </button>
                            </div>
                            
                            <div class="flex items-center justify-between mb-4 bg-black/20 p-2 rounded-lg">
                                <span class="text-xs text-gray-400">${t.filter.searchMode}</span>
                                <div class="flex gap-1">
                                    <button id="tag-mode-or" class="text-xs font-bold px-3 py-1 rounded transition-colors ${App.state.tagMode === 'or' ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-500 hover:bg-white/20'}">OR</button>
                                    <button id="tag-mode-and" class="text-xs font-bold px-3 py-1 rounded transition-colors ${App.state.tagMode === 'and' ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-500 hover:bg-white/20'}">AND</button>
                                </div>
                            </div>

                            <div class="flex flex-wrap gap-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                ${allTagsSorted.length > 0 ? allTagsSorted.map(tag => `
                                    <button class="tag-filter text-xs font-medium px-3 py-1 rounded-full transition-all duration-200 border cursor-pointer select-none
                                        ${App.state.filters.tags.has(tag)
                                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30'
                                            : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-400 hover:text-gray-200'}"
                                        data-tag="${tag}">
                                        ${tag}
                                    </button>
                                `).join('') : `<p class="text-gray-500 text-sm">${t.filter.noTags}</p>`}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },
        itemCard(item, viewMode) {
            const t = this.getT();
            const itemTags = item.tags ? item.tags.split(',').map(tag => tag.trim()) : [];
            const tagsHtml = itemTags.map(tag => `<span class="bg-black/30 text-gray-300 text-[10px] px-2 py-0.5 rounded border border-white/5 whitespace-nowrap">${tag}</span>`).join('') || '';
            const isFav = App.state.favorites.has(item.id);
            
            // アイコン画像がない場合のフォールバック（名前の頭文字）
            const iconHtml = item.icon 
                ? `<img src="${item.icon}" alt="${item.name}" class="w-10 h-10 rounded-lg object-cover bg-gray-800">`
                : `<div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-900 to-gray-800 flex items-center justify-center text-white font-bold text-lg">${item.name.charAt(0)}</div>`;

            // 説明文の取得ロジック（英語モードかつdescription_enがある場合のみ英語を使用）
            let description = item.description;
            if (App.state.language === 'en') {
                description = item.description_en || item.description;
            }

            // 関連リンクボタンのHTML生成
            const relLinkHtml = item.rel_link ? `
                <a href="${item.rel_link}" target="_blank" rel="noopener noreferrer" class="btn bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition-all border border-white/10" title="${t.card.relatedLink}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                    <span class="${viewMode === 'grid' ? 'hidden xl:inline' : 'inline'}">${t.card.relatedLink}</span>
                </a>
            ` : '';

            if (viewMode === 'grid') {
                return `
                <div class="item-card glassmorphism h-full flex flex-col group">
                    <div class="p-5 flex flex-col h-full">
                        <div class="flex justify-between items-start mb-3">
                            <div class="flex items-center gap-3">
                                ${iconHtml}
                                <h3 class="text-lg font-bold text-white leading-tight line-clamp-2">${item.name}</h3>
                            </div>
                            <button class="fav-btn p-1.5 rounded-full hover:bg-white/10 transition-colors ${isFav ? 'active' : 'text-gray-500'}" data-id="${item.id}" data-name="${item.name}" title="${t.hero.favorites.title}">
                                <svg class="w-5 h-5" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                            </button>
                        </div>
                        
                        <div class="flex flex-wrap gap-2 mb-4">
                            ${tagsHtml}
                        </div>

                        <p class="text-sm text-gray-300 flex-grow mb-4 leading-relaxed line-clamp-3">${description || t.card.noDescription}</p>
                        
                        <div class="mt-auto pt-4 border-t border-white/5 flex gap-2">
                             ${relLinkHtml}
                             <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary flex-1 text-center text-white font-semibold py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2 group-hover:gap-3 transition-all">
                                <span>${t.card.download}</span>
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                            </a>
                        </div>
                    </div>
                </div>
                `;
            } else { // list view
                return `
                <div class="item-card glassmorphism group">
                    <div class="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                         <div class="flex-shrink-0">
                             ${iconHtml}
                         </div>
                        
                        <div class="flex-grow min-w-0">
                            <div class="flex items-center gap-2 mb-1">
                                <h3 class="text-lg font-bold text-white truncate">${item.name}</h3>
                                <button class="fav-btn ml-2 p-1 rounded-full hover:bg-white/10 ${isFav ? 'active' : 'text-gray-500'}" data-id="${item.id}" data-name="${item.name}">
                                    <svg class="w-4 h-4" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                                </button>
                            </div>
                            <p class="text-sm text-gray-300 line-clamp-1 mb-2">${description || t.card.noDescription}</p>
                            <div class="flex flex-wrap gap-2">
                                ${tagsHtml}
                            </div>
                        </div>

                        <div class="flex flex-col sm:flex-row gap-2 flex-shrink-0 w-full sm:w-auto">
                            ${relLinkHtml}
                            <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary w-full sm:w-auto text-center text-white font-semibold py-2 px-6 rounded-lg text-sm whitespace-nowrap">
                                ${t.card.download}
                            </a>
                        </div>
                    </div>
                </div>
            `;
        },
        installPage() {
            const t = this.getT();
            return `
                ${App.templates.hero(t.hero.install.title, t.hero.install.subtitle)}
                <div class="container max-w-4xl mx-auto mb-12">
                    <div class="glassmorphism p-6 sm:p-12 rounded-xl border border-white/10 shadow-2xl">
                        <div class="markdown-body">
                            ${marked.parse(App.howToInstallMarkdown)}
                        </div>
                    </div>
                </div>
            `;
        },
        infoPage() {
            const t = this.getT();
            return `
                ${App.templates.hero(t.hero.info.title, t.hero.info.subtitle)}
                <div class="container max-w-3xl mx-auto px-4 mb-20">
                    <div class="glassmorphism p-8 sm:p-12 rounded-xl text-center border border-white/10 shadow-2xl relative overflow-hidden">
                        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                        
                        <div class="mb-8">
                            <svg class="w-20 h-20 mx-auto text-blue-400 mb-6 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
                            <h2 class="text-2xl font-bold text-white mb-4">${t.info.title}</h2>
                            <p class="text-gray-300 leading-relaxed text-lg">
                                ${t.info.description}
                            </p>
                        </div>

                        <a href="${App.config.googleFormURL}" target="_blank" rel="noopener noreferrer" class="btn btn-primary inline-flex items-center gap-3 text-white font-bold py-4 px-10 rounded-xl text-lg hover:scale-105 transition-transform shadow-lg shadow-blue-500/20">
                            <span>${t.info.button}</span>
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                        </a>
                        
                        <p class="mt-6 text-sm text-gray-500">${t.info.note}</p>
                    </div>
                </div>
            `;
        },
        error(message) {
            const t = this.getT();
            return `
                <div class="flex flex-col items-center justify-center min-h-[50vh] px-4">
                    <div class="glassmorphism p-8 rounded-xl border border-red-500/30 max-w-lg w-full text-center">
                        <svg class="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        <h2 class="text-xl font-bold text-white mb-2">${t.errorTitle}</h2>
                        <p class="text-gray-300 mb-6">${message}</p>
                        <button onclick="location.reload()" class="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/10">
                            ${t.reload}
                        </button>
                    </div>
                </div>
            `;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
