// Admin Dashboard JavaScript
class AdminDashboard {
    constructor() {
        this.events = [];
        this.filteredEvents = [];
        this.pendingEvents = [];
        this.filters = {
            search: '',
            status: 'all'
        };
        
        this.initializeElements();
        this.bindEvents();
        this.loadEventsData();
    }

    initializeElements() {
        // Statistics elements
        this.totalEvents = document.getElementById('totalEvents');
        this.pendingEvents = document.getElementById('pendingEvents');
        this.approvedEvents = document.getElementById('approvedEvents');
        this.totalRegistrations = document.getElementById('totalRegistrations');

        // Pending requests elements
        this.pendingRequestsContainer = document.getElementById('pendingRequestsContainer');
        this.refreshPendingBtn = document.getElementById('refreshPending');

        // Events table elements
        this.eventsTableBody = document.getElementById('eventsTableBody');
        this.eventsSearch = document.getElementById('eventsSearch');
        this.statusFilter = document.getElementById('statusFilter');
        this.clearFiltersBtn = document.getElementById('clearFilters');

        // Admin logout
        this.adminLogout = document.getElementById('adminLogout');
    }

    bindEvents() {
        // Refresh pending requests
        this.refreshPendingBtn?.addEventListener('click', () => this.loadPendingRequests());

        // Search and filter events
        this.eventsSearch?.addEventListener('input', (e) => this.handleSearch(e.target.value));
        this.statusFilter?.addEventListener('change', (e) => this.handleStatusFilter(e.target.value));
        this.clearFiltersBtn?.addEventListener('click', () => this.clearFilters());

        // Admin logout
        this.adminLogout?.addEventListener('click', () => this.handleLogout());
    }

    async loadEventsData() {
        try {
            // Load events from JSON file
            const response = await fetch('data/events.json');
            if (!response.ok) {
                throw new Error('Failed to load events data');
            }

            this.events = await response.json();
            
            // Process events and add some pending events for demo
            this.processEvents();
            
            // Update statistics
            this.updateStatistics();
            
            // Load pending requests
            this.loadPendingRequests();
            
            // Render events table
            this.renderEventsTable();

        } catch (error) {
            console.error('Error loading events:', error);
            this.showToast('Failed to load events data', 'error');
        }
    }

    processEvents() {
        // Add some pending events for demo purposes
        const pendingEvents = [
            {
                id: 16,
                title: "New Tech Workshop",
                description: "Advanced programming workshop for final year students",
                image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop",
                clubName: "Technology Innovation Club",
                clubLogo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=80&h=80&fit=crop",
                date: "2025-06-15T14:00:00",
                time: "2:00 PM",
                location: "Computer Lab 3",
                status: "pending",
                maxParticipants: 30,
                currentParticipants: 0,
                category: "Technology",
                difficulty: "Advanced",
                duration: "6 Hours",
                price: 800
            },
            {
                id: 17,
                title: "Art Exhibition 2025",
                description: "Annual student art exhibition showcasing creative talents",
                image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=250&fit=crop",
                clubName: "Creative Arts Club",
                clubLogo: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=80&h=80&fit=crop",
                date: "2025-06-20T17:00:00",
                time: "5:00 PM",
                location: "Art Gallery",
                status: "pending",
                maxParticipants: 100,
                currentParticipants: 0,
                category: "Arts",
                difficulty: "All Levels",
                duration: "4 Hours",
                price: 0
            },
            {
                id: 18,
                title: "Sports Tournament Finals",
                description: "Championship finals for various sports categories",
                image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop",
                clubName: "Sports & Fitness Club",
                clubLogo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=80&h=80&fit=crop",
                date: "2025-06-25T09:00:00",
                time: "9:00 AM",
                location: "Sports Complex",
                status: "pending",
                maxParticipants: 200,
                currentParticipants: 0,
                category: "Sports",
                difficulty: "All Levels",
                duration: "8 Hours",
                price: 500
            }
        ];

        // Add pending events to the main events array
        this.events = [...this.events, ...pendingEvents];

        // Process each event
        this.events = this.events.map(event => {
            const eventDate = new Date(event.date);
            const now = new Date();
            
            return {
                ...event,
                formattedDate: eventDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }),
                formattedTime: eventDate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                isUpcoming: eventDate > now,
                daysUntil: Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24))
            };
        });
    }

    updateStatistics() {
        if (!this.totalEvents || !this.pendingEvents || !this.approvedEvents || !this.totalRegistrations) return;

        const total = this.events.length;
        const pending = this.events.filter(event => event.status === 'pending').length;
        const approved = this.events.filter(event => event.status === 'approved').length;
        
        // Get total registrations from localStorage
        const registrations = JSON.parse(localStorage.getItem('eventRegistrations') || '[]');
        const totalRegistrations = registrations.length;

        this.totalEvents.textContent = total;
        this.pendingEvents.textContent = pending;
        this.approvedEvents.textContent = approved;
        this.totalRegistrations.textContent = totalRegistrations;
    }

    loadPendingRequests() {
        if (!this.pendingRequestsContainer) return;

        const pendingEvents = this.events.filter(event => event.status === 'pending');
        
        if (pendingEvents.length === 0) {
            this.pendingRequestsContainer.innerHTML = `
                <div class="no-pending-requests">
                    <i class="fas fa-check-circle"></i>
                    <h3>No Pending Requests</h3>
                    <p>All events have been reviewed and processed.</p>
                </div>
            `;
            return;
        }

        this.pendingRequestsContainer.innerHTML = pendingEvents.map(event => `
            <div class="pending-request-card" data-event-id="${event.id}">
                <div class="request-info">
                    <h4 class="request-title">${event.title}</h4>
                    <div class="request-meta">
                        <span><i class="fas fa-building"></i> ${event.clubName}</span>
                        <span><i class="fas fa-calendar"></i> ${event.formattedDate}</span>
                        <span><i class="fas fa-clock"></i> ${event.time}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${event.location}</span>
                    </div>
                </div>
                <div class="request-actions">
                    <button class="btn btn-primary btn-sm" onclick="adminDashboard.approveEvent(${event.id})">
                        <i class="fas fa-check"></i>
                        Approve
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="adminDashboard.rejectEvent(${event.id})">
                        <i class="fas fa-times"></i>
                        Reject
                    </button>
                </div>
            </div>
        `).join('');
    }

    handleSearch(value) {
        this.filters.search = value.toLowerCase();
        this.applyFilters();
    }

    handleStatusFilter(value) {
        this.filters.status = value;
        this.applyFilters();
    }

    clearFilters() {
        this.filters = {
            search: '',
            status: 'all'
        };
        
        this.eventsSearch.value = '';
        this.statusFilter.value = 'all';
        
        this.applyFilters();
    }

    applyFilters() {
        let filtered = [...this.events];

        // Apply search filter
        if (this.filters.search) {
            filtered = filtered.filter(event => 
                event.title.toLowerCase().includes(this.filters.search) ||
                event.clubName.toLowerCase().includes(this.filters.search) ||
                event.description.toLowerCase().includes(this.filters.search)
            );
        }

        // Apply status filter
        if (this.filters.status !== 'all') {
            filtered = filtered.filter(event => event.status === this.filters.status);
        }

        this.filteredEvents = filtered;
        this.renderEventsTable();
    }

    renderEventsTable() {
        if (!this.eventsTableBody) return;

        if (this.filteredEvents.length === 0) {
            this.eventsTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="no-events">
                        <div class="no-events-content">
                            <i class="fas fa-search"></i>
                            <h3>No events found</h3>
                            <p>Try adjusting your search criteria or filters</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        this.eventsTableBody.innerHTML = this.filteredEvents.map(event => `
            <tr data-event-id="${event.id}">
                <td>
                    <div class="event-cell">
                        <img src="${event.image}" alt="${event.title}" class="event-image">
                        <div class="event-details">
                            <h4>${event.title}</h4>
                            <p>${event.category} • ${event.difficulty}</p>
                        </div>
                    </div>
                </td>
                <td>${event.clubName}</td>
                <td>
                    <div>
                        <div>${event.formattedDate}</div>
                        <small>${event.time}</small>
                    </div>
                </td>
                <td>
                    <span class="status-badge ${event.status}">
                        ${event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                </td>
                <td>
                    <div>
                        <div>${event.currentParticipants}/${event.maxParticipants}</div>
                        <small>${Math.round((event.currentParticipants / event.maxParticipants) * 100)}% full</small>
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        ${event.status === 'pending' ? `
                            <button class="btn-action btn-approve" onclick="adminDashboard.approveEvent(${event.id})">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn-action btn-reject" onclick="adminDashboard.rejectEvent(${event.id})">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : `
                            <button class="btn-action btn-edit" onclick="adminDashboard.editEvent(${event.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                        `}
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async approveEvent(eventId) {
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update event status
            const event = this.events.find(e => e.id === eventId);
            if (event) {
                event.status = 'approved';
                
                // Update localStorage (in a real app, this would be an API call)
                this.updateEventInStorage(event);
                
                // Update UI
                this.updateStatistics();
                this.loadPendingRequests();
                this.renderEventsTable();
                
                this.showToast(`Event "${event.title}" has been approved`, 'success');
            }

        } catch (error) {
            console.error('Error approving event:', error);
            this.showToast('Failed to approve event', 'error');
        }
    }

    async rejectEvent(eventId) {
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update event status
            const event = this.events.find(e => e.id === eventId);
            if (event) {
                event.status = 'rejected';
                
                // Update localStorage (in a real app, this would be an API call)
                this.updateEventInStorage(event);
                
                // Update UI
                this.updateStatistics();
                this.loadPendingRequests();
                this.renderEventsTable();
                
                this.showToast(`Event "${event.title}" has been rejected`, 'success');
            }

        } catch (error) {
            console.error('Error rejecting event:', error);
            this.showToast('Failed to reject event', 'error');
        }
    }

    editEvent(eventId) {
        // In a real app, this would open an edit modal or redirect to an edit page
        this.showToast('Edit functionality would be implemented here', 'info');
    }

    updateEventInStorage(event) {
        // In a real app, this would be an API call
        // For now, we'll just update the local events array
        const eventIndex = this.events.findIndex(e => e.id === event.id);
        if (eventIndex !== -1) {
            this.events[eventIndex] = event;
        }
    }

    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            // In a real app, this would clear authentication tokens
            window.location.href = 'home.html';
        }
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
        const toastContainer = document.getElementById('toastContainer');
        if (toastContainer) {
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
    }
}

// Initialize admin dashboard when DOM is loaded
let adminDashboard;
document.addEventListener('DOMContentLoaded', () => {
    adminDashboard = new AdminDashboard();
});

// Additional CSS for admin dashboard
const additionalStyles = `
    .no-pending-requests {
        text-align: center;
        padding: var(--spacing-2xl);
        color: var(--gray-500);
    }

    .no-pending-requests i {
        font-size: 3rem;
        color: #10b981;
        margin-bottom: var(--spacing-md);
    }

    .no-pending-requests h3 {
        margin-bottom: var(--spacing-sm);
        color: var(--gray-700);
    }

    .no-events {
        text-align: center;
        padding: var(--spacing-2xl);
    }

    .no-events-content {
        color: var(--gray-500);
    }

    .no-events-content i {
        font-size: 3rem;
        margin-bottom: var(--spacing-md);
    }

    .no-events-content h3 {
        margin-bottom: var(--spacing-sm);
        color: var(--gray-700);
    }

    .btn-sm {
        padding: var(--spacing-xs) var(--spacing-sm);
        font-size: 0.875rem;
    }

    .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
    }

    .toast {
        background: var(--white);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        padding: var(--spacing-md);
        min-width: 300px;
        transform: translateX(100%);
        transition: transform var(--transition-normal);
    }

    .toast.show {
        transform: translateX(0);
    }

    .toast-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-sm);
    }

    .toast-title {
        font-weight: 600;
        font-size: 0.875rem;
    }

    .toast-close {
        background: none;
        border: none;
        font-size: 1.25rem;
        cursor: pointer;
        color: var(--gray-400);
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .toast-close:hover {
        color: var(--gray-600);
    }

    .toast-message {
        font-size: 0.875rem;
        color: var(--gray-700);
    }

    .toast.success {
        border-left: 4px solid #10b981;
    }

    .toast.error {
        border-left: 4px solid #ef4444;
    }

    .toast.info {
        border-left: 4px solid var(--primary-color);
    }

    .toast.success .toast-title {
        color: #10b981;
    }

    .toast.error .toast-title {
        color: #ef4444;
    }

    .toast.info .toast-title {
        color: var(--primary-color);
    }
`;

// Add styles to the document
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
