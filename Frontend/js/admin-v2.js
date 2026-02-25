const API_BASE = '/api';
let liveSyncInterval = null;
let changeLogPollInterval = null;
let latestServerLogs = [];
let selectedContentItem = null;

function inferEntityByPath(path) {
    if (!path) return 'Контент';
    if (path.includes('/api/articles')) return 'Статьи';
    if (path.includes('/api/courses')) return 'Курсы';
    if (path.includes('/api/consultations')) return 'Консультации';
    if (path.includes('/api/tours')) return 'Туры';
    if (path.includes('/api/orders')) return 'Заявки';
    if (path.includes('/api/users')) return 'Пользователи';
    if (path.includes('/api/upload')) return 'Медиа';
    return 'Контент';
}

function inferActionByMethod(method) {
    const m = (method || '').toUpperCase();
    if (m === 'POST') return 'Создано';
    if (m === 'PUT') return 'Обновлено';
    if (m === 'DELETE') return 'Удалено';
    return 'Изменено';
}

async function loadChangeLog() {
    try {
        const res = await fetch(`${API_BASE}/admin-changes?take=100`);
        if (!res.ok) {
            return;
        }

        const logs = await res.json();
        latestServerLogs = Array.isArray(logs) ? logs : [];
        renderChangeLog();
    } catch (error) {
        console.error('Failed to load admin changes:', error);
    }
}

function addChangeLogEntry() {
    loadChangeLog();
}

function renderChangeLog() {
    const logs = latestServerLogs;
    const targets = [
        document.getElementById('actionLogList'),
        document.getElementById('contentChangeLogList')
    ].filter(Boolean);

    targets.forEach(target => {
        target.innerHTML = '';

        if (logs.length === 0) {
            target.innerHTML = '<li class="list-group-item px-0 text-muted">Изменения пока не зафиксированы</li>';
            return;
        }

        logs.slice(0, 12).forEach(entry => {
            const timestamp = entry.timestampUtc || entry.timestamp || new Date().toISOString();
            const time = new Date(timestamp).toLocaleString('ru-RU');
            const action = inferActionByMethod(entry.method);
            const entity = inferEntityByPath(entry.path || '');
            const username = entry.username || 'admin';
            const pathLabel = entry.path || '/api';
            const line = `
                <li class="list-group-item px-0">
                    <div><strong>${action}</strong> · ${entity}</div>
                    <div class="small">${pathLabel}</div>
                    <div class="text-muted small">${username} · ${time}</div>
                </li>
            `;
            target.insertAdjacentHTML('beforeend', line);
        });
    });
}

function startChangeLogPolling() {
    if (changeLogPollInterval) {
        clearInterval(changeLogPollInterval);
    }

    changeLogPollInterval = setInterval(() => {
        loadChangeLog();
    }, 5000);
}

function getLivePreviewPathForTab(tabName) {
    const map = {
        dashboard: '/',
        articles: '/blog-articles.html',
        videos: '/blog-videos.html',
        courses: '/courses-beginners.html',
        consultations: '/consultations-private.html',
        tours: '/tours.html',
        applications: '/profile.html',
        users: '/profile.html',
        media: '/blog-articles.html'
    };

    return map[tabName] || '/';
}

window.refreshLivePreview = function() {
    const frame = document.getElementById('livePreviewFrame');
    if (!frame) return;

    const basePath = getLivePreviewPathForTab(currentTab);
    frame.src = `${basePath}${basePath.includes('?') ? '&' : '?'}ts=${Date.now()}`;
}

function startLiveSync() {
    if (liveSyncInterval) {
        clearInterval(liveSyncInterval);
    }

    liveSyncInterval = setInterval(() => {
        if (currentTab === 'dashboard') {
            loadDashboard();
            return;
        }

        const isModalOpen = document.getElementById('editorModal')?.classList.contains('show');
        if (isModalOpen) return;

        loadContentForTab(currentTab);
    }, 8000);
}

function getAuthState() {
    const raw = localStorage.getItem('yoga_user');
    if (!raw) return { token: '', user: null };

    try {
        const parsed = JSON.parse(raw);
        return {
            token: parsed.token || '',
            user: parsed.user || parsed
        };
    } catch {
        return { token: '', user: null };
    }
}

const nativeFetch = window.fetch.bind(window);
window.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input?.url || '';
    const isApiCall = url.startsWith('/api/');

    if (!isApiCall) {
        return nativeFetch(input, init);
    }

    const { token } = getAuthState();
    const headers = new Headers(init.headers || {});
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await nativeFetch(input, { ...init, headers });

    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('yoga_user');
        window.location.href = 'login.html';
    }

    return response;
};

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    const { token } = getAuthState();
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // 1. Показать дашборд по умолчанию
    showTab('dashboard');
    
    // 2. Инициализировать график
    initChart();

    // 2.1 Показать историю изменений
    loadChangeLog();
    refreshLivePreview();
    startLiveSync();
    startChangeLogPolling();

    // 3. Обработчик загрузки файла
    document.getElementById('imageInput').addEventListener('change', uploadFile);
});

// --- NAVIGATION ---
let currentTab = 'dashboard';

function showTab(tabName) {
    currentTab = tabName;
    selectedContentItem = null;
    
    // Скрыть все табы
    document.querySelectorAll('.content-tab').forEach(el => el.classList.add('d-none'));
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    
    // Активировать нужный
    if (tabName === 'dashboard') {
        document.getElementById('tab-dashboard').classList.remove('d-none');
        loadDashboard();
    } else {
        // Для контентных табов используем общий шаблон
        document.getElementById('tab-content-manager').classList.remove('d-none');
        const createBtn = document.getElementById('createContentBtn');
        const editBtn = document.getElementById('editSelectedBtn');
        const deleteBtn = document.getElementById('deleteSelectedBtn');
        const bulkDeleteBtn = document.getElementById('deleteSelectedUsersBtn');
        const isEditableContentTab = ['articles', 'videos', 'courses', 'consultations', 'tours', 'media'].includes(tabName);
        const isUsersTab = tabName === 'users';

        if (createBtn) {
            createBtn.style.display = isEditableContentTab ? 'none' : 'none';
        }
        if (editBtn) {
            editBtn.style.display = isEditableContentTab ? 'none' : 'none';
            editBtn.disabled = true;
        }
        if (deleteBtn) {
            deleteBtn.style.display = isEditableContentTab ? 'none' : 'none';
            deleteBtn.disabled = true;
        }
        if (bulkDeleteBtn) {
            bulkDeleteBtn.classList.toggle('d-none', !isUsersTab);
        }
        loadContentForTab(tabName);
    }
    
    // Подсветка меню
    const activeLink = document.querySelector(`.nav-link[onclick="showTab('${tabName}')"]`);
    if(activeLink) activeLink.classList.add('active');
    refreshLivePreview();
}

function setTableHeaders(col1, col2, col3, col4) {
    const c1 = document.getElementById('col-1');
    const c2 = document.getElementById('col-2');
    const c3 = document.getElementById('col-3');
    const c4 = document.getElementById('col-4');

    if (c1) c1.innerText = col1;
    if (c2) c2.innerText = col2;
    if (c3) c3.innerText = col3;
    if (c4) c4.innerText = col4;
}

// --- DATA LOADING ---
async function loadContentForTab(tab) {
    const tbody = document.getElementById('contentTableBody');
    const title = document.getElementById('pageTitle');
    
    tbody.innerHTML = '<tr><td colspan="4" class="text-center">Загрузка...</td></tr>';

    try {
        let data = [];
        if (tab === 'articles' || tab === 'videos' || tab === 'media') {
             title.innerText = tab === 'videos' ? 'Видео-библиотека' : 'Статьи и Блог';
               setTableHeaders('Превью', 'Название', 'Категория/Инфо', 'Действия');
             const res = await fetch(`${API_BASE}/articles`);
             const allArticles = await res.json();
             
             // Фильтрация
             if (tab === 'videos') {
                 data = allArticles.filter(a => a.category === 'Video');
             } else {
                 data = allArticles.filter(a => a.category !== 'Video'); 
             }
             
             renderArticlesTable(data);
             
           } else if (tab === 'courses') {
             title.innerText = 'Курсы и Продукты';
                         setTableHeaders('Превью', 'Название', 'Категория/Инфо', 'Действия');
             const res = await fetch(`${API_BASE}/courses`);
             data = await res.json();
             renderCoursesTable(data);
           } else if (tab === 'consultations') {
               title.innerText = 'Консультации';
                             setTableHeaders('Превью', 'Название', 'Категория/Инфо', 'Действия');
               const res = await fetch(`${API_BASE}/consultations`);
               data = await res.json();
               renderConsultationsTable(data);
           } else if (tab === 'tours') {
               title.innerText = 'Йога-туры';
                             setTableHeaders('Превью', 'Название', 'Категория/Инфо', 'Действия');
               const res = await fetch(`${API_BASE}/tours`);
               data = await res.json();
               renderToursTable(data);
           } else if (tab === 'applications') {
               title.innerText = 'Заявки клиентов';
               setTableHeaders('Дата', 'Продукт', 'Контакты', 'Статус / Действия');
               const res = await fetch(`${API_BASE}/orders/applications`);
               data = await res.json();
               renderApplicationsTable(data);
           } else if (tab === 'users') {
               title.innerText = 'Пользователи и бронирования';
               setTableHeaders('Выбор', 'Пользователь', 'Роль / Брони', 'Действия');
               const res = await fetch(`${API_BASE}/users`);
               data = await res.json();
               renderUsersTable(data);
        }
    } catch (e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Ошибка сети</td></tr>';
    }
}

window.selectContentItem = function(id, type) {
    selectedContentItem = { id, type };
}

window.editSelectedItem = function() {
    if (!selectedContentItem) {
        alert('Сначала выберите запись для редактирования');
        return;
    }

    editItem(selectedContentItem.id, selectedContentItem.type);
}

window.deleteSelectedItem = async function() {
    if (!selectedContentItem) {
        alert('Сначала выберите запись для удаления');
        return;
    }

    await deleteItem(selectedContentItem.id, selectedContentItem.type);
}

// --- RENDERING ---
function renderArticlesTable(items) {
    const tbody = document.getElementById('contentTableBody');
    tbody.innerHTML = '';

    tbody.insertAdjacentHTML('beforeend', `
        <tr>
            <td colspan="3" class="text-muted">Добавить новую запись в раздел статей</td>
            <td><button class="btn btn-sm btn-primary" onclick="openCreateModal()">Добавить</button></td>
        </tr>
    `);
    
    items.forEach(item => {
        const shortText = (item.content || '').substring(0, 50);
        const row = `
            <tr>
                <td>
                    <img src="${item.imageUrl}" alt="" style="width:40px;height:40px;object-fit:cover;border-radius:6px;">
                </td>
                <td>
                    <strong>${item.title}</strong><br>
                    <small class="text-muted">${shortText}...</small>
                </td>
                <td>
                    <span class="badge bg-secondary">${item.category}</span>
                    <div class="small text-muted mt-1">Автор: ${item.author}</div>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="editItem(${item.id}, 'article')">Изм.</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteItem(${item.id}, 'article')">Удал.</button>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

function renderCoursesTable(items) {
    const tbody = document.getElementById('contentTableBody');
    tbody.innerHTML = '';

    tbody.insertAdjacentHTML('beforeend', `
        <tr>
            <td colspan="3" class="text-muted">Добавить новый курс</td>
            <td><button class="btn btn-sm btn-primary" onclick="openCreateModal()">Добавить</button></td>
        </tr>
    `);
    
    items.forEach(item => {
        const shortText = (item.description || '').substring(0, 50);
        const row = `
            <tr>
                <td>
                    <img src="${item.imageUrl || 'https://via.placeholder.com/150'}" alt="" style="width:40px;height:40px;object-fit:cover;border-radius:6px;">
                </td>
                <td>
                    <strong>${item.title}</strong><br>
                    <small class="text-muted">${shortText}...</small>
                </td>
                <td>
                    <span class="badge bg-success">$${item.price}</span>
                    <div class="small text-muted mt-1">${item.level}</div>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="editItem(${item.id}, 'course')">Изм.</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteItem(${item.id}, 'course')">Удал.</button>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

function renderConsultationsTable(items) {
    const tbody = document.getElementById('contentTableBody');
    tbody.innerHTML = '';

    tbody.insertAdjacentHTML('beforeend', `
        <tr>
            <td colspan="3" class="text-muted">Добавить новую консультацию</td>
            <td><button class="btn btn-sm btn-primary" onclick="openCreateModal()">Добавить</button></td>
        </tr>
    `);

    items.forEach(item => {
        const shortText = (item.description || '').substring(0, 50);
        const row = `
            <tr>
                <td>
                    <img src="${item.imageUrl || 'https://via.placeholder.com/150'}" alt="" style="width:40px;height:40px;object-fit:cover;border-radius:6px;">
                </td>
                <td>
                    <strong>${item.title}</strong><br>
                    <small class="text-muted">${shortText}...</small>
                </td>
                <td>
                    <span class="badge bg-success">$${item.price}</span>
                    <div class="small text-muted mt-1">${item.durationMinutes || 60} мин / ${item.expertName || 'Эксперт'}</div>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="editItem(${item.id}, 'consultation')">Изм.</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteItem(${item.id}, 'consultation')">Удал.</button>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

function renderToursTable(items) {
    const tbody = document.getElementById('contentTableBody');
    tbody.innerHTML = '';

    tbody.insertAdjacentHTML('beforeend', `
        <tr>
            <td colspan="3" class="text-muted">Добавить новый тур</td>
            <td><button class="btn btn-sm btn-primary" onclick="openCreateModal()">Добавить</button></td>
        </tr>
    `);

    items.forEach(item => {
        const shortText = (item.description || '').substring(0, 50);
        const row = `
            <tr>
                <td>
                    <img src="${item.imageUrl || 'https://via.placeholder.com/150'}" alt="" style="width:40px;height:40px;object-fit:cover;border-radius:6px;">
                </td>
                <td>
                    <strong>${item.title}</strong><br>
                    <small class="text-muted">${shortText}...</small>
                </td>
                <td>
                    <span class="badge bg-success">$${item.price}</span>
                    <div class="small text-muted mt-1">${item.location || 'Location'} / мест: ${item.spotsAvailable ?? 0}</div>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="editItem(${item.id}, 'tour')">Изм.</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteItem(${item.id}, 'tour')">Удал.</button>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

function renderApplicationsTable(items) {
    const tbody = document.getElementById('contentTableBody');
    tbody.innerHTML = '';

    items.forEach(item => {
        const status = item.status || 'Pending';
        const statusClass = status === 'Approved' ? 'bg-success' : status === 'Cancelled' ? 'bg-danger' : 'bg-warning text-dark';

        const row = `
            <tr>
                <td class="small text-muted">${new Date(item.date).toLocaleString()}</td>
                <td>
                    <strong>${item.productTitle}</strong><br>
                    <small class="text-muted">${item.productType || 'General'} / ${item.price || 0} ₽</small>
                </td>
                <td>
                    <div>${item.customerName || '-'}</div>
                    <div class="small text-muted">${item.customerPhone || '-'}</div>
                    <div class="small text-muted">${item.customerEmail || '-'}</div>
                </td>
                <td>
                    <span class="badge ${statusClass} me-2">${status}</span>
                    <button class="btn btn-sm btn-outline-success me-1" onclick="updateApplicationStatus(${item.id}, 'Approved')">Approve (+)</button>
                    <button class="btn btn-sm btn-outline-danger me-1" onclick="updateApplicationStatus(${item.id}, 'Cancelled')">Cancel (-)</button>
                    <button class="btn btn-sm btn-outline-secondary me-1" onclick="updateApplicationStatus(${item.id}, 'Pending')">↺ Pending</button>
                    <button class="btn btn-sm btn-outline-dark" onclick="deleteApplication(${item.id})">Удалить</button>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

function renderUsersTable(items) {
    const tbody = document.getElementById('contentTableBody');
    tbody.innerHTML = '';

    if (!items || items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Пользователи не найдены</td></tr>';
        return;
    }

    items.forEach(user => {
        const role = user.role || user.Role || 'User';
        const roleClass = role === 'Admin' ? 'bg-dark' : 'bg-secondary';
        const bookingsCount = user.bookingsCount ?? user.BookingsCount ?? 0;
        const lastDateRaw = user.lastBookingDate || user.LastBookingDate;
        const lastDate = lastDateRaw ? new Date(lastDateRaw).toLocaleDateString() : '—';
        const username = user.username || user.Username;
        const fullName = user.fullName || user.FullName || username;
        const email = user.email || user.Email || '—';
        const id = user.id || user.Id;

        const row = `
            <tr>
                <td>
                    ${role === 'Admin' ? '<span class="text-muted">—</span>' : `<input class="form-check-input user-check" type="checkbox" value="${id}">`}
                </td>
                <td>
                    <strong>${fullName}</strong><br>
                    <small class="text-muted">@${username}</small><br>
                    <small class="text-muted">${email}</small>
                </td>
                <td>
                    <span class="badge ${roleClass}">${role}</span>
                    <div class="small text-muted mt-1">Броней: ${bookingsCount}</div>
                    <div class="small text-muted">Последняя: ${lastDate}</div>
                </td>
                <td>
                    ${role === 'Admin'
                        ? '<span class="text-muted small">Защищенный аккаунт</span>'
                        : `<button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${id})"><i class="bi bi-trash"></i> Удалить</button>`}
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

// --- UPLOAD LOGIC ---
async function uploadFile() {
    const fileInput = document.getElementById('imageInput');
    const file = fileInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
        // Показываем прелоадер или меняем курсор
        document.body.style.cursor = 'wait';
        
        const res = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            body: formData
        });
        
        if (!res.ok) throw new Error('Upload failed');
        
        const data = await res.json();
        
        // Обновляем UI
        document.getElementById('imagePreview').src = data.url;
        document.getElementById('imageUrlHidden').value = data.url;
        
    } catch (e) {
        alert('Ошибка загрузки файла');
        console.error(e);
    } finally {
        document.body.style.cursor = 'default';
    }
}

// --- ACTIONS (Create/Edit/Delete) ---

// Открыть окно создания
window.openCreateModal = function() {
    // Очистить форму
    document.getElementById('editorForm').reset();
    document.getElementById('editId').value = '';
    document.getElementById('imagePreview').src = 'https://via.placeholder.com/150';
    document.getElementById('imageUrlHidden').value = '';
    
    // Определить тип (Article или Course) исходя из вкладки
    let type = 'article';
    if (currentTab === 'courses') type = 'course';
    if (currentTab === 'consultations') type = 'consultation';
    if (currentTab === 'tours') type = 'tour';
    document.getElementById('editType').value = type;
    
    // Показать модалку
    new bootstrap.Modal(document.getElementById('editorModal')).show();
}

// Открыть окно редактирования
window.editItem = async function(id, type) {
    try {
        const endpointMap = {
            article: 'articles',
            course: 'courses',
            consultation: 'consultations',
            tour: 'tours'
        };
        const endpoint = endpointMap[type] || 'articles';
        const res = await fetch(`${API_BASE}/${endpoint}/${id}`);
        const item = await res.json();
        
        // Заполнить форму
        const form = document.getElementById('editorForm');
        document.getElementById('editId').value = item.id;
        document.getElementById('editType').value = type;
        
        form.title.value = item.title;
        // Поля отличаются
        if (type === 'article') {
            form.content.textContent = item.content; // textarea
            form.content.value = item.content; 
            form.category.value = item.category;
            form.extraInfo.value = item.author;
        } else if (type === 'course') {
            form.content.value = item.description; // используем поле content как description
            form.extraInfo.value = item.price; // используем поле extraInfo как price
            form.category.value = 'Course'; // не используется
        } else if (type === 'consultation') {
            form.content.value = item.description || '';
            form.extraInfo.value = item.price || 0;
            form.category.value = 'Consultation';
        } else if (type === 'tour') {
            form.content.value = item.description || '';
            form.extraInfo.value = item.price || 0;
            form.category.value = 'Tour';
        }
        
        document.getElementById('imagePreview').src = item.imageUrl;
        document.getElementById('imageUrlHidden').value = item.imageUrl;
        
        new bootstrap.Modal(document.getElementById('editorModal')).show();
        
    } catch(e) { console.error(e); }
}

// Сохранить (Create/Update)
window.saveContent = async function() {
    const form = document.getElementById('editorForm');
    const id = document.getElementById('editId').value;
    const type = document.getElementById('editType').value;
    const isEdit = !!id;
    
    // Собираем объект
    const data = {};
    data.title = form.title.value;
    data.imageUrl = document.getElementById('imageUrlHidden').value || 'https://via.placeholder.com/300';
    
    if (type === 'article') {
        const articleData = {
            id: isEdit ? Number(id) : 0,
            title: form.title.value,
            content: form.content.value,
            category: form.category.value,
            author: form.extraInfo.value || 'Admin',
            imageUrl: document.getElementById('imageUrlHidden').value,
            publishedDate: new Date().toISOString()
        };
        
        await sendRequest(`${API_BASE}/articles`, isEdit ? 'PUT' : 'POST', articleData, id);

    } else if (type === 'course') {
        const courseData = {
            id: isEdit ? Number(id) : 0,
            title: form.title.value,
            subtitle: '', // Можно добавить поле в форму
            description: form.content.value.substring(0, 100), // Короткое описание
            content: form.content.value, // Полное описание
            price: Number(form.extraInfo.value) || 0,
            imageUrl: document.getElementById('imageUrlHidden').value,
            level: 'All Levels',
            durationWeeks: 4
        };
       
        await sendRequest(`${API_BASE}/courses`, isEdit ? 'PUT' : 'POST', courseData, id);
    } else if (type === 'consultation') {
        const consultationData = {
            id: isEdit ? Number(id) : 0,
            title: form.title.value,
            description: form.content.value,
            price: Number(form.extraInfo.value) || 0,
            imageUrl: document.getElementById('imageUrlHidden').value,
            durationMinutes: 60,
            expertName: 'Yoga Expert'
        };

        await sendRequest(`${API_BASE}/consultations`, isEdit ? 'PUT' : 'POST', consultationData, id);
    } else if (type === 'tour') {
        const tourData = {
            id: isEdit ? Number(id) : 0,
            title: form.title.value,
            description: form.content.value,
            price: Number(form.extraInfo.value) || 0,
            imageUrl: document.getElementById('imageUrlHidden').value,
            location: 'TBD',
            startDate: new Date().toISOString(),
            difficulty: 2,
            isHit: false,
            spotsAvailable: 10
        };

        await sendRequest(`${API_BASE}/tours`, isEdit ? 'PUT' : 'POST', tourData, id);
    }
}

async function sendRequest(url, method, data, id) {
    if (method === 'PUT') {
        // У .NET Core API PUT на {id} требует, чтобы Id был в теле
        data.id = Number(id);
    }

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (res.ok) {
            const actionLabel = method === 'POST' ? 'Создано' : 'Обновлено';
            const entityLabel = currentTab;
            addChangeLogEntry(actionLabel, entityLabel, data.title || `ID ${id || 'new'}`);

            bootstrap.Modal.getInstance(document.getElementById('editorModal')).hide();
            loadContentForTab(currentTab);
            refreshLivePreview();
            alert('Действие выполнено!');
        } else {
            console.error(await res.text());
            alert('Ошибка при сохранении');
        }
    } catch (e) { console.error(e); }
}

// Удалить
window.deleteItem = async function(id, type) {
    if (!confirm('Удалить этот элемент?')) return;
    const endpointMap = {
        article: 'articles',
        course: 'courses',
        consultation: 'consultations',
        tour: 'tours'
    };
    const endpoint = endpointMap[type] || 'articles';
    const res = await fetch(`${API_BASE}/${endpoint}/${id}`, { method: 'DELETE' });
    if (res.ok) {
        if (selectedContentItem && selectedContentItem.id === id) {
            selectedContentItem = null;
            const editBtn = document.getElementById('editSelectedBtn');
            const deleteBtn = document.getElementById('deleteSelectedBtn');
            if (editBtn) editBtn.disabled = true;
            if (deleteBtn) deleteBtn.disabled = true;
        }
        addChangeLogEntry('Удалено', type, `ID ${id}`);
        loadContentForTab(currentTab);
        refreshLivePreview();
    }
}

window.updateApplicationStatus = async function(id, status) {
    if (!confirm(`Изменить статус заявки #${id} на ${status}?`)) return;

    try {
        const res = await fetch(`${API_BASE}/orders/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });

        if (!res.ok) {
            const text = await res.text();
            alert('Ошибка обновления статуса: ' + text);
            return;
        }

        addChangeLogEntry('Статус заявки', 'applications', `ID ${id}`, status);
        loadContentForTab('applications');
        refreshLivePreview();
    } catch (e) {
        console.error(e);
        alert('Ошибка сети');
    }
}

window.deleteApplication = async function(id) {
    if (!confirm(`Удалить заявку #${id} из базы данных?`)) return;

    try {
        const res = await fetch(`${API_BASE}/orders/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            alert(await res.text());
            return;
        }

        addChangeLogEntry('Удалено', 'applications', `ID ${id}`);
        loadContentForTab('applications');
        loadDashboard();
        refreshLivePreview();
    } catch (e) {
        console.error(e);
        alert('Ошибка сети');
    }
}

window.deleteUser = async function(id) {
    if (!confirm('Удалить пользователя и его бронирования?')) return;

    try {
        const res = await fetch(`${API_BASE}/users/${id}`, {
            method: 'DELETE'
        });

        if (!res.ok) {
            alert(await res.text());
            return;
        }

        addChangeLogEntry('Удалено', 'users', `Пользователь ID ${id}`);
        loadContentForTab('users');
    } catch (e) {
        console.error(e);
        alert('Ошибка сети');
    }
}

window.deleteSelectedUsers = async function() {
    const selected = Array.from(document.querySelectorAll('.user-check:checked'))
        .map(el => Number(el.value));

    if (selected.length === 0) {
        alert('Выберите пользователей для удаления');
        return;
    }

    if (!confirm(`Удалить выбранных пользователей (${selected.length}) и их бронирования?`)) return;

    try {
        const res = await fetch(`${API_BASE}/users/bulk`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userIds: selected })
        });

        if (!res.ok) {
            alert(await res.text());
            return;
        }

        const result = await res.json();
        addChangeLogEntry('Массовое удаление', 'users', 'Пользователи', `Количество: ${result.deletedUsers || result.DeletedUsers || 0}`);
        alert(`Удалено пользователей: ${result.deletedUsers || result.DeletedUsers || 0}`);
        loadContentForTab('users');
    } catch (e) {
        console.error(e);
        alert('Ошибка сети');
    }
}


// --- DASHBOARD ---
async function loadDashboard() {
    console.log('Loading Dashboard Data...');
    const totalEl = document.getElementById('totalIncomeDisplay');
    const totalOrdersEl = document.getElementById('totalOrdersDisplay');
    const pendingOrdersEl = document.getElementById('pendingOrdersDisplay');
    const tableBody = document.getElementById('ordersTableBody');
    
    if (!totalEl || !tableBody) return;

    try {
        const res = await fetch(`${API_BASE}/orders`);
        if (!res.ok) throw new Error('Failed to fetch orders');
        
        const data = await res.json();
        // Handle both PascalCase (C# default) and camelCase
        const orders = data.Orders || data.orders || [];
        const income = data.TotalIncome || data.totalIncome || 0;
        const pendingCount = orders.filter(o => (o.status || o.Status || '').toLowerCase() === 'pending').length;

        // Update Total Income
        totalEl.innerText = `${income} ₽`;
        if (totalOrdersEl) totalOrdersEl.innerText = String(orders.length);
        if (pendingOrdersEl) pendingOrdersEl.innerText = String(pendingCount);

        // Update Table
        tableBody.innerHTML = '';
        if (orders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Нет покупок</td></tr>';
        } else {
            orders.slice(0, 10).forEach(order => {
                const date = new Date(order.date || order.Date).toLocaleDateString();
                const user = order.userName || order.UserName;
                const product = order.productTitle || order.ProductTitle;
                const price = order.price || order.Price;
                const status = order.status || order.Status || 'Completed';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${date}</td>
                    <td>${user}</td>
                    <td>${product}</td>
                    <td>${price} ₽</td>
                    <td><span class="badge bg-success">${status}</span></td>
                `;
                tableBody.appendChild(tr);
            });
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        tableBody.innerHTML = `<tr><td colspan="5" class="text-danger text-center">Ошибка: ${error.message}</td></tr>`;
    }
}


// --- DASHBOARD CHART ---
function initChart() {
    const ctx = document.getElementById('trafficChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
            datasets: [{
                label: 'Посетители',
                data: [120, 190, 300, 250, 200, 350, 600],
                borderColor: '#d4a373',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(212, 163, 115, 0.1)'
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });
}
