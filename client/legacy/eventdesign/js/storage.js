/* ========================================
   EventDesign — модуль работы с данными
   Используется localStorage для имитации базы данных
   ======================================== */

const Storage = {
    KEYS: {
        USERS: 'eventdesign_users',
        CURRENT_USER: 'eventdesign_current_user',
        EVENTS: 'eventdesign_events',
        THEME: 'eventdesign_theme'
    },

    // Работа с пользователями
    getUsers() {
        const data = localStorage.getItem(this.KEYS.USERS);
        return data ? JSON.parse(data) : [];
    },

    saveUsers(users) {
        localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
    },

    registerUser(userData) {
        const users = this.getUsers();
        // Проверка, что email не занят
        if (users.find(u => u.email === userData.email)) {
            return { success: false, error: 'Пользователь с таким email уже зарегистрирован' };
        }
        const newUser = {
            id: Date.now(),
            name: userData.name,
            email: userData.email,
            password: userData.password, // В реальном приложении — хешировать!
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        this.saveUsers(users);
        this.setCurrentUser(newUser);
        return { success: true, user: newUser };
    },

    loginUser(email, password) {
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) {
            return { success: false, error: 'Неверный email или пароль' };
        }
        this.setCurrentUser(user);
        return { success: true, user };
    },

    getCurrentUser() {
        const data = localStorage.getItem(this.KEYS.CURRENT_USER);
        return data ? JSON.parse(data) : null;
    },

    setCurrentUser(user) {
        localStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(user));
    },

    logout() {
        localStorage.removeItem(this.KEYS.CURRENT_USER);
    },

    // Работа с мероприятиями
    getEvents() {
        const data = localStorage.getItem(this.KEYS.EVENTS);
        return data ? JSON.parse(data) : [];
    },

    saveEvents(events) {
        localStorage.setItem(this.KEYS.EVENTS, JSON.stringify(events));
    },

    getUserEvents() {
        const user = this.getCurrentUser();
        if (!user) return [];
        const events = this.getEvents();
        return events.filter(e => e.userId === user.id);
    },

    getEventById(id) {
        const events = this.getEvents();
        return events.find(e => e.id === Number(id));
    },

    createEvent(eventData) {
        const user = this.getCurrentUser();
        if (!user) return { success: false, error: 'Не авторизован' };
        const events = this.getEvents();
        const newEvent = {
            id: Date.now(),
            userId: user.id,
            ...eventData,
            createdAt: new Date().toISOString()
        };
        events.push(newEvent);
        this.saveEvents(events);
        return { success: true, event: newEvent };
    },

    updateEvent(id, eventData) {
        const events = this.getEvents();
        const index = events.findIndex(e => e.id === Number(id));
        if (index === -1) return { success: false, error: 'Мероприятие не найдено' };
        events[index] = { ...events[index], ...eventData };
        this.saveEvents(events);
        return { success: true, event: events[index] };
    },

    deleteEvent(id) {
        let events = this.getEvents();
        events = events.filter(e => e.id !== Number(id));
        this.saveEvents(events);
        return { success: true };
    },

    // Инициализация демо-данных при первом запуске
    initDemoData() {
        const users = this.getUsers();
        if (users.length === 0) {
            // демо-юзер
            const demoUser = {
                id: 1,
                name: 'Демо Юзер',
                email: 'demo@eventdesign.ru',
                password: 'demo1234',
                createdAt: new Date().toISOString()
            };
            this.saveUsers([demoUser]);

            const demoEvents = [
                {
                    id: 101,
                    userId: 1,
                    title: 'Конференция IT-Weekend 2026',
                    description: 'Крупнейшая ежегодная конференция по современным технологиям разработки. Доклады от ведущих экспертов индустрии.',
                    category: 'Конференция',
                    date: '2026-05-15',
                    time: '10:00',
                    location: 'Москва, Технопарк Сколково',
                    capacity: 500,
                    status: 'upcoming',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 102,
                    userId: 1,
                    title: 'Весенний тимбилдинг',
                    description: 'Корпоративное мероприятие на природе с активными играми и мастер-классами по приготовлению еды на костре.',
                    category: 'Корпоратив',
                    date: '2026-04-28',
                    time: '12:00',
                    location: 'Подмосковье, База отдыха «Сосны»',
                    capacity: 80,
                    status: 'upcoming',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 103,
                    userId: 1,
                    title: 'Мастер-класс по каллиграфии',
                    description: 'Погружение в искусство рукописного письма. Для начинающих и продолжающих. Все материалы включены.',
                    category: 'Мастер-класс',
                    date: '2026-04-20',
                    time: '15:00',
                    location: 'СПб, Арт-пространство Севкабель',
                    capacity: 25,
                    status: 'active',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 104,
                    userId: 1,
                    title: 'Свадьба Анны и Михаила',
                    description: 'Торжественная церемония и банкет. Классический стиль с живой музыкой и фотосессией.',
                    category: 'Свадьба',
                    date: '2026-06-12',
                    time: '16:00',
                    location: 'Усадьба «Архангельское»',
                    capacity: 120,
                    status: 'upcoming',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 105,
                    userId: 1,
                    title: 'День рождения компании',
                    description: 'Празднуем 10-летие нашей команды. Фуршет, награждение сотрудников, выступление приглашённых артистов.',
                    category: 'Корпоратив',
                    date: '2026-03-10',
                    time: '19:00',
                    location: 'Москва, Ресторан «Белый журавль»',
                    capacity: 200,
                    status: 'completed',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 106,
                    userId: 1,
                    title: 'Презентация нового продукта',
                    description: 'Публичный анонс флагманского продукта с демонстрацией возможностей и интерактивными зонами.',
                    category: 'Презентация',
                    date: '2026-05-02',
                    time: '14:00',
                    location: 'Москва, Центр Digital October',
                    capacity: 150,
                    status: 'upcoming',
                    createdAt: new Date().toISOString()
                }
            ];
            this.saveEvents(demoEvents);
        }
    },

    getTheme() {
        return localStorage.getItem(this.KEYS.THEME) || 'dark';
    },

    setTheme(theme) {
        localStorage.setItem(this.KEYS.THEME, theme);
        document.documentElement.setAttribute('data-theme', theme);
    }
};

document.documentElement.setAttribute('data-theme', Storage.getTheme());

Storage.initDemoData();
