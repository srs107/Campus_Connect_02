// Clubs Page JavaScript
class ClubsPage {
    constructor() {
        this.clubs = [];
        this.filteredClubs = [];
        this.events = [];
        this.eventCountByClub = {}; // { clubName: count }
        this.joinedClubs = this.loadJoinedClubs();

        this.initializeElements();
        this.bindEvents();
        this.loadInitialFilters();
        this.loadData();
    }

    initializeElements() {
        // Search
        this.searchInput = document.getElementById('searchInput');
        this.searchClear = document.getElementById('searchClear');
        this.activeFilters = document.getElementById('activeFilters');
        this.resetSearchBtn = document.getElementById('resetSearch');

        // Stats
        this.totalClubsEl = document.getElementById('totalClubs');
        this.totalMembersEl = document.getElementById('totalMembers');
        this.totalEventsEl = document.getElementById('totalEvents');

        // Containers
        this.resultsCount = document.getElementById('resultsCount');
        this.loadingContainer = document.getElementById('loadingContainer');
        this.noResults = document.getElementById('noResults');
        this.clubsGrid = document.getElementById('clubsGrid');

        // Filters state
        this.filters = { search: '' };
    }

    bindEvents() {
        this.searchInput?.addEventListener('input', (e) => this.handleSearch(e.target.value));
        this.searchClear?.addEventListener('click', () => this.clearSearch());
        this.resetSearchBtn?.addEventListener('click', () => this.clearSearch());
    }

    async loadData() {
        try {
            this.showLoading();

            if (window.DataStore && DataStore.api) {
                const [clubsData, eventsData] = await Promise.all([
                    DataStore.api.getClubs(),
                    DataStore.api.getEvents()
                ]);
                this.clubs = clubsData || [];
                this.events = eventsData || [];
            } else {
                const [clubsRes, eventsRes] = await Promise.all([
                    fetch('data/clubs.json'),
                    fetch('data/events.json')
                ]);
                if (!clubsRes.ok) throw new Error('Failed to load clubs data');
                if (!eventsRes.ok) throw new Error('Failed to load events data');
                this.clubs = await clubsRes.json();
                this.events = await eventsRes.json();
            }

            this.computeEventCounts();
            this.updateStats();
            this.applyFilters();

            this.hideLoading();
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('Failed to load clubs. Please try again later.');
        }
    }

    loadInitialFilters() {
        try {
            if (window.DataStore && DataStore.getFilterState) {
                const saved = DataStore.getFilterState('clubs');
                if (saved && typeof saved === 'object') {
                    this.filters = { ...this.filters, ...saved };
                    if (this.searchInput && saved.search !== undefined) this.searchInput.value = saved.search;
                    if (this.searchClear) this.searchClear.style.display = this.filters.search ? 'block' : 'none';
                }
            }
        } catch {}
    }

    computeEventCounts() {
        this.eventCountByClub = this.events.reduce((acc, evt) => {
            const name = evt.clubName || '';
            acc[name] = (acc[name] || 0) + 1;
            return acc;
        }, {});

        // Attach counts to clubs
        this.clubs = this.clubs.map(c => ({
            ...c,
            eventsCount: this.eventCountByClub[c.name] || 0
        }));
    }

    updateStats() {
        const totalClubs = this.clubs.length;
        const totalMembers = this.clubs.reduce((sum, c) => sum + (Number(c.memberCount) || 0), 0);
        const totalEvents = this.clubs.reduce((sum, c) => sum + (Number(c.eventsCount) || 0), 0);

        if (this.totalClubsEl) this.totalClubsEl.textContent = String(totalClubs);
        if (this.totalMembersEl) this.totalMembersEl.textContent = String(totalMembers);
        if (this.totalEventsEl) this.totalEventsEl.textContent = String(totalEvents);
    }

    handleSearch(value) {
        this.filters.search = (value || '').toLowerCase();
        if (this.searchClear) this.searchClear.style.display = value ? 'block' : 'none';
        this.persistFilters();
        this.applyFilters();
    }

    clearSearch() {
        if (this.searchInput) this.searchInput.value = '';
        this.filters.search = '';
        if (this.searchClear) this.searchClear.style.display = 'none';
        this.persistFilters();
        this.applyFilters();
    }

    persistFilters() {
        try {
            if (window.DataStore && DataStore.setFilterState) {
                DataStore.setFilterState('clubs', { ...this.filters });
            }
        } catch {}
    }

    applyFilters() {
        let list = [...this.clubs];

        if (this.filters.search) {
            list = list.filter(c =>
                (c.name || '').toLowerCase().includes(this.filters.search) ||
                (c.description || '').toLowerCase().includes(this.filters.search) ||
                (c.president || '').toLowerCase().includes(this.filters.search)
            );
        }

        this.filteredClubs = list;
        this.updateActiveFilters();
        this.renderClubs();
    }

    updateActiveFilters() {
        if (!this.activeFilters) return;
        this.activeFilters.innerHTML = '';

        if (this.filters.search) {
            const tag = document.createElement('div');
            tag.className = 'filter-tag';
            tag.innerHTML = `<span>Search: "${this.filters.search}"</span><button aria-label="Clear search" onclick="clubsPage.clearSearch()">&times;</button>`;
            this.activeFilters.appendChild(tag);
        }
    }

    renderClubs() {
        if (!this.clubsGrid) return;

        // Results summary
        if (this.resultsCount) {
            const total = this.filteredClubs.length;
            this.resultsCount.textContent = `Showing ${total} club${total === 1 ? '' : 's'}`;
        }

        // No results state
        if (this.filteredClubs.length === 0) {
            this.showNoResults();
            return;
        } else {
            this.hideNoResults();
        }

        this.clubsGrid.innerHTML = this.filteredClubs.map(c => this.createClubCard(c)).join('');
    }

    createClubCard(club) {
        const joined = this.joinedClubs.has(String(club.id));
        const eventsCount = Number(club.eventsCount) || 0;
        const logo = club.logo || 'https://via.placeholder.com/80x80?text=Club';

        return `
            <div class="club-card" data-club-id="${club.id}">
                <div class="club-header">
                    <img class="club-logo" src="${logo}" alt="${club.name} logo" onerror="this.onerror=null;this.src='https://via.placeholder.com/80x80?text=Club';">
                    <div>
                        <div class="club-title">${club.name}</div>
                        <div class="club-subtitle">Founded ${club.foundedYear || '—'}</div>
                    </div>
                </div>
                <div class="club-body">
                    <p class="club-description">${this.truncateText(club.description || '', 160)}</p>
                    <div class="club-stats">
                        <div class="club-stat"><i class="fas fa-users"></i>${club.memberCount || 0} Members</div>
                        <div class="club-stat"><i class="fas fa-calendar"></i>${eventsCount} Events</div>
                        <div class="club-stat"><i class="fas fa-user-tie"></i>${club.president || '—'}</div>
                    </div>
                    <div class="club-meta">
                        <span><i class="fas fa-envelope"></i><a href="mailto:${club.contact || ''}">${club.contact || 'Contact unavailable'}</a></span>
                    </div>
                    <div class="club-actions">
                        <button class="btn-join" ${joined ? 'disabled' : ''} onclick="clubsPage.joinClub(${club.id})">${joined ? 'Request Sent' : 'Join Club'}</button>
                        <a class="btn-contact" href="mailto:${club.contact || ''}">Contact</a>
                    </div>
                </div>
            </div>
        `;
    }

    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    joinClub(clubId) {
        const club = this.clubs.find(c => String(c.id) === String(clubId));
        if (!club) return;

        const user = localStorage.getItem('username') || 'Student';

        // Store request
        const requestsKey = 'clubJoinRequests';
        const existing = JSON.parse(localStorage.getItem(requestsKey) || '[]');
        const alreadyRequested = existing.some(r => String(r.clubId) === String(clubId) && r.username === user);
        if (alreadyRequested) {
            this.showToast('You have already requested to join this club.', 'warning');
            return;
        }

        existing.push({
            clubId: club.id,
            clubName: club.name,
            username: user,
            requestedAt: new Date().toISOString()
        });
        localStorage.setItem(requestsKey, JSON.stringify(existing));

        // Track joined club for button state
        this.joinedClubs.add(String(club.id));
        this.saveJoinedClubs();

        // Update button UI
        const card = this.clubsGrid?.querySelector(`[data-club-id="${club.id}"]`);
        const btn = card?.querySelector('.btn-join');
        if (btn) {
            btn.textContent = 'Request Sent';
            btn.disabled = true;
        }

        this.showToast(`Join request sent to ${club.name}.`, 'success');
    }

    loadJoinedClubs() {
        try {
            const raw = localStorage.getItem('joinedClubs');
            const arr = raw ? JSON.parse(raw) : [];
            return new Set(arr.map(String));
        } catch {
            return new Set();
        }
    }

    saveJoinedClubs() {
        localStorage.setItem('joinedClubs', JSON.stringify(Array.from(this.joinedClubs)));
    }

    showLoading() {
        if (this.loadingContainer) this.loadingContainer.style.display = 'block';
        if (this.clubsGrid) this.clubsGrid.style.display = 'none';
    }

    hideLoading() {
        if (this.loadingContainer) this.loadingContainer.style.display = 'none';
        if (this.clubsGrid) this.clubsGrid.style.display = 'grid';
    }

    showNoResults() {
        if (this.noResults) this.noResults.style.display = 'block';
        if (this.clubsGrid) this.clubsGrid.style.display = 'none';
    }

    hideNoResults() {
        if (this.noResults) this.noResults.style.display = 'none';
        if (this.clubsGrid) this.clubsGrid.style.display = 'grid';
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-header">
                <span class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</span>
                <button class="toast-close" aria-label="Close">&times;</button>
            </div>
            <div class="toast-message">${message}</div>
        `;

        const container = document.getElementById('toastContainer') || this.createToastContainer();
        container.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 5000);

        toast.querySelector('.toast-close')?.addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        });
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }
}

// Initialize clubs page when DOM is loaded
let clubsPage;
document.addEventListener('DOMContentLoaded', () => {
    clubsPage = new ClubsPage();
});


