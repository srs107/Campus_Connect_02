/* DataStore: centralized local storage utils, API simulation, and state mgmt */
(function initDataStore(global) {
    'use strict';

    const DEFAULT_DELAY_MS = 350;
    const ERROR_PROBABILITY = 0.03; // 3% simulated error

    function delay(ms = DEFAULT_DELAY_MS) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function maybeThrowSimulatedError() {
        if (Math.random() < ERROR_PROBABILITY) {
            throw new Error('Network error: please try again');
        }
    }

    class EventBus {
        constructor() {
            this.listeners = new Map(); // event -> Set<fn>
        }
        on(eventName, listener) {
            if (!this.listeners.has(eventName)) this.listeners.set(eventName, new Set());
            this.listeners.get(eventName).add(listener);
            return () => this.off(eventName, listener);
        }
        off(eventName, listener) {
            this.listeners.get(eventName)?.delete(listener);
        }
        emit(eventName, payload) {
            this.listeners.get(eventName)?.forEach(fn => {
                try { fn(payload); } catch (_) {}
            });
        }
    }

    const Storage = {
        get(key, fallback = null) {
            try {
                const raw = localStorage.getItem(key);
                return raw ? JSON.parse(raw) : fallback;
            } catch (_) {
                return fallback;
            }
        },
        set(key, value) {
            localStorage.setItem(key, JSON.stringify(value));
        },
        remove(key) {
            localStorage.removeItem(key);
        }
    };

    function getCurrentUser() {
        const username = localStorage.getItem('username') || null;
        const userRole = localStorage.getItem('userRole') || null;
        return username ? { username, userRole: userRole || 'student' } : null;
    }

    function setCurrentUser(user) {
        const username = user?.username || null;
        const userRole = user?.userRole || 'student';
        if (username) {
            localStorage.setItem('username', username);
            localStorage.setItem('userRole', userRole);
        }
        State.currentUser = username ? { username, userRole } : null;
        Bus.emit('user:changed', State.currentUser);
    }

    function clearOnLogout() {
        const user = getCurrentUser();
        // Clear user-identifying keys
        localStorage.removeItem('username');
        localStorage.removeItem('userRole');

        // Clear notifications scoped to this user
        if (user) {
            const notifKey = `notifications_${user.userRole || 'student'}_${user.username}`;
            localStorage.removeItem(notifKey);
        }

        // Optionally clear transient caches
        // Keep theme unless explicitly reset
        localStorage.removeItem('events_cache');
        // Filters
        localStorage.removeItem('filters_events');
        localStorage.removeItem('filters_clubs');

        State.currentUser = null;
        Bus.emit('user:changed', null);
    }

    // Theme
    function getTheme() {
        return localStorage.getItem('theme') || 'light';
    }
    function setTheme(theme) {
        const normalized = theme === 'dark' ? 'dark' : 'light';
        localStorage.setItem('theme', normalized);
        State.theme = normalized;
        Bus.emit('theme:changed', normalized);
    }

    // Notifications
    function notificationsKey() {
        const user = getCurrentUser();
        const username = user?.username || 'guest';
        const role = user?.userRole || 'student';
        return `notifications_${role}_${username}`;
    }
    function loadNotifications() {
        const list = Storage.get(notificationsKey(), []);
        State.notifications = Array.isArray(list) ? list : [];
        return State.notifications;
    }
    function saveNotifications(list) {
        const normalized = Array.isArray(list) ? list.slice(0, 200) : [];
        Storage.set(notificationsKey(), normalized);
        State.notifications = normalized;
        Bus.emit('notifications:changed', normalized);
    }
    function addNotification(notification) {
        const list = loadNotifications();
        list.unshift({ ...notification, id: notification.id || `n-${Date.now()}`, read: !!notification.read });
        saveNotifications(list.slice(0, 200));
    }

    // Filters
    function getFilterState(scopeName) {
        return Storage.get(`filters_${scopeName}`, null);
    }
    function setFilterState(scopeName, state) {
        Storage.set(`filters_${scopeName}`, state);
        Bus.emit(`filters:${scopeName}`, state);
    }
    function clearFilterState(scopeName) {
        Storage.remove(`filters_${scopeName}`);
        Bus.emit(`filters:${scopeName}`, null);
    }

    // API Simulation and caches
    async function fetchJson(url) {
        Bus.emit('loading:start', { key: url });
        try {
            maybeThrowSimulatedError();
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Failed to load ${url}`);
            const json = await res.json();
            await delay();
            return json;
        } finally {
            Bus.emit('loading:end', { key: url });
        }
    }

    async function getEvents(forceRefresh = false) {
        const cache = Storage.get('events_cache', null);
        if (cache && !forceRefresh) {
            State.events = cache;
            return cache;
        }
        const data = await fetchJson('data/events.json');
        Storage.set('events_cache', data);
        State.events = data;
        return data;
    }
    function saveEvents(events) {
        Storage.set('events_cache', events);
        State.events = events;
        Bus.emit('events:changed', events);
    }
    async function createEvent(newEvent) {
        await delay();
        const list = (await getEvents()) || [];
        const id = Math.max(0, ...list.map(e => Number(e.id) || 0)) + 1;
        const created = { ...newEvent, id };
        const next = [created, ...list];
        saveEvents(next);
        return created;
    }
    async function updateEvent(eventId, updates) {
        await delay();
        const list = (await getEvents()) || [];
        const idx = list.findIndex(e => String(e.id) === String(eventId));
        if (idx === -1) throw new Error('Event not found');
        const updated = { ...list[idx], ...updates };
        const next = list.slice();
        next[idx] = updated;
        saveEvents(next);
        return updated;
    }
    async function deleteEvent(eventId) {
        await delay();
        const list = (await getEvents()) || [];
        const next = list.filter(e => String(e.id) !== String(eventId));
        if (next.length === list.length) throw new Error('Event not found');
        saveEvents(next);
        return true;
    }

    async function getClubs(forceRefresh = false) {
        const cache = Storage.get('clubs_cache', null);
        if (cache && !forceRefresh) return cache;
        const data = await fetchJson('data/clubs.json');
        Storage.set('clubs_cache', data);
        return data;
    }

    const State = {
        currentUser: getCurrentUser(),
        theme: getTheme(),
        events: Storage.get('events_cache', null),
        notifications: []
    };

    const Bus = new EventBus();

    const DataStore = {
        bus: Bus,
        state: State,
        // User
        getCurrentUser,
        setCurrentUser,
        clearOnLogout,
        // Theme
        getTheme,
        setTheme,
        // Notifications
        notifications: {
            load: loadNotifications,
            save: saveNotifications,
            add: addNotification
        },
        // Filters
        getFilterState,
        setFilterState,
        clearFilterState,
        // API simulation
        api: {
            fetchJson,
            getEvents,
            saveEvents,
            createEvent,
            updateEvent,
            deleteEvent,
            getClubs
        }
    };

    global.DataStore = DataStore;
})(window);


