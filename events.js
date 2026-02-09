// Events Page JavaScript
class EventsPage {
    constructor() {
        this.events = [];
        this.filteredEvents = [];
        this.currentPage = 1;
        this.itemsPerPage = 9;
        this.currentView = 'grid';
        this.filters = {
            search: '',
            status: 'all',
            sort: 'date',
            club: 'all'
        };
        
        this.initializeElements();
        this.bindEvents();
        this.loadInitialFilters();
        this.loadEventsData();
    }

    initializeElements() {
        // Search and filter elements
        this.searchInput = document.getElementById('searchInput');
        this.searchClear = document.getElementById('searchClear');
        this.statusFilter = document.getElementById('statusFilter');
        this.sortFilter = document.getElementById('sortFilter');
        this.clubFilter = document.getElementById('clubFilter');
        this.clearFiltersBtn = document.getElementById('clearFilters');
        this.activeFilters = document.getElementById('activeFilters');

        // Results and view elements
        this.resultsCount = document.getElementById('resultsCount');
        this.gridViewBtn = document.getElementById('gridView');
        this.listViewBtn = document.getElementById('listView');
        this.loadingContainer = document.getElementById('loadingContainer');
        this.noResults = document.getElementById('noResults');
        this.resetSearchBtn = document.getElementById('resetSearch');

        // Events grid
        this.eventsGrid = document.getElementById('eventsGrid');

        // Pagination elements
        this.paginationContainer = document.getElementById('paginationContainer');
        this.paginationInfo = document.getElementById('paginationInfo');
        this.prevPageBtn = document.getElementById('prevPage');
        this.nextPageBtn = document.getElementById('nextPage');
        this.paginationNumbers = document.getElementById('paginationNumbers');

        // Stats elements
        this.totalEvents = document.getElementById('totalEvents');
        this.upcomingEvents = document.getElementById('upcomingEvents');
        this.activeClubs = document.getElementById('activeClubs');
    }

    bindEvents() {
        // Search functionality
        this.searchInput?.addEventListener('input', (e) => this.handleSearch(e.target.value));
        this.searchClear?.addEventListener('click', () => this.clearSearch());
        this.resetSearchBtn?.addEventListener('click', () => this.resetSearch());

        // Filter functionality
        this.statusFilter?.addEventListener('change', (e) => this.handleFilterChange('status', e.target.value));
        this.sortFilter?.addEventListener('change', (e) => this.handleFilterChange('sort', e.target.value));
        this.clubFilter?.addEventListener('change', (e) => this.handleFilterChange('club', e.target.value));
        this.clearFiltersBtn?.addEventListener('click', () => this.clearAllFilters());

        // View toggle
        this.gridViewBtn?.addEventListener('click', () => this.changeView('grid'));
        this.listViewBtn?.addEventListener('click', () => this.changeView('list'));

        // Pagination
        this.prevPageBtn?.addEventListener('click', () => this.goToPage(this.currentPage - 1));
        this.nextPageBtn?.addEventListener('click', () => this.goToPage(this.currentPage + 1));
    }

    async loadEventsData() {
        try {
            this.showLoading();
            
            // Load events from JSON file
            if (window.DataStore && DataStore.api && DataStore.api.getEvents) {
                this.events = await DataStore.api.getEvents();
            } else {
                const response = await fetch('data/events.json');
                if (!response.ok) {
                    throw new Error('Failed to load events data');
                }
                this.events = await response.json();
            }
            
            // Process events (add status, format dates, etc.)
            this.processEvents();
            
            // Populate club filter
            this.populateClubFilter();
            
            // Update stats
            this.updateStats();
            
            // Apply initial filters and render
            this.applyFilters();
            this.renderEvents();
            
            this.hideLoading();

        } catch (error) {
            console.error('Error loading events:', error);
            this.showError('Failed to load events. Please try again later.');
        }
    }

    loadInitialFilters() {
        try {
            if (window.DataStore && DataStore.getFilterState) {
                const saved = DataStore.getFilterState('events');
                if (saved && typeof saved === 'object') {
                    this.filters = { ...this.filters, ...saved };
                    if (this.searchInput && saved.search !== undefined) this.searchInput.value = saved.search;
                    if (this.statusFilter && saved.status) this.statusFilter.value = saved.status;
                    if (this.sortFilter && saved.sort) this.sortFilter.value = saved.sort;
                    if (this.clubFilter && saved.club) this.clubFilter.value = saved.club;
                }
            }
        } catch {}
    }

    processEvents() {
        const now = new Date();
        
        this.events = this.events.map(event => {
            const eventDate = new Date(event.date);
            const isUpcoming = eventDate > now;
            
            return {
                ...event,
                status: isUpcoming ? 'upcoming' : 'past',
                formattedDate: eventDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }),
                timeUntil: this.getTimeUntil(eventDate),
                popularity: Math.floor(Math.random() * 100) + 1 // Simulated popularity
            };
        });
    }

    getTimeUntil(date) {
        const now = new Date();
        const diff = date - now;
        
        if (diff < 0) return 'Past';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) {
            return `${days} day${days > 1 ? 's' : ''} away`;
        } else if (hours > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''} away`;
        } else {
            return 'Today';
        }
    }

    populateClubFilter() {
        if (!this.clubFilter) return;
        
        const clubs = [...new Set(this.events.map(event => event.clubName))];
        clubs.sort();
        
        // Clear existing options except "All Clubs"
        this.clubFilter.innerHTML = '<option value="all">All Clubs</option>';
        
        // Add club options
        clubs.forEach(club => {
            const option = document.createElement('option');
            option.value = club;
            option.textContent = club;
            this.clubFilter.appendChild(option);
        });
    }

    updateStats() {
        if (!this.totalEvents || !this.upcomingEvents || !this.activeClubs) return;
        
        const total = this.events.length;
        const upcoming = this.events.filter(event => event.status === 'upcoming').length;
        const clubs = new Set(this.events.map(event => event.clubName)).size;
        
        this.totalEvents.textContent = total;
        this.upcomingEvents.textContent = upcoming;
        this.activeClubs.textContent = clubs;
    }

    handleSearch(value) {
        this.filters.search = value.toLowerCase();
        this.searchClear.style.display = value ? 'block' : 'none';
        this.applyFilters();
    }

    clearSearch() {
        this.searchInput.value = '';
        this.filters.search = '';
        this.searchClear.style.display = 'none';
        this.applyFilters();
    }

    handleFilterChange(type, value) {
        this.filters[type] = value;
        this.currentPage = 1; // Reset to first page when filters change
        this.persistFilters();
        this.applyFilters();
    }

    clearAllFilters() {
        this.filters = {
            search: '',
            status: 'all',
            sort: 'date',
            club: 'all'
        };
        
        this.searchInput.value = '';
        this.statusFilter.value = 'all';
        this.sortFilter.value = 'date';
        this.clubFilter.value = 'all';
        this.searchClear.style.display = 'none';
        this.currentPage = 1;
        
        this.persistFilters();
        this.applyFilters();
    }

    resetSearch() {
        this.clearAllFilters();
    }

    applyFilters() {
        let filtered = [...this.events];

        // Apply search filter
        if (this.filters.search) {
            filtered = filtered.filter(event => 
                event.title.toLowerCase().includes(this.filters.search) ||
                event.description.toLowerCase().includes(this.filters.search) ||
                event.clubName.toLowerCase().includes(this.filters.search) ||
                event.category.toLowerCase().includes(this.filters.search)
            );
        }

        // Apply status filter
        if (this.filters.status !== 'all') {
            filtered = filtered.filter(event => event.status === this.filters.status);
        }

        // Apply club filter
        if (this.filters.club !== 'all') {
            filtered = filtered.filter(event => event.clubName === this.filters.club);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (this.filters.sort) {
                case 'date':
                    return new Date(a.date) - new Date(b.date);
                case 'popularity':
                    return b.popularity - a.popularity;
                case 'title':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });

        this.filteredEvents = filtered;
        this.updateActiveFilters();
        this.renderEvents();
    }

    updateActiveFilters() {
        if (!this.activeFilters) return;
        
        this.activeFilters.innerHTML = '';
        
        // Add search filter tag
        if (this.filters.search) {
            this.addFilterTag('Search', `"${this.filters.search}"`, 'search');
        }
        
        // Add status filter tag
        if (this.filters.status !== 'all') {
            this.addFilterTag('Status', this.filters.status, 'status');
        }
        
        // Add club filter tag
        if (this.filters.club !== 'all') {
            this.addFilterTag('Club', this.filters.club, 'club');
        }
    }

    addFilterTag(label, value, type) {
        const tag = document.createElement('div');
        tag.className = 'filter-tag';
        tag.innerHTML = `
            <span>${label}: ${value}</span>
            <button onclick="eventsPage.removeFilter('${type}')">&times;</button>
        `;
        this.activeFilters.appendChild(tag);
    }

    removeFilter(type) {
        switch (type) {
            case 'search':
                this.clearSearch();
                break;
            case 'status':
                this.statusFilter.value = 'all';
                this.filters.status = 'all';
                break;
            case 'club':
                this.clubFilter.value = 'all';
                this.filters.club = 'all';
                break;
        }
        this.persistFilters();
        this.applyFilters();
    }

    persistFilters() {
        try {
            if (window.DataStore && DataStore.setFilterState) {
                DataStore.setFilterState('events', { ...this.filters });
            }
        } catch {}
    }

    changeView(view) {
        this.currentView = view;
        
        // Update view buttons
        this.gridViewBtn.classList.toggle('active', view === 'grid');
        this.listViewBtn.classList.toggle('active', view === 'list');
        
        // Update grid classes
        this.eventsGrid.classList.toggle('list-view', view === 'list');
        
        // Re-render events to update card classes
        this.renderEvents();
    }

    renderEvents() {
        if (!this.eventsGrid) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const eventsToShow = this.filteredEvents.slice(startIndex, endIndex);

        // Update results count
        this.updateResultsCount();

        // Show/hide no results
        if (this.filteredEvents.length === 0) {
            this.showNoResults();
            return;
        } else {
            this.hideNoResults();
        }

        // Render event cards
        this.eventsGrid.innerHTML = eventsToShow.map(event => this.createEventCard(event)).join('');

        // Update pagination
        this.updatePagination();

        // Bind event handlers to new cards
        this.bindEventCardHandlers();
    }

    createEventCard(event) {
        const isFull = event.currentParticipants >= event.maxParticipants;
        const availability = `${event.currentParticipants}/${event.maxParticipants}`;
        
        return `
            <div class="event-card ${this.currentView === 'list' ? 'list-view' : ''}" data-event-id="${event.id}">
                <div class="event-image">
                    <img src="${event.image}" alt="${event.title}" loading="lazy">
                    <div class="event-status ${event.status}">
                        <i class="fas fa-${event.status === 'upcoming' ? 'clock' : 'check'}"></i>
                        <span>${event.status === 'upcoming' ? 'Upcoming' : 'Past'}</span>
                    </div>
                </div>
                <div class="event-content">
                    <div class="event-header">
                        <img src="${event.clubLogo}" alt="${event.clubName}" class="club-logo">
                        <div>
                            <h3 class="event-title">${event.title}</h3>
                            <p class="club-name">${event.clubName}</p>
                        </div>
                    </div>
                    <p class="event-description">${this.truncateText(event.description, 120)}</p>
                    <div class="event-meta">
                        <div class="event-meta-item">
                            <i class="fas fa-calendar-alt"></i>
                            <span>${event.formattedDate}</span>
                        </div>
                        <div class="event-meta-item">
                            <i class="fas fa-clock"></i>
                            <span>${event.time}</span>
                        </div>
                        <div class="event-meta-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${event.location}</span>
                        </div>
                        <div class="event-meta-item">
                            <i class="fas fa-users"></i>
                            <span>${availability}</span>
                        </div>
                        <div class="event-meta-item">
                            <i class="fas fa-tag"></i>
                            <span>${event.category}</span>
                        </div>
                        <div class="event-meta-item">
                            <i class="fas fa-signal"></i>
                            <span>${event.difficulty}</span>
                        </div>
                    </div>
                    <div class="event-actions">
                        <button class="btn-register" ${isFull ? 'disabled' : ''} onclick="eventsPage.registerForEvent(${event.id})">
                            ${isFull ? 'Event Full' : 'Register Now'}
                        </button>
                        <button class="btn-details" onclick="eventsPage.viewEventDetails(${event.id})">
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }

    bindEventCardHandlers() {
        // Add click handlers for event cards
        const eventCards = this.eventsGrid.querySelectorAll('.event-card');
        eventCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking on buttons
                if (e.target.closest('.event-actions')) return;
                
                const eventId = card.dataset.eventId;
                this.viewEventDetails(eventId);
            });
        });
    }

    registerForEvent(eventId) {
        window.location.href = `register.html?id=${eventId}`;
    }

    viewEventDetails(eventId) {
        // For now, redirect to registration page
        // In a real app, this would show a modal or redirect to a details page
        window.location.href = `register.html?id=${eventId}`;
    }

    updateResultsCount() {
        if (!this.resultsCount) return;
        
        const total = this.filteredEvents.length;
        const start = (this.currentPage - 1) * this.itemsPerPage + 1;
        const end = Math.min(this.currentPage * this.itemsPerPage, total);
        
        this.resultsCount.textContent = `Showing ${start}-${end} of ${total} events`;
    }

    updatePagination() {
        if (!this.paginationContainer) return;

        const totalPages = Math.ceil(this.filteredEvents.length / this.itemsPerPage);
        
        // Show/hide pagination
        this.paginationContainer.style.display = totalPages > 1 ? 'flex' : 'none';
        
        if (totalPages <= 1) return;

        // Update pagination info
        const start = (this.currentPage - 1) * this.itemsPerPage + 1;
        const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredEvents.length);
        this.paginationInfo.textContent = `Showing ${start}-${end} of ${this.filteredEvents.length} events`;

        // Update navigation buttons
        this.prevPageBtn.disabled = this.currentPage === 1;
        this.nextPageBtn.disabled = this.currentPage === totalPages;

        // Generate page numbers
        this.generatePageNumbers(totalPages);
    }

    generatePageNumbers(totalPages) {
        if (!this.paginationNumbers) return;

        this.paginationNumbers.innerHTML = '';
        
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        // Adjust start page if we're near the end
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Add first page and ellipsis if needed
        if (startPage > 1) {
            this.addPageNumber(1);
            if (startPage > 2) {
                this.addPageEllipsis();
            }
        }

        // Add visible page numbers
        for (let i = startPage; i <= endPage; i++) {
            this.addPageNumber(i);
        }

        // Add last page and ellipsis if needed
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                this.addPageEllipsis();
            }
            this.addPageNumber(totalPages);
        }
    }

    addPageNumber(pageNumber) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'page-number';
        pageBtn.textContent = pageNumber;
        pageBtn.classList.toggle('active', pageNumber === this.currentPage);
        
        pageBtn.addEventListener('click', () => this.goToPage(pageNumber));
        this.paginationNumbers.appendChild(pageBtn);
    }

    addPageEllipsis() {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'page-ellipsis';
        ellipsis.textContent = '...';
        this.paginationNumbers.appendChild(ellipsis);
    }

    goToPage(page) {
        const totalPages = Math.ceil(this.filteredEvents.length / this.itemsPerPage);
        
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.renderEvents();
        
        // Scroll to top of events section
        this.eventsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    showLoading() {
        if (this.loadingContainer) {
            this.loadingContainer.style.display = 'block';
        }
        if (this.eventsGrid) {
            this.eventsGrid.style.display = 'none';
        }
        if (this.paginationContainer) {
            this.paginationContainer.style.display = 'none';
        }
    }

    hideLoading() {
        if (this.loadingContainer) {
            this.loadingContainer.style.display = 'none';
        }
        if (this.eventsGrid) {
            this.eventsGrid.style.display = 'grid';
        }
    }

    showNoResults() {
        if (this.noResults) {
            this.noResults.style.display = 'block';
        }
        if (this.eventsGrid) {
            this.eventsGrid.style.display = 'none';
        }
        if (this.paginationContainer) {
            this.paginationContainer.style.display = 'none';
        }
    }

    hideNoResults() {
        if (this.noResults) {
            this.noResults.style.display = 'none';
        }
        if (this.eventsGrid) {
            this.eventsGrid.style.display = 'grid';
        }
    }

    showError(message) {
        // Create error toast
        this.showToast(message, 'error');
    }

    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-header">
                <span class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</span>
                <button class="toast-close">&times;</button>
            </div>
            <div class="toast-message">${message}</div>
        `;
        
        // Add to page
        const toastContainer = document.getElementById('toastContainer') || this.createToastContainer();
        toastContainer.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
        
        // Close button functionality
        toast.querySelector('.toast-close').addEventListener('click', () => {
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

// Initialize events page when DOM is loaded
let eventsPage;
document.addEventListener('DOMContentLoaded', () => {
    eventsPage = new EventsPage();
});
