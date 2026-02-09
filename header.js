document.addEventListener('DOMContentLoaded', () => {
    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-container').innerHTML = data;

            // Highlight the active link based on current page
            const path = window.location.pathname.split('/').pop();
            document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach(link => {
                if (link.getAttribute('href') === path) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });

            // Attach event listeners for mobile menu and other functionalities
            const mobileMenuBtn = document.getElementById('mobileMenuBtn');
            const mobileNav = document.getElementById('mobileNav');
            const mobileNavClose = document.getElementById('mobileNavClose');

            mobileMenuBtn?.addEventListener('click', () => {
                mobileNav.classList.toggle('active');
                document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
            });

            mobileNavClose?.addEventListener('click', () => {
                mobileNav.classList.remove('active');
                document.body.style.overflow = '';
            });

            // Theme toggle logic
            const themeToggle = document.getElementById('themeToggle');
            const themeToggleMobile = document.getElementById('themeToggleMobile');
            const themeIcon = document.getElementById('themeIcon');
            const themeIconMobile = document.getElementById('themeIconMobile');

            const toggleTheme = () => {
                const isDark = document.body.classList.toggle('dark-theme');
                const newTheme = isDark ? 'dark' : 'light';
                localStorage.setItem('theme', newTheme);
                if (themeIcon) themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
                if (themeIconMobile) themeIconMobile.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
            };

            themeToggle?.addEventListener('click', toggleTheme);
            themeToggleMobile?.addEventListener('click', toggleTheme);

            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') {
                document.body.classList.add('dark-theme');
                if (themeIcon) themeIcon.className = 'fas fa-sun';
                if (themeIconMobile) themeIconMobile.className = 'fas fa-sun';
            }

            // User menu dropdown logic
            const userMenu = document.getElementById('userMenu');
            const userMenuDropdown = document.getElementById('userMenuDropdown');
            userMenu?.addEventListener('click', (e) => {
                e.stopPropagation();
                userMenuDropdown.classList.toggle('active');
            });

            document.addEventListener('click', (e) => {
                if (!userMenuDropdown.contains(e.target) && !userMenu.contains(e.target)) {
                    userMenuDropdown.classList.remove('active');
                }
            });
            
            // Logout logic
            document.querySelectorAll('.logout-btn, .logout-link').forEach(button => {
                button.addEventListener('click', () => {
                    localStorage.clear();
                    window.location.href = 'index.html';
                });
            });

            // User data display
            const username = localStorage.getItem('username');
            const userRole = localStorage.getItem('userRole');
            if (username) {
                document.querySelectorAll('.user-name').forEach(el => el.textContent = username);
            }
            if (userRole) {
                document.querySelectorAll('.user-role').forEach(el => el.textContent = userRole.charAt(0).toUpperCase() + userRole.slice(1));
            }

            // Notification logic (simplified for now)
            const notificationBtn = document.getElementById('notificationBtn');
            const notificationDropdown = document.getElementById('notificationDropdown');
            notificationBtn?.addEventListener('click', (e) => {
                e.stopPropagation();
                notificationDropdown.classList.toggle('active');
            });
            document.addEventListener('click', (e) => {
                if (!notificationDropdown.contains(e.target) && !notificationBtn.contains(e.target)) {
                    notificationDropdown.classList.remove('active');
                }
            });
        })
        .catch(error => console.error('Error loading header:', error));
});