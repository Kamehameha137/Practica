/* ========================================
   EventDesign — общий UI-модуль
   ======================================== */

const UI = {
    // Показать уведомление
    toast(message, type = 'success') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${type === 'success'
                    ? '<path d="M20 6L9 17l-5-5"/>'
                    : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'}
            </svg>
            <span>${message}</span>
        `;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Подтверждение (модальное окно)
    confirm(title, message, onConfirm) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.innerHTML = `
            <div class="modal">
                <h3>${title}</h3>
                <p>${message}</p>
                <div class="modal-actions">
                    <button class="btn btn-secondary" data-action="cancel">Отмена</button>
                    <button class="btn btn-primary" data-action="confirm">Подтвердить</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay || e.target.dataset.action === 'cancel') {
                overlay.remove();
            } else if (e.target.dataset.action === 'confirm') {
                onConfirm();
                overlay.remove();
            }
        });
    },

    // Проверка авторизации — редирект на /login если не авторизован
    requireAuth() {
        const user = Storage.getCurrentUser();
        if (!user) {
            window.location.href = 'login.html';
            return null;
        }
        return user;
    },

    // Редирект авторизованного со страниц входа
    redirectIfAuth() {
        if (Storage.getCurrentUser()) {
            window.location.href = 'index.html';
        }
    },

    // Рендер навбара
    renderNavbar(activeLink = '') {
        const user = Storage.getCurrentUser();
        if (!user) return '';

        const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

        return `
            <nav class="navbar">
                <div class="navbar-inner">
                    <a href="index.html" class="logo">
                        EventDesign<span class="logo-dot"></span>
                    </a>
                    <ul class="nav-links">
                        <li><a href="index.html" class="nav-link ${activeLink === 'events' ? 'active' : ''}">Мероприятия</a></li>
                        <li><a href="create.html" class="nav-link ${activeLink === 'create' ? 'active' : ''}">Создать</a></li>
                        <li>
                            <button class="theme-toggle" onclick="UI.toggleTheme()" title="Переключить тему">
                                <svg id="theme-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="4"/>
                                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                                </svg>
                            </button>
                        </li>
                        <li>
                            <div class="user-avatar" onclick="UI.logout()" title="${user.name} — выйти">${initials}</div>
                        </li>
                    </ul>
                </div>
            </nav>
        `;
    },

    // Переключить тему
    toggleTheme() {
        const current = Storage.getTheme();
        const newTheme = current === 'light' ? 'dark' : 'light';
        Storage.setTheme(newTheme);
        this.updateThemeIcon(newTheme);
    },

    updateThemeIcon(theme) {
        const icon = document.getElementById('theme-icon');
        if (!icon) return;
        if (theme === 'dark') {
            icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
        } else {
            icon.innerHTML = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>';
        }
    },

    logout() {
        this.confirm('Выход из системы', 'Вы действительно хотите выйти?', () => {
            Storage.logout();
            window.location.href = 'login.html';
        });
    },

    // Форматирование даты
    formatDate(dateStr) {
        const date = new Date(dateStr);
        const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
            'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    },

    // Статус мероприятия (автоматически по дате)
    getEventStatus(event) {
        if (event.status) return event.status;
        const eventDate = new Date(event.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (eventDate < today) return 'completed';
        if (eventDate.toDateString() === today.toDateString()) return 'active';
        return 'upcoming';
    },

    getStatusLabel(status) {
        const labels = {
            upcoming: 'Предстоит',
            active: 'Сегодня',
            completed: 'Завершено'
        };
        return labels[status] || status;
    }
};

// После загрузки — обновим иконку темы
document.addEventListener('DOMContentLoaded', () => {
    UI.updateThemeIcon(Storage.getTheme());
});
