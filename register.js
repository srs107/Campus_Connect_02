// Registration Page JavaScript
class RegistrationPage {
    constructor() {
        this.eventId = null;
        this.eventData = null;
        this.initializeElements();
        this.bindEvents();
        this.loadEventData();
    }

    initializeElements() {
        // Loading and error states
        this.loadingContainer = document.getElementById('loadingContainer');
        this.errorContainer = document.getElementById('errorContainer');
        this.registrationContent = document.getElementById('registrationContent');

        // Event details elements
        this.eventImage = document.getElementById('eventImage');
        this.eventStatus = document.getElementById('eventStatus');
        this.clubLogo = document.getElementById('clubLogo');
        this.clubName = document.getElementById('clubName');
        this.eventTitle = document.getElementById('eventTitle');
        this.eventDescription = document.getElementById('eventDescription');
        this.eventDate = document.getElementById('eventDate');
        this.eventTime = document.getElementById('eventTime');
        this.eventLocation = document.getElementById('eventLocation');
        this.eventCapacity = document.getElementById('eventCapacity');
        this.eventCategory = document.getElementById('eventCategory');
        this.eventDifficulty = document.getElementById('eventDifficulty');
        this.priceAmount = document.getElementById('priceAmount');

        // Form elements
        this.registrationForm = document.getElementById('registrationForm');
        this.fullNameInput = document.getElementById('fullName');
        this.emailInput = document.getElementById('email');
        this.phoneInput = document.getElementById('phone');
        this.rollNumberInput = document.getElementById('rollNumber');
        this.departmentSelect = document.getElementById('department');
        this.yearOfStudySelect = document.getElementById('yearOfStudy');
        this.additionalInfoTextarea = document.getElementById('additionalInfo');
        this.submitBtn = document.getElementById('submitBtn');
        this.cancelBtn = document.getElementById('cancelBtn');

        // Error message elements
        this.fullNameError = document.getElementById('fullNameError');
        this.emailError = document.getElementById('emailError');
        this.phoneError = document.getElementById('phoneError');
        this.rollNumberError = document.getElementById('rollNumberError');
        this.departmentError = document.getElementById('departmentError');
        this.yearOfStudyError = document.getElementById('yearOfStudyError');

        // Success modal elements
        this.successModal = document.getElementById('successModal');
        this.successEventTitle = document.getElementById('successEventTitle');
        this.registrationDetails = document.getElementById('registrationDetails');
        this.viewEventsBtn = document.getElementById('viewEventsBtn');
        this.downloadTicketBtn = document.getElementById('downloadTicketBtn');
    }

    bindEvents() {
        // Form submission
        this.registrationForm?.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Cancel button
        this.cancelBtn?.addEventListener('click', () => this.handleCancel());

        // Real-time validation
        this.fullNameInput?.addEventListener('blur', () => this.validateFullName());
        this.emailInput?.addEventListener('blur', () => this.validateEmail());
        this.phoneInput?.addEventListener('blur', () => this.validatePhone());
        this.rollNumberInput?.addEventListener('blur', () => this.validateRollNumber());
        this.departmentSelect?.addEventListener('change', () => this.validateDepartment());
        this.yearOfStudySelect?.addEventListener('change', () => this.validateYearOfStudy());

        // Phone number formatting
        this.phoneInput?.addEventListener('input', (e) => this.formatPhoneNumber(e));

        // Success modal buttons
        this.viewEventsBtn?.addEventListener('click', () => this.handleViewEvents());
        this.downloadTicketBtn?.addEventListener('click', () => this.handleDownloadTicket());

        // Close modal on overlay click
        this.successModal?.addEventListener('click', (e) => {
            if (e.target === this.successModal) {
                this.closeSuccessModal();
            }
        });
    }

    getEventIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    async loadEventData() {
        try {
            this.eventId = this.getEventIdFromURL();
            
            if (!this.eventId) {
                this.showError('No event ID provided');
                return;
            }

            // Load events data
            const response = await fetch('data/events.json');
            if (!response.ok) {
                throw new Error('Failed to load events data');
            }

            const events = await response.json();
            this.eventData = events.find(event => event.id == this.eventId);

            if (!this.eventData) {
                this.showError('Event not found');
                return;
            }

            this.populateEventDetails();
            this.showRegistrationContent();

        } catch (error) {
            console.error('Error loading event data:', error);
            this.showError('Failed to load event details');
        }
    }

    populateEventDetails() {
        if (!this.eventData) return;

        // Set event image and alt text
        this.eventImage.src = this.eventData.image;
        this.eventImage.alt = this.eventData.title;

        // Set club logo and name
        this.clubLogo.src = this.eventData.clubLogo;
        this.clubLogo.alt = this.eventData.clubName;
        this.clubName.textContent = this.eventData.clubName;

        // Set event title and description
        this.eventTitle.textContent = this.eventData.title;
        this.eventDescription.textContent = this.eventData.description;

        // Format and set date
        const eventDate = new Date(this.eventData.date);
        const formattedDate = eventDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        this.eventDate.textContent = formattedDate;

        // Set other event details
        this.eventTime.textContent = this.eventData.time;
        this.eventLocation.textContent = this.eventData.location;
        this.eventCapacity.textContent = `${this.eventData.currentParticipants}/${this.eventData.maxParticipants}`;
        this.eventCategory.textContent = this.eventData.category;
        this.eventDifficulty.textContent = this.eventData.difficulty;

        // Set price
        this.priceAmount.textContent = this.eventData.price;

        // Update page title
        document.title = `Register for ${this.eventData.title} - Campus Connect`;

        // Check if event is full
        if (this.eventData.currentParticipants >= this.eventData.maxParticipants) {
            this.showEventFullMessage();
        }
    }

    showEventFullMessage() {
        this.eventStatus.innerHTML = '<i class="fas fa-times"></i><span>Full</span>';
        this.eventStatus.style.background = '#ef4444';
        this.submitBtn.disabled = true;
        this.submitBtn.textContent = 'Event Full';
        this.submitBtn.style.opacity = '0.5';
    }

    showLoading() {
        this.loadingContainer.style.display = 'block';
        this.errorContainer.style.display = 'none';
        this.registrationContent.style.display = 'none';
    }

    showError(message) {
        this.loadingContainer.style.display = 'none';
        this.errorContainer.style.display = 'block';
        this.registrationContent.style.display = 'none';
        
        const errorMessage = this.errorContainer.querySelector('p');
        if (errorMessage) {
            errorMessage.textContent = message;
        }
    }

    showRegistrationContent() {
        this.loadingContainer.style.display = 'none';
        this.errorContainer.style.display = 'none';
        this.registrationContent.style.display = 'block';
    }

    // Form Validation Methods
    validateFullName() {
        const value = this.fullNameInput.value.trim();
        const errorElement = this.fullNameError;
        
        if (!value) {
            this.showFieldError(this.fullNameInput, errorElement, 'Full name is required');
            return false;
        }
        
        if (value.length < 2) {
            this.showFieldError(this.fullNameInput, errorElement, 'Full name must be at least 2 characters');
            return false;
        }
        
        if (!/^[a-zA-Z\s]+$/.test(value)) {
            this.showFieldError(this.fullNameInput, errorElement, 'Full name can only contain letters and spaces');
            return false;
        }
        
        this.clearFieldError(this.fullNameInput, errorElement);
        return true;
    }

    validateEmail() {
        const value = this.emailInput.value.trim();
        const errorElement = this.emailError;
        
        if (!value) {
            this.showFieldError(this.emailInput, errorElement, 'Email is required');
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            this.showFieldError(this.emailInput, errorElement, 'Please enter a valid email address');
            return false;
        }
        
        this.clearFieldError(this.emailInput, errorElement);
        return true;
    }

    validatePhone() {
        const value = this.phoneInput.value.replace(/\D/g, '');
        const errorElement = this.phoneError;
        
        if (!value) {
            this.showFieldError(this.phoneInput, errorElement, 'Phone number is required');
            return false;
        }
        
        if (value.length !== 10) {
            this.showFieldError(this.phoneInput, errorElement, 'Phone number must be 10 digits');
            return false;
        }
        
        if (!/^[6-9]\d{9}$/.test(value)) {
            this.showFieldError(this.phoneInput, errorElement, 'Please enter a valid Indian phone number');
            return false;
        }
        
        this.clearFieldError(this.phoneInput, errorElement);
        return true;
    }

    validateRollNumber() {
        const value = this.rollNumberInput.value.trim();
        const errorElement = this.rollNumberError;
        
        if (!value) {
            this.showFieldError(this.rollNumberInput, errorElement, 'Roll number is required');
            return false;
        }
        
        if (value.length < 3) {
            this.showFieldError(this.rollNumberInput, errorElement, 'Roll number must be at least 3 characters');
            return false;
        }
        
        this.clearFieldError(this.rollNumberInput, errorElement);
        return true;
    }

    validateDepartment() {
        const value = this.departmentSelect.value;
        const errorElement = this.departmentError;
        
        if (!value) {
            this.showFieldError(this.departmentSelect, errorElement, 'Please select your department');
            return false;
        }
        
        this.clearFieldError(this.departmentSelect, errorElement);
        return true;
    }

    validateYearOfStudy() {
        const value = this.yearOfStudySelect.value;
        const errorElement = this.yearOfStudyError;
        
        if (!value) {
            this.showFieldError(this.yearOfStudySelect, errorElement, 'Please select your year of study');
            return false;
        }
        
        this.clearFieldError(this.yearOfStudySelect, errorElement);
        return true;
    }

    showFieldError(input, errorElement, message) {
        input.classList.add('error');
        errorElement.textContent = message;
    }

    clearFieldError(input, errorElement) {
        input.classList.remove('error');
        errorElement.textContent = '';
    }

    formatPhoneNumber(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 10) {
            value = value.slice(0, 10);
        }
        e.target.value = value;
    }

    validateForm() {
        const validations = [
            this.validateFullName(),
            this.validateEmail(),
            this.validatePhone(),
            this.validateRollNumber(),
            this.validateDepartment(),
            this.validateYearOfStudy()
        ];
        
        return validations.every(validation => validation === true);
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            this.showToast('Please fix the errors in the form', 'error');
            return;
        }

        // Check if event is full
        if (this.eventData.currentParticipants >= this.eventData.maxParticipants) {
            this.showToast('Sorry, this event is full', 'error');
            return;
        }

        // Disable submit button
        this.submitBtn.disabled = true;
        this.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Create registration data
            const registrationData = {
                id: this.generateRegistrationId(),
                eventId: this.eventId,
                eventTitle: this.eventData.title,
                registrationDate: new Date().toISOString(),
                participant: {
                    fullName: this.fullNameInput.value.trim(),
                    email: this.emailInput.value.trim(),
                    phone: this.phoneInput.value,
                    rollNumber: this.rollNumberInput.value.trim(),
                    department: this.departmentSelect.value,
                    yearOfStudy: this.yearOfStudySelect.value,
                    additionalInfo: this.additionalInfoTextarea.value.trim()
                },
                event: {
                    date: this.eventData.date,
                    time: this.eventData.time,
                    location: this.eventData.location,
                    price: this.eventData.price,
                    clubName: this.eventData.clubName
                }
            };

            // Store registration in localStorage
            this.saveRegistration(registrationData);

            // Update event capacity
            this.updateEventCapacity();

            // Show success modal
            this.showSuccessModal(registrationData);

        } catch (error) {
            console.error('Registration error:', error);
            this.showToast('Registration failed. Please try again.', 'error');
        } finally {
            // Re-enable submit button
            this.submitBtn.disabled = false;
            this.submitBtn.innerHTML = '<i class="fas fa-check"></i> Register for Event';
        }
    }

    generateRegistrationId() {
        return 'REG-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    saveRegistration(registrationData) {
        const registrations = JSON.parse(localStorage.getItem('eventRegistrations') || '[]');
        registrations.push(registrationData);
        localStorage.setItem('eventRegistrations', JSON.stringify(registrations));
    }

    updateEventCapacity() {
        // Update the displayed capacity
        const newCapacity = this.eventData.currentParticipants + 1;
        this.eventData.currentParticipants = newCapacity;
        this.eventCapacity.textContent = `${newCapacity}/${this.eventData.maxParticipants}`;

        // Check if event is now full
        if (newCapacity >= this.eventData.maxParticipants) {
            this.showEventFullMessage();
        }
    }

    showSuccessModal(registrationData) {
        // Populate success modal
        this.successEventTitle.textContent = registrationData.eventTitle;
        
        const detailsHTML = `
            <h4>Registration Details</h4>
            <div class="detail-item">
                <span class="detail-label">Registration ID:</span>
                <span class="detail-value">${registrationData.id}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Name:</span>
                <span class="detail-value">${registrationData.participant.fullName}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${registrationData.participant.email}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Event Date:</span>
                <span class="detail-value">${new Date(registrationData.event.date).toLocaleDateString()}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Event Time:</span>
                <span class="detail-value">${registrationData.event.time}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Location:</span>
                <span class="detail-value">${registrationData.event.location}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Registration Fee:</span>
                <span class="detail-value">₹${registrationData.event.price}</span>
            </div>
        `;
        
        this.registrationDetails.innerHTML = detailsHTML;
        
        // Show modal
        this.successModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeSuccessModal() {
        this.successModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    handleCancel() {
        if (confirm('Are you sure you want to cancel? Your form data will be lost.')) {
            window.history.back();
        }
    }

    handleViewEvents() {
        window.location.href = 'events.html';
    }

    handleDownloadTicket() {
        // Generate a simple ticket (in a real app, this would create a PDF)
        const ticketData = {
            registrationId: document.querySelector('.detail-value').textContent,
            eventTitle: this.eventData.title,
            participantName: this.fullNameInput.value.trim(),
            eventDate: new Date(this.eventData.date).toLocaleDateString(),
            eventTime: this.eventData.time,
            eventLocation: this.eventData.location
        };

        // Create a simple text ticket
        const ticketText = `
CAMPUS CONNECT - EVENT TICKET
============================

Registration ID: ${ticketData.registrationId}
Event: ${ticketData.eventTitle}
Participant: ${ticketData.participantName}
Date: ${ticketData.eventDate}
Time: ${ticketData.eventTime}
Location: ${ticketData.eventLocation}

Please bring this ticket to the event.
        `;

        // Create and download file
        const blob = new Blob([ticketText], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ticket-${ticketData.registrationId}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.showToast('Ticket downloaded successfully!', 'success');
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

// Initialize registration page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RegistrationPage();
});
