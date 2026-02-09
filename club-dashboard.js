// Club Dashboard JavaScript
class ClubDashboard {
    constructor() {
        this.clubName = "Technology Innovation Club";
        this.clubEvents = [];
        this.allEvents = [];
        this.selectedTemplate = null;
        
        this.initializeElements();
        this.bindEvents();
        this.loadEventsData();
    }

    initializeElements() {
        // Statistics elements
        this.totalClubEvents = document.getElementById('totalClubEvents');
        this.pendingClubEvents = document.getElementById('pendingClubEvents');
        this.approvedClubEvents = document.getElementById('approvedClubEvents');
        this.totalClubRegistrations = document.getElementById('totalClubRegistrations');

        // Table elements
        this.clubEventsTableBody = document.getElementById('clubEventsTableBody');
        this.clubEventsSearch = document.getElementById('clubEventsSearch');
        this.clubStatusFilter = document.getElementById('clubStatusFilter');

        // Modal elements
        this.addEventBtn = document.getElementById('addEventBtn');
        this.eventCreationModal = document.getElementById('eventCreationModal');
        this.modalClose = document.getElementById('modalClose');
        this.templateGrid = document.getElementById('templateGrid');
        this.eventCreationForm = document.getElementById('eventCreationForm');

        // Form elements
        this.eventTitle = document.getElementById('eventTitle');
        this.eventCategory = document.getElementById('eventCategory');
        this.eventDate = document.getElementById('eventDate');
        this.eventTime = document.getElementById('eventTime');
        this.eventLocation = document.getElementById('eventLocation');
        this.eventDuration = document.getElementById('eventDuration');
        this.eventDifficulty = document.getElementById('eventDifficulty');
        this.eventMaxParticipants = document.getElementById('eventMaxParticipants');
        this.eventDescription = document.getElementById('eventDescription');
        this.eventPrice = document.getElementById('eventPrice');
        this.eventImage = document.getElementById('eventImage');

        // Buttons
        this.cancelEventBtn = document.getElementById('cancelEventBtn');
        this.submitEventBtn = document.getElementById('submitEventBtn');

        // Preview elements
        this.eventPreview = document.getElementById('eventPreview');
        this.previewTitle = document.getElementById('previewTitle');
        this.previewDescription = document.getElementById('previewDescription');
        this.previewDate = document.getElementById('previewDate');
        this.previewTime = document.getElementById('previewTime');
        this.previewLocation = document.getElementById('previewLocation');
        this.previewImage = document.getElementById('previewImage');

        // Other elements
        this.upcomingEventsGrid = document.getElementById('upcomingEventsGrid');
        this.clubLogout = document.getElementById('clubLogout');
    }

    bindEvents() {
        // Add event button
        this.addEventBtn?.addEventListener('click', () => this.openEventCreationModal());

        // Modal close
        this.modalClose?.addEventListener('click', () => this.closeEventCreationModal());
        this.cancelEventBtn?.addEventListener('click', () => this.closeEventCreationModal());

        // Template selection
        this.templateGrid?.addEventListener('click', (e) => {
            const templateCard = e.target.closest('.template-card');
            if (templateCard) {
                this.selectTemplate(templateCard.dataset.template);
            }
        });

        // Form submission
        this.eventCreationForm?.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Form validation
        this.eventTitle?.addEventListener('input', () => this.updatePreview());
        this.eventDescription?.addEventListener('input', () => this.updatePreview());
        this.eventDate?.addEventListener('change', () => this.updatePreview());
        this.eventTime?.addEventListener('change', () => this.updatePreview());
        this.eventLocation?.addEventListener('input', () => this.updatePreview());

        // Image upload
        this.eventImage?.addEventListener('change', (e) => this.handleImageUpload(e));

        // Search and filter
        this.clubEventsSearch?.addEventListener('input', (e) => this.handleSearch(e.target.value));
        this.clubStatusFilter?.addEventListener('change', (e) => this.handleStatusFilter(e.target.value));

        // Logout
        this.clubLogout?.addEventListener('click', () => this.handleLogout());

        // Close modal on overlay click
        this.eventCreationModal?.addEventListener('click', (e) => {
            if (e.target === this.eventCreationModal) {
                this.closeEventCreationModal();
            }
        });
    }

    async loadEventsData() {
        try {
            const response = await fetch('data/events.json');
            if (!response.ok) {
                throw new Error('Failed to load events data');
            }

            this.allEvents = await response.json();
            this.clubEvents = this.allEvents.filter(event => event.clubName === this.clubName);
            
            // Add demo pending events
            this.addDemoPendingEvents();
            this.processEvents();
            this.updateStatistics();
            this.renderClubEventsTable();
            this.loadUpcomingEvents();

        } catch (error) {
            console.error('Error loading events:', error);
            this.showToast('Failed to load events data', 'error');
        }
    }

    addDemoPendingEvents() {
        const pendingEvents = [
            {
                id: 19,
                title: "AI Workshop Series",
                description: "Learn about artificial intelligence and machine learning",
                image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop",
                clubName: this.clubName,
                clubLogo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=80&h=80&fit=crop",
                date: "2025-07-10T14:00:00",
                time: "2:00 PM",
                location: "Computer Lab 2",
                status: "pending",
                maxParticipants: 25,
                currentParticipants: 0,
                category: "Technology",
                difficulty: "Intermediate",
                duration: "4 Hours",
                price: 600
            }
        ];

        this.clubEvents = [...this.clubEvents, ...pendingEvents];
    }

    processEvents() {
        this.clubEvents = this.clubEvents.map(event => {
            const eventDate = new Date(event.date);
            return {
                ...event,
                formattedDate: eventDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                })
            };
        });
    }

    updateStatistics() {
        if (!this.totalClubEvents || !this.pendingClubEvents || !this.approvedClubEvents || !this.totalClubRegistrations) return;

        const total = this.clubEvents.length;
        const pending = this.clubEvents.filter(event => event.status === 'pending').length;
        const approved = this.clubEvents.filter(event => event.status === 'approved').length;
        
        const registrations = JSON.parse(localStorage.getItem('eventRegistrations') || '[]');
        const clubRegistrations = registrations.filter(reg => 
            this.clubEvents.some(event => event.id == reg.eventId)
        ).length;

        this.totalClubEvents.textContent = total;
        this.pendingClubEvents.textContent = pending;
        this.approvedClubEvents.textContent = approved;
        this.totalClubRegistrations.textContent = clubRegistrations;
    }

    renderClubEventsTable() {
        if (!this.clubEventsTableBody) return;

        if (this.clubEvents.length === 0) {
            this.clubEventsTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="no-events">
                        <div class="no-events-content">
                            <i class="fas fa-calendar-plus"></i>
                            <h3>No events found</h3>
                            <p>Create your first event</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        this.clubEventsTableBody.innerHTML = this.clubEvents.map(event => `
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
                        <button class="btn-action btn-edit" onclick="clubDashboard.editEvent(${event.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="clubDashboard.deleteEvent(${event.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    loadUpcomingEvents() {
        if (!this.upcomingEventsGrid) return;

        const upcomingEvents = this.allEvents
            .filter(event => {
                const eventDate = new Date(event.date);
                return eventDate > new Date() && event.status === 'approved';
            })
            .slice(0, 6);

        if (upcomingEvents.length === 0) {
            this.upcomingEventsGrid.innerHTML = `
                <div class="no-upcoming-events">
                    <i class="fas fa-calendar-times"></i>
                    <h3>No upcoming events</h3>
                    <p>Check back later for new events</p>
                </div>
            `;
            return;
        }

        this.upcomingEventsGrid.innerHTML = upcomingEvents.map(event => {
            const eventDate = new Date(event.date);
            const formattedDate = eventDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });

            return `
                <div class="upcoming-event-card">
                    <div class="upcoming-event-image">
                        <img src="${event.image}" alt="${event.title}">
                    </div>
                    <div class="upcoming-event-content">
                        <h4 class="upcoming-event-title">${event.title}</h4>
                        <p class="upcoming-event-club">${event.clubName}</p>
                        <div class="upcoming-event-meta">
                            <span><i class="fas fa-calendar"></i> ${formattedDate}</span>
                            <span><i class="fas fa-clock"></i> ${event.time}</span>
                            <span><i class="fas fa-map-marker-alt"></i> ${event.location}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    openEventCreationModal() {
        this.eventCreationModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.resetForm();
    }

    closeEventCreationModal() {
        this.eventCreationModal.classList.remove('active');
        document.body.style.overflow = '';
        this.resetForm();
    }

    selectTemplate(templateType) {
        document.querySelectorAll('.template-card').forEach(card => {
            card.classList.remove('selected');
        });

        const selectedCard = document.querySelector(`[data-template="${templateType}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }

        this.selectedTemplate = templateType;
        this.populateTemplateData(templateType);
        this.showEventCreationForm();
    }

    populateTemplateData(templateType) {
        const templates = {
            workshop: {
                title: "Workshop Title",
                category: "Technology",
                duration: "4 Hours",
                difficulty: "Intermediate",
                description: "Join us for an interactive workshop where you'll learn hands-on skills and techniques.",
                price: 500
            },
            competition: {
                title: "Competition Name",
                category: "Technology",
                duration: "6 Hours",
                difficulty: "Advanced",
                description: "Compete with fellow students in this exciting competition.",
                price: 300
            },
            seminar: {
                title: "Seminar Topic",
                category: "Academic",
                duration: "2 Hours",
                difficulty: "All Levels",
                description: "Attend an informative seminar featuring expert speakers.",
                price: 200
            },
            social: {
                title: "Social Event",
                category: "Cultural",
                duration: "3 Hours",
                difficulty: "All Levels",
                description: "Connect with fellow students in a relaxed social setting.",
                price: 100
            },
            custom: {
                title: "",
                category: "",
                duration: "",
                difficulty: "",
                description: "",
                price: 0
            }
        };

        const template = templates[templateType];
        if (template) {
            this.eventTitle.value = template.title;
            this.eventCategory.value = template.category;
            this.eventDuration.value = template.duration;
            this.eventDifficulty.value = template.difficulty;
            this.eventDescription.value = template.description;
            this.eventPrice.value = template.price;
        }
    }

    showEventCreationForm() {
        this.eventCreationForm.style.display = 'block';
        this.updatePreview();
    }

    resetForm() {
        this.selectedTemplate = null;
        this.eventCreationForm.style.display = 'none';
        this.eventPreview.style.display = 'none';
        this.eventCreationForm.reset();
        
        document.querySelectorAll('.template-card').forEach(card => {
            card.classList.remove('selected');
        });
    }

    handleSearch(value) {
        // Simple search implementation
        console.log('Search:', value);
    }

    handleStatusFilter(value) {
        // Simple filter implementation
        console.log('Filter:', value);
    }

    handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                this.showToast('Image size must be less than 5MB', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                this.previewImage.innerHTML = `<img src="${e.target.result}" alt="Event preview">`;
            };
            reader.readAsDataURL(file);
        }
    }

    updatePreview() {
        if (!this.eventTitle.value || !this.eventDescription.value) {
            this.eventPreview.style.display = 'none';
            return;
        }

        this.eventPreview.style.display = 'block';
        this.previewTitle.textContent = this.eventTitle.value;
        this.previewDescription.textContent = this.eventDescription.value;
        
        if (this.eventDate.value) {
            const date = new Date(this.eventDate.value);
            this.previewDate.textContent = date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        }
        
        this.previewTime.textContent = this.eventTime.value || 'TBD';
        this.previewLocation.textContent = this.eventLocation.value || 'TBD';
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        this.submitEventBtn.disabled = true;
        this.submitEventBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            const newEvent = {
                id: Date.now(),
                title: this.eventTitle.value.trim(),
                description: this.eventDescription.value.trim(),
                image: this.previewImage.querySelector('img')?.src || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop",
                clubName: this.clubName,
                clubLogo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=80&h=80&fit=crop",
                date: `${this.eventDate.value}T${this.eventTime.value}:00`,
                time: this.eventTime.value,
                location: this.eventLocation.value.trim(),
                status: "pending",
                maxParticipants: parseInt(this.eventMaxParticipants.value),
                currentParticipants: 0,
                category: this.eventCategory.value,
                difficulty: this.eventDifficulty.value,
                duration: this.eventDuration.value,
                price: parseInt(this.eventPrice.value) || 0
            };

            this.clubEvents.push(newEvent);
            this.updateStatistics();
            this.renderClubEventsTable();
            this.closeEventCreationModal();
            this.showToast('Event submitted for approval successfully!', 'success');

        } catch (error) {
            console.error('Error submitting event:', error);
            this.showToast('Failed to submit event. Please try again.', 'error');
        } finally {
            this.submitEventBtn.disabled = false;
            this.submitEventBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit for Approval';
        }
    }

    editEvent(eventId) {
        this.showToast('Edit functionality would be implemented here', 'info');
    }

    deleteEvent(eventId) {
        if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            this.clubEvents = this.clubEvents.filter(event => event.id !== eventId);
            this.updateStatistics();
            this.renderClubEventsTable();
            this.showToast('Event deleted successfully', 'success');
        }
    }

    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            window.location.href = 'index.html';
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-header">
                <span class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</span>
                <button class="toast-close">&times;</button>
            </div>
            <div class="toast-message">${message}</div>
        `;
        
        const toastContainer = document.getElementById('toastContainer');
        if (toastContainer) {
            toastContainer.appendChild(toast);
            setTimeout(() => toast.classList.add('show'), 100);
            
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 5000);
            
            toast.querySelector('.toast-close').addEventListener('click', () => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            });
        }
    }
}

// Initialize club dashboard
let clubDashboard;
document.addEventListener('DOMContentLoaded', () => {
    clubDashboard = new ClubDashboard();
});

// Additional CSS
const additionalStyles = `
    .no-events, .no-upcoming-events {
        text-align: center;
        padding: var(--spacing-2xl);
        color: var(--gray-500);
    }

    .no-events-content i, .no-upcoming-events i {
        font-size: 3rem;
        margin-bottom: var(--spacing-md);
    }

    .no-events-content h3, .no-upcoming-events h3 {
        margin-bottom: var(--spacing-sm);
        color: var(--gray-700);
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

const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
