// ===================================================================================
// アプリケーション本体 - True Minimalist (多言語・ダークモード対応)
// ===================================================================================

const escapeHTML = (str) => {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag])
    );
};

const TRANSLATIONS = {
    ja: {
        nav: { plugins: 'プラグイン', scripts: 'スクリプト', favorites: 'お気に入り', install: '導入方法', info: '情報提供' },
        hero: {
            plugins: { title: 'Plugins', subtitle: 'AviUtl2を拡張するプラグイン' },
            scripts: { title: 'Scripts', subtitle: '作業を効率化するスクリプト' },
            favorites: { title: 'Favorites', subtitle: '保存したアイテム一覧' },
            install: { title: 'Installation', subtitle: '基本的な導入手順' },
            info: { title: 'Contribute', subtitle: 'コミュニティの力でAviUtl2をより良く' }
        },
        filter: {
            searchPlaceholder: '検索...', sort: { newest: '新着順', nameAsc: '名前順 (A-Z)', nameDesc: '名前順 (Z-A)' },
            count: '件', itemsPerPage: '表示', pagePrev: '前へ', pageNext: '次へ',
            tagTitle: 'Tags', searchMode: 'Mode:', noTags: 'タグなし', noItems: '見つかりませんでした。', clearFilter: 'クリア',
            filterBtn: 'フィルター'
        },
        card: { download: 'DL', relatedLink: '配布ページ', extLink: 'Web', noDescription: '説明がありません。' },
        info: { title: '新しい発見をシェアしよう', description: '未掲載の拡張機能や誤りを見つけた場合はお知らせください。', button: 'フォームを開く', note: 'Google Formsへ移動します' },
        loading: '設定ファイルの読み込みに失敗しました', networkError: 'データの取得に失敗しました',
        favAdded: (name) => `「${name}」をお気に入りに追加しました`, favRemoved: (name) => `「${name}」をお気に入りから削除しました`,
        errorTitle: 'エラーが発生しました', reload: '再読み込み'
    },
    en: {
        nav: { plugins: 'Plugins', scripts: 'Scripts', favorites: 'Favorites', install: 'Install', info: 'Contribute' },
        hero: {
            plugins: { title: 'Plugins', subtitle: 'Extend AviUtl2 with plugins' },
            scripts: { title: 'Scripts', subtitle: 'Scripts to improve your workflow' },
            favorites: { title: 'Favorites', subtitle: 'Your saved items' },
            install: { title: 'Installation', subtitle: 'Basic installation guide' },
            info: { title: 'Contribute', subtitle: 'Make AviUtl2 better together' }
        },
        filter: {
            searchPlaceholder: 'Search...', sort: { newest: 'Newest', nameAsc: 'Name (A-Z)', nameDesc: 'Name (Z-A)' },
            count: 'items', itemsPerPage: 'Show', pagePrev: 'Prev', pageNext: 'Next',
            tagTitle: 'Tags', searchMode: 'Mode:', noTags: 'No tags', noItems: 'No items found.', clearFilter: 'Clear',
            filterBtn: 'Filters'
        },
        card: { download: 'Download', relatedLink: 'Page', extLink: 'Web', noDescription: 'No description.' },
        info: { title: 'Share your discoveries', description: 'Let us know if you find unlisted items or errors.', button: 'Open Form', note: 'Opens Google Forms' },
        loading: 'Config load failed', networkError: 'Fetch failed',
        favAdded: (name) => `Added "${name}" to favorites`, favRemoved: (name) => `Removed "${name}" from favorites`,
        errorTitle: 'Error occurred', reload: 'Reload'
    }
};

const App = {
    state: {
        currentPage: 'plugins', language: 'ja', theme: 'system',
        plugins: [], scripts: [], favorites: new Set(),
        isLoading: true, error: null,
        filters: { search: '', tags: new Set(), sort: 'newest' },
        pagination: { page: 1, limit: 24 },
        cardSize: 'medium', // 'small'(4), 'medium'(3), 'large'(2)
        tagMode: 'or', isMobileMenuOpen: false, isMobileFilterOpen: false,
        cache: { plugins: null, scripts: null, lastFetch: 0 }
    },
    CACHE_DURATION: 5 * 60 * 1000,
    elements: {
        app: document.getElementById('app'),
        navLinks: document.querySelectorAll('.nav-link'),
        header: document.getElementById('header'),
        mobileMenu: document.getElementById('mobile-menu'),
        mobileMenuBtn: document.getElementById('mobile-menu-btn'),
        toastContainer: document.getElementById('toast-container'),
        themeToggles: [document.getElementById('theme-toggle'), document.getElementById('theme-toggle-mobile')],
        langToggles: [document.getElementById('lang-toggle-desktop'), document.getElementById('lang-toggle-mobile')],
    },

    async init() {
        this.loadSettings();
        this.applyTheme();
        this.loadFavorites();
        this.setupEventListeners();
        this.updateLanguageUI();
        
        this.config = await this.fetchConfig();
        
        window.addEventListener('popstate', () => {
            this.navigate(this.getCurrentPageFromURL(), false);
        });

        await this.fetchData();
        const page = this.getCurrentPageFromURL();
        this.navigate(page, false);
    },

    getT() { return TRANSLATIONS[this.state.language]; },

    loadSettings() {
        const savedLang = localStorage.getItem('aviutl2_hub_language');
        this.state.language = savedLang && ['ja', 'en'].includes(savedLang) ? savedLang : 
                              (navigator.language.substring(0, 2) === 'ja' ? 'ja' : 'en');
        this.state.theme = localStorage.getItem('theme') || 'system';
        this.state.cardSize = localStorage.getItem('aviutl2_hub_cardsize') || 'medium';
    },

    toggleLanguage() {
        this.state.language = this.state.language === 'ja' ? 'en' : 'ja';
        localStorage.setItem('aviutl2_hub_language', this.state.language);
        this.updateLanguageUI();
        this.render();
    },

    toggleTheme() {
        if (this.state.theme === 'light') this.state.theme = 'dark';
        else if (this.state.theme === 'dark') this.state.theme = 'system';
        else this.state.theme = 'light';
        
        if (this.state.theme === 'system') localStorage.removeItem('theme');
        else localStorage.setItem('theme', this.state.theme);
        
        this.applyTheme();
    },

    applyTheme() {
        const isDark = this.state.theme === 'dark' || (this.state.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        document.documentElement.classList.toggle('dark', isDark);

        const iconName = this.state.theme === 'light' ? 'sun' : (this.state.theme === 'dark' ? 'moon' : 'monitor');
        const themeTitle = this.state.theme === 'light' ? 'Light Theme' : (this.state.theme === 'dark' ? 'Dark Theme' : 'System Theme');
        
        this.elements.themeToggles.forEach(btn => {
            btn.innerHTML = `<i data-lucide="${iconName}" class="w-5 h-5"></i>`;
            btn.setAttribute('title', themeTitle);
            if (window.lucide) lucide.createIcons({ root: btn });
        });
    },

    updateLanguageUI() {
        const t = this.getT();
        this.elements.langToggles[0].textContent = this.state.language === 'ja' ? 'EN' : 'JA';
        this.elements.langToggles[1].innerHTML = `<span>Language</span><span class="text-sm font-semibold px-3 py-1 bg-zinc-100 dark:bg-zinc-900 rounded-full">${this.state.language === 'ja' ? 'English' : '日本語'}</span>`;

        this.elements.navLinks.forEach(link => {
            if (link.parentElement.classList.contains('text-xl')) return;
            const page = link.dataset.page;
            if (page && t.nav[page]) link.textContent = t.nav[page];
        });
        document.title = `${t.nav[this.state.currentPage] || ''} - AviUtl2 Hub`;
    },

    async fetchConfig() {
        try {
            const res = await fetch('./assets/config/config.json');
            if (!res.ok) throw new Error('config.json not found');
            return await res.json();
        } catch (error) {
            this.showToast(this.getT().loading, 'error');
            return null;
        }
    },

    async fetchMarkdown(file) {
        try {
            const res = await fetch(`./assets/docs/${file}`);
            if (!res.ok) throw new Error(`${file} load failed`);
            return await res.text();
        } catch (error) {
            return '# Error\n\nFailed to load content.';
        }
    },

    getCurrentPageFromURL() {
        const hash = window.location.hash.replace('#', '');
        return ['plugins', 'scripts', 'favorites', 'install', 'info'].includes(hash) ? hash : 'plugins';
    },

    navigate(page, pushState = true) {
        if (this.state.currentPage === page && !this.state.isLoading) return;
        window.scrollTo({ top: 0, behavior: 'smooth' });

        this.elements.app.style.opacity = '0';
        this.elements.app.style.transform = 'translateY(10px)';
        this.elements.app.style.transition = 'opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)';

        setTimeout(() => {
            this.state.currentPage = page;
            this.state.pagination.page = 1;
            this.state.filters.tags.clear();
            this.state.filters.search = '';
            this.state.isMobileFilterOpen = false;
            if (pushState) history.pushState({ page }, '', `#${page}`);
            
            this.render();
            
            requestAnimationFrame(() => {
                this.elements.app.style.opacity = '1';
                this.elements.app.style.transform = 'translateY(0)';
            });
        }, 150);
    },

    toggleMobileMenu(isOpen) {
        this.state.isMobileMenuOpen = isOpen;
        const menu = this.elements.mobileMenu;
        const icon = this.elements.mobileMenuBtn.querySelector('i');
        
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            menu.classList.remove('hidden');
            menu.classList.add('flex');
            setTimeout(() => menu.classList.replace('opacity-0', 'opacity-100'), 10);
            icon.setAttribute('data-lucide', 'x');
        } else {
            document.body.style.overflow = '';
            menu.classList.replace('opacity-100', 'opacity-0');
            setTimeout(() => {
                menu.classList.add('hidden');
                menu.classList.remove('flex');
            }, 300);
            icon.setAttribute('data-lucide', 'menu');
        }
        lucide.createIcons({ root: this.elements.mobileMenuBtn });
    },

    async fetchData() {
        this.state.isLoading = true;
        this.renderSkeleton();

        if (!this.config) {
            this.config = await this.fetchConfig();
            if (!this.config) { this.state.error = 'Config Error'; this.render(); return; }
        }

        const now = Date.now();
        if (this.state.cache.plugins && (now - this.state.cache.lastFetch < this.CACHE_DURATION)) {
            this.state.plugins = this.state.cache.plugins;
            this.state.scripts = this.state.cache.scripts;
            this.state.isLoading = false;
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

            const pluginsData = await pluginsRes.json();
            const scriptsData = await scriptsRes.json();
            
            this.state.plugins = pluginsData.contents || [];
            this.state.scripts = scriptsData.contents || [];
            this.state.cache.plugins = this.state.plugins;
            this.state.cache.scripts = this.state.scripts;
            this.state.cache.lastFetch = now;

            this.state.error = null;
        } catch (error) {
            const t = this.getT();
            this.state.error = t.networkError;
            this.showToast(t.networkError, 'error');
        } finally {
            this.state.isLoading = false;
            this.render();
        }
    },

    // 現在のページに応じたタグの取得
    getCurrentTags() {
        const tags = new Set();
        let items = [];
        if (this.state.currentPage === 'plugins') items = this.state.plugins;
        else if (this.state.currentPage === 'scripts') items = this.state.scripts;
        else if (this.state.currentPage === 'favorites') items = [...this.state.plugins, ...this.state.scripts].filter(i => this.state.favorites.has(i.id));
        
        items.forEach(item => {
            if (item.tags) item.tags.split(',').map(t => t.trim()).forEach(tag => tags.add(tag));
        });
        return Array.from(tags).sort();
    },

    renderSkeleton() {
        this.elements.app.innerHTML = `
            <div class="animate-pulse">
                <div class="h-8 bg-zinc-100 dark:bg-zinc-900 rounded-lg w-1/4 mb-3"></div>
                <div class="h-4 bg-zinc-50 dark:bg-zinc-900 rounded-md w-1/3 mb-10"></div>
                <div class="flex flex-col lg:flex-row gap-8">
                    <div class="w-full lg:w-64 hidden lg:block shrink-0">
                        <div class="h-10 bg-zinc-100 dark:bg-zinc-900 rounded-lg mb-4"></div>
                        <div class="h-40 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg"></div>
                    </div>
                    <div class="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${Array(6).fill().map(() => `
                            <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 h-44 flex flex-col justify-between">
                                <div>
                                    <div class="h-5 bg-zinc-200 dark:bg-zinc-800 rounded-md w-3/4 mb-3"></div>
                                    <div class="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-full mb-2"></div>
                                    <div class="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>`;
    },

    loadFavorites() {
        try {
            const saved = localStorage.getItem('aviutl2_hub_favorites');
            if (saved) this.state.favorites = new Set(JSON.parse(saved));
        } catch (e) {}
    },

    saveFavorites() {
        localStorage.setItem('aviutl2_hub_favorites', JSON.stringify([...this.state.favorites]));
    },

    toggleFavorite(id, name) {
        const t = this.getT();
        if (this.state.favorites.has(id)) {
            this.state.favorites.delete(id);
            this.showToast(t.favRemoved(name));
        } else {
            this.state.favorites.add(id);
            this.showToast(t.favAdded(name));
        }
        this.saveFavorites();
        
        const btns = document.querySelectorAll(`.fav-btn[data-id="${id}"]`);
        btns.forEach(btn => {
            if (this.state.favorites.has(id)) {
                btn.classList.add('active', 'text-zinc-900', 'dark:text-white');
                btn.classList.remove('text-zinc-400');
            } else {
                btn.classList.remove('active', 'text-zinc-900', 'dark:text-white');
                btn.classList.add('text-zinc-400');
            }
        });
        if (this.state.currentPage === 'favorites') this.render();
    },

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transform translate-x-full opacity-0 transition-all duration-300 font-medium text-sm pointer-events-auto';
        toast.innerHTML = `<span>${escapeHTML(message)}</span>`;
        this.elements.toastContainer.appendChild(toast);
        
        requestAnimationFrame(() => {
            toast.classList.remove('translate-x-full', 'opacity-0');
        });
        setTimeout(() => {
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    },

    render() {
        if (this.state.isLoading) return;
        this.updateLanguageUI();

        this.elements.navLinks.forEach(link => {
            const isActive = link.dataset.page === this.state.currentPage;
            if (isActive) link.classList.add('text-zinc-900', 'dark:text-white');
            else link.classList.remove('text-zinc-900', 'dark:text-white');
        });

        if (this.state.error) {
            this.elements.app.innerHTML = `
                <div class="py-24 text-center">
                    <h2 class="text-xl font-bold mb-4">${this.state.error}</h2>
                    <button id="reload-button" class="mt-2 px-5 py-2.5 bg-zinc-100 dark:bg-zinc-900 font-semibold rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">${this.getT().reload}</button>
                </div>`;
            return;
        }

        const t = this.getT();
        let content = '';
        
        if (['plugins', 'scripts', 'favorites'].includes(this.state.currentPage)) {
            let title = t.hero[this.state.currentPage].title;
            let sub = t.hero[this.state.currentPage].subtitle;
            const currentTags = this.getCurrentTags();
            
            content = `
                <div class="mb-8 md:mb-10">
                    <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-zinc-900 dark:text-white">${title}</h1>
                    <p class="text-base text-zinc-500 dark:text-zinc-400 font-medium">${sub}</p>
                </div>
                
                <!-- Mobile Filter Toggle -->
                <div class="lg:hidden mb-6">
                    <button id="mobile-filter-btn" class="w-full flex items-center justify-between bg-zinc-100 dark:bg-zinc-900 px-5 py-3 rounded-xl font-semibold text-zinc-900 dark:text-white">
                        <span class="flex items-center gap-2"><i data-lucide="sliders-horizontal" class="w-4 h-4"></i> ${t.filter.filterBtn}</span>
                        <i data-lucide="${this.state.isMobileFilterOpen ? 'chevron-up' : 'chevron-down'}" class="w-4 h-4"></i>
                    </button>
                </div>

                <div class="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    <!-- フィルターサイドバー -->
                    <div id="filter-sidebar" class="${this.state.isMobileFilterOpen ? 'block' : 'hidden'} lg:block w-full lg:w-64 shrink-0">
                        <div class="sticky top-24 flex flex-col gap-6">
                            <div>
                                <div class="relative">
                                    <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"></i>
                                    <input type="text" id="search-input" value="${escapeHTML(this.state.filters.search)}" placeholder="${t.filter.searchPlaceholder}" class="w-full bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-shadow font-medium border border-transparent dark:border-zinc-800">
                                </div>
                            </div>
                            
                            <div>
                                <select id="sort-select" class="w-full bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-shadow font-medium appearance-none border border-transparent dark:border-zinc-800">
                                    <option value="newest" ${this.state.filters.sort==='newest'?'selected':''}>${t.filter.sort.newest}</option>
                                    <option value="name-asc" ${this.state.filters.sort==='name-asc'?'selected':''}>${t.filter.sort.nameAsc}</option>
                                    <option value="name-desc" ${this.state.filters.sort==='name-desc'?'selected':''}>${t.filter.sort.nameDesc}</option>
                                </select>
                            </div>
                            
                            ${currentTags.length > 0 ? `
                            <div>
                                <div class="flex items-center justify-between mb-3">
                                    <h3 class="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">${t.filter.tagTitle}</h3>
                                    <div class="flex gap-1.5">
                                        <button id="tag-mode-or" class="text-[11px] font-bold ${this.state.tagMode==='or'?'text-zinc-900 dark:text-white':'text-zinc-400 hover:text-zinc-600'}">OR</button>
                                        <button id="tag-mode-and" class="text-[11px] font-bold ${this.state.tagMode==='and'?'text-zinc-900 dark:text-white':'text-zinc-400 hover:text-zinc-600'}">AND</button>
                                    </div>
                                </div>
                                <div class="flex flex-wrap gap-1.5" id="tag-container">
                                    ${currentTags.map(tag => `
                                        <button class="tag-filter px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors border ${this.state.filters.tags.has(tag) ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 dark:hover:bg-zinc-800'}" data-tag="${escapeHTML(tag)}">
                                            ${escapeHTML(tag)}
                                        </button>
                                    `).join('')}
                                </div>
                            </div>` : ''}
                        </div>
                    </div>

                    <!-- メインコンテンツ -->
                    <div class="flex-grow w-full">
                        <div id="items-count-container" class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 text-sm font-medium text-zinc-500">
                            <span id="items-count">0 ${t.filter.count}</span>
                            <div class="flex flex-wrap items-center gap-4">
                                <!-- サイズ切替 -->
                                <div class="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-lg p-0.5">
                                    <button class="card-size-btn p-1 rounded-md ${this.state.cardSize==='small'?'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm':'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}" data-size="small" title="Small (4 columns)">
                                        <i data-lucide="grid-2x2" class="w-4 h-4"></i>
                                    </button>
                                    <button class="card-size-btn p-1 rounded-md ${this.state.cardSize==='medium'?'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm':'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}" data-size="medium" title="Medium (3 columns)">
                                        <i data-lucide="layout-grid" class="w-4 h-4"></i>
                                    </button>
                                    <button class="card-size-btn p-1 rounded-md ${this.state.cardSize==='large'?'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm':'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}" data-size="large" title="Large (2 columns)">
                                        <i data-lucide="columns-2" class="w-4 h-4"></i>
                                    </button>
                                </div>
                                <div class="w-px h-4 bg-zinc-200 dark:bg-zinc-800 hidden sm:block"></div>
                                <div class="flex items-center gap-2">
                                    <span>${t.filter.itemsPerPage}:</span>
                                    <div class="flex gap-1">
                                        ${[12, 24, 48, 96].map(n => `<button class="page-limit-btn px-2 py-0.5 rounded ${this.state.pagination.limit === n ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900'}" data-limit="${n}">${n}</button>`).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="items-list" class=""></div>
                        <div id="pagination-container" class="mt-10 flex justify-center items-center gap-4 hidden"></div>
                    </div>
                </div>`;
        } else if (this.state.currentPage === 'install') {
            content = `<div class="max-w-3xl"><h1 class="text-3xl md:text-4xl font-extrabold tracking-tight mb-8 text-zinc-900 dark:text-white">${t.hero.install.title}</h1><div id="md-content" class="markdown-body"><i data-lucide="loader-2" class="w-6 h-6 animate-spin text-zinc-400"></i></div></div>`;
            this.renderInstall();
        } else if (this.state.currentPage === 'info') {
            content = `
                <div class="max-w-2xl py-12 md:py-20">
                    <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-zinc-900 dark:text-white">${t.info.title}</h1>
                    <p class="text-lg text-zinc-500 dark:text-zinc-400 mb-10 font-medium">${t.info.description}</p>
                    <a href="${this.config.googleFormURL}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-6 py-3.5 rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-95 transition-transform">
                        <span>${t.info.button}</span>
                        <i data-lucide="external-link" class="w-4 h-4"></i>
                    </a>
                </div>`;
        }
        
        this.elements.app.innerHTML = content;
        
        if (['plugins', 'scripts', 'favorites'].includes(this.state.currentPage)) {
            this.renderItems();
        }
        lucide.createIcons();
    },

    async renderInstall() {
        const file = this.state.language === 'en' ? 'how_to_install_en.md' : 'how_to_install.md';
        const mdText = await this.fetchMarkdown(file);
        const mdContainer = document.getElementById('md-content');
        if (mdContainer) mdContainer.innerHTML = marked.parse(mdText, { gfm: true, breaks: true });
    },

    renderItems() {
        if (!['plugins', 'scripts', 'favorites'].includes(this.state.currentPage)) return;
        const t = this.getT();
        let items = this.state.currentPage === 'plugins' ? this.state.plugins : 
                    this.state.currentPage === 'scripts' ? this.state.scripts : 
                    [...this.state.plugins, ...this.state.scripts].filter(i => this.state.favorites.has(i.id));

        let filtered = items.filter(item => {
            const searchLower = this.state.filters.search.toLowerCase();
            const desc = this.state.language === 'en' ? (item.description_en || item.description) : item.description;
            const searchMatch = (item.name || '').toLowerCase().includes(searchLower) || (desc || '').toLowerCase().includes(searchLower);
            
            const tags = new Set(item.tags ? item.tags.split(',').map(t => t.trim()) : []);
            let tagMatch = true;
            if (this.state.filters.tags.size > 0) {
                tagMatch = this.state.tagMode === 'or' 
                    ? [...this.state.filters.tags].some(tag => tags.has(tag))
                    : [...this.state.filters.tags].every(tag => tags.has(tag));
            }
            return searchMatch && tagMatch;
        });

        if (this.state.filters.sort === 'name-asc') filtered.sort((a,b) => a.name.localeCompare(b.name, this.state.language));
        else if (this.state.filters.sort === 'name-desc') filtered.sort((a,b) => b.name.localeCompare(a.name, this.state.language));
        else filtered.sort((a,b) => new Date(b.publishedAt||0) - new Date(a.publishedAt||0));

        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / this.state.pagination.limit) || 1;
        if (this.state.pagination.page > totalPages) this.state.pagination.page = totalPages;

        const start = (this.state.pagination.page - 1) * this.state.pagination.limit;
        const pageItems = filtered.slice(start, start + this.state.pagination.limit);

        const countEl = document.getElementById('items-count');
        if (countEl) countEl.textContent = `${totalItems} ${t.filter.count}`;

        const listEl = document.getElementById('items-list');
        const pageEl = document.getElementById('pagination-container');
        
        if (!listEl) return;

        // Apply grid classes dynamically based on cardSize state
        let gridClass = 'grid gap-4 ';
        if (this.state.cardSize === 'small') {
            gridClass += 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
        } else if (this.state.cardSize === 'medium') {
            gridClass += 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
        } else {
            gridClass += 'grid-cols-1 md:grid-cols-2';
        }
        listEl.className = gridClass;

        if (pageItems.length > 0) {
            listEl.innerHTML = pageItems.map(item => this.createCardHTML(item)).join('');
            if (totalPages > 1) {
                pageEl.classList.remove('hidden');
                pageEl.innerHTML = `
                    <button class="pagination-btn p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 disabled:opacity-30 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors" data-action="prev" ${this.state.pagination.page===1?'disabled':''}>
                        <i data-lucide="chevron-left" class="w-5 h-5"></i>
                    </button>
                    <span class="text-sm font-bold">${this.state.pagination.page} / ${totalPages}</span>
                    <button class="pagination-btn p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 disabled:opacity-30 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors" data-action="next" ${this.state.pagination.page===totalPages?'disabled':''}>
                        <i data-lucide="chevron-right" class="w-5 h-5"></i>
                    </button>`;
            } else {
                pageEl.classList.add('hidden');
            }
        } else {
            listEl.className = '';
            listEl.innerHTML = `
                <div class="py-16 text-center bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                    <p class="text-sm font-bold text-zinc-500">${t.filter.noItems}</p>
                    <button id="clear-filters-btn" class="mt-4 text-zinc-900 dark:text-white font-bold hover:underline text-sm">${t.filter.clearFilter}</button>
                </div>`;
            pageEl.classList.add('hidden');
        }
        lucide.createIcons({ root: listEl });
        lucide.createIcons({ root: pageEl });
    },

    createCardHTML(item) {
        const t = this.getT();
        const isFav = this.state.favorites.has(item.id);
        const desc = escapeHTML(this.state.language === 'en' ? (item.description_en || item.description) : item.description) || t.card.noDescription;
        const tags = item.tags ? item.tags.split(',').map(tag => escapeHTML(tag.trim())) : [];
        const date = new Date(item.publishedAt || item.createdAt || 0).toLocaleDateString(this.state.language === 'ja' ? 'ja-JP' : 'en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });

        return `
            <div class="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md rounded-2xl p-4 md:p-5 flex flex-col justify-between transition-all duration-200">
                <div>
                    <div class="flex justify-between items-start mb-2 gap-2">
                        <h3 class="text-base font-bold text-zinc-900 dark:text-white leading-tight break-words">${escapeHTML(item.name)}</h3>
                        <button class="fav-btn shrink-0 focus:outline-none transition-transform active:scale-90 ${isFav ? 'active text-zinc-900 dark:text-white' : 'text-zinc-300 dark:text-zinc-600 hover:text-zinc-500'}" data-id="${item.id}" data-name="${escapeHTML(item.name)}">
                            <i data-lucide="bookmark" class="w-5 h-5 transition-colors"></i>
                        </button>
                    </div>
                    <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2 leading-snug">${desc}</p>
                    
                    ${tags.length > 0 ? `
                    <div class="flex flex-wrap gap-1.5 mb-4">
                        ${tags.map(tag => `<span class="px-2 py-0.5 text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-md">${tag}</span>`).join('')}
                    </div>` : ''}
                </div>
                
                <div class="flex items-center justify-between mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                    <span class="text-xs font-medium text-zinc-400">${date}</span>
                    <div class="flex gap-1.5">
                        ${item.rel_link ? `
                        <a href="${escapeHTML(item.rel_link)}" target="_blank" rel="noopener noreferrer" class="w-8 h-8 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors" title="${t.card.relatedLink}">
                            <i data-lucide="globe" class="w-4 h-4"></i>
                        </a>` : ''}
                        ${item.url ? `
                        <a href="${escapeHTML(item.url)}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 flex items-center gap-1.5 bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-lg font-bold text-xs transition-colors shadow-sm">
                            <i data-lucide="download" class="w-3.5 h-3.5"></i>
                            <span>${t.card.download}</span>
                        </a>` : ''}
                    </div>
                </div>
            </div>`;
    },

    setupEventListeners() {
        this.elements.mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu(!this.state.isMobileMenuOpen));

        this.elements.themeToggles.forEach(btn => btn.addEventListener('click', () => {
            this.toggleTheme();
            this.updateLanguageUI();
        }));
        
        this.elements.langToggles.forEach(btn => btn.addEventListener('click', () => {
            this.toggleLanguage();
            if (this.state.isMobileMenuOpen) this.toggleMobileMenu(false);
        }));

        this.elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.closest('.nav-link').dataset.page;
                if (page) {
                    this.navigate(page);
                    if (this.state.isMobileMenuOpen) this.toggleMobileMenu(false);
                }
            });
        });

        this.elements.app.addEventListener('input', (e) => {
            if (e.target.id === 'search-input') {
                this.state.filters.search = e.target.value;
                this.state.pagination.page = 1;
                this.renderItems();
            }
        });

        this.elements.app.addEventListener('change', (e) => {
            if (e.target.id === 'sort-select') {
                this.state.filters.sort = e.target.value;
                this.renderItems();
            }
        });

        this.elements.app.addEventListener('click', (e) => {
            const pageBtn = e.target.closest('.pagination-btn');
            if (pageBtn) {
                const action = pageBtn.dataset.action;
                if (action === 'prev') this.state.pagination.page--;
                if (action === 'next') this.state.pagination.page++;
                const listTop = document.getElementById('items-count-container').offsetTop - 80;
                window.scrollTo({ top: listTop, behavior: 'smooth' });
                this.renderItems();
            }

            const limitBtn = e.target.closest('.page-limit-btn');
            if (limitBtn) {
                this.state.pagination.limit = parseInt(limitBtn.dataset.limit);
                this.state.pagination.page = 1;
                this.render(); // re-render to update the limit buttons highlights
            }

            const sizeBtn = e.target.closest('.card-size-btn');
            if (sizeBtn) {
                this.state.cardSize = sizeBtn.dataset.size;
                localStorage.setItem('aviutl2_hub_cardsize', this.state.cardSize);
                this.render(); // re-render to update the size buttons and grid
            }

            const tagEl = e.target.closest('.tag-filter');
            if (tagEl) {
                const tag = tagEl.dataset.tag;
                if (this.state.filters.tags.has(tag)) this.state.filters.tags.delete(tag);
                else this.state.filters.tags.add(tag);
                this.state.pagination.page = 1;
                this.render();
            }

            const modeOr = e.target.closest('#tag-mode-or');
            if (modeOr) { this.state.tagMode = 'or'; this.render(); }
            
            const modeAnd = e.target.closest('#tag-mode-and');
            if (modeAnd) { this.state.tagMode = 'and'; this.render(); }

            const favBtn = e.target.closest('.fav-btn');
            if (favBtn) {
                e.preventDefault();
                this.toggleFavorite(favBtn.dataset.id, favBtn.dataset.name);
            }

            const clearBtn = e.target.closest('#clear-filters-btn');
            if (clearBtn) {
                this.state.filters.search = '';
                this.state.filters.tags.clear();
                this.render();
            }

            if (e.target.closest('#reload-button')) this.fetchData();

            const mobileFilterBtn = e.target.closest('#mobile-filter-btn');
            if (mobileFilterBtn) {
                this.state.isMobileFilterOpen = !this.state.isMobileFilterOpen;
                this.render();
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
    lucide.createIcons();
});