// Use relative path for production flexibility, or a configurable base
// const API_URL = 'http://localhost:5253/api';
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5253/api' 
    : '/api'; // fallback for production

let coursesCache = [];
let consultationsCache = [];
let articlesCache = [];
let toursCache = [];

// Helper to prevent XSS
function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function showAlert(message, type = 'success') {
    const alertNode = document.getElementById('adminAlert');
    if (!alertNode) return;

    // Use Bootstrap classes for styling
    alertNode.className = `alert alert-${type}`;
    // Ensure visibility
    alertNode.textContent = message;
    alertNode.classList.remove('d-none');

    // Clear previous timeout to prevent premature hiding
    clearTimeout(showAlert.timeoutId);
    showAlert.timeoutId = setTimeout(() => {
        alertNode.classList.add('d-none');
    }, 3000);
}

document.addEventListener('DOMContentLoaded', async () => {
    // Bind all UI event handlers
    bindLogout();
    bindTabs();
    bindUploadButtons();
    bindForms();
    bindRefreshButtons();
    initializeAutoHideNavbar();

    // Check auth
    const me = await ensureAdminAccess();
    if (!me) return;

    // Update UI with user info
    const badge = document.getElementById('adminUserBadge');
    if (badge) {
        badge.textContent = `${me.fullName || me.username || 'Admin'} · Admin`;
    }

    // Load initial data for all sections
    await Promise.all([
        loadOrders().catch(e => console.error('Orders failed:', e)),
        loadCourses().catch(e => console.error('Courses failed:', e)),
        loadConsultations().catch(e => console.error('Consultations failed:', e)),
        loadArticles().catch(e => console.error('Articles failed:', e)),
        loadTours().catch(e => console.error('Tours failed:', e))
    ]);
});

function initializeAutoHideNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    // Smooth transition style
    navbar.style.cssText += 'transition: transform 0.4s ease-in-out, background-color 0.3s ease !important;';

    let lastScrollY = window.scrollY;
    let isHidden = false;
    let ticking = false;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const delta = currentScrollY - lastScrollY;
                
                // Hide if scrolling DOWN (delta > 0)
                if (currentScrollY > 100 && delta > 0) {
                    if (!isHidden) {
                        navbar.classList.add('nav-hidden');
                        navbar.style.transform = 'translateY(-100%)'; 
                        isHidden = true;
                    }
                } 
                // Show if scrolling UP (delta < 0)
                else if (delta < 0) {
                    if (isHidden) {
                        navbar.classList.remove('nav-hidden');
                        navbar.style.transform = 'translateY(0)';
                        isHidden = false;
                    } 
                }
                
                // Always ensure visibility at top
                if (currentScrollY < 100 && isHidden) {
                    navbar.classList.remove('nav-hidden');
                    navbar.style.transform = 'translateY(0)';
                    isHidden = false;
                }
                
                lastScrollY = currentScrollY;
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

function bindRefreshButtons() {
    const refreshOrdersBtn = document.getElementById('refreshOrdersBtn');
    if (refreshOrdersBtn) {
        refreshOrdersBtn.addEventListener('click', async () => {
            await loadOrders();
            // Visual feedback could be added here
        });
    }
}

function bindTabs() {
    const tabs = document.querySelectorAll('#adminTabs button[data-target]');
    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            if (!targetId) return;

            // Deactivate all
            tabs.forEach(t => {
                t.classList.remove('active', 'btn-dark');
                t.classList.add('btn-outline-dark');
            });

            // Activate clicked
            btn.classList.add('active', 'btn-dark');
            btn.classList.remove('btn-outline-dark');

            // Switch panes
            document.querySelectorAll('.section-pane').forEach(pane => {
                pane.classList.remove('active');
            });

            const targetPane = document.getElementById(targetId);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
}

function bindLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (!logoutBtn) return;
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('yoga_user');
        window.location.href = 'login.html';
    });
}

function readAuthState() {
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

function authHeaders(json = true) {
    const { token } = readAuthState();
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (json) headers['Content-Type'] = 'application/json';
    return headers;
}

async function ensureAdminAccess() {
    const { token } = readAuthState();
    if (!token) {
        window.location.href = 'login.html';
        return null;
    }

    try {
        const response = await fetch(`${API_URL}/users/me`, {
            headers: authHeaders(false)
        });

        if (!response.ok) throw new Error('Unauthorized');

        const me = await response.json();
        const role = me.role || me.Role || 'User';
        if (role !== 'Admin') {
            showAlert('Доступ запрещен. Нужна роль Admin.', 'danger');
            setTimeout(() => {
                localStorage.removeItem('yoga_user');
                window.location.href = 'login.html';
            }, 1200);
            return null;
        }
        return me;
    } catch {
        localStorage.removeItem('yoga_user');
        window.location.href = 'login.html';
        return null;
    }
}

async function loadOrders() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4"><div class="spinner-border text-primary" role="status"></div></td></tr>';

    try {
        const response = await fetch(`${API_URL}/orders`, { headers: authHeaders() });

        if (!response.ok) throw new Error('Ошибка загрузки заявок');

        const data = await response.json();
        const orders = data.Orders || data.orders || (Array.isArray(data) ? data : []); 
        renderOrders(orders);
    } catch (error) {
        console.error(error);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-3">Не удалось загрузить заявки</td></tr>`;
    }
}

function renderOrders(orders) {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!orders || !Array.isArray(orders) || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Нет новых заявок</td></tr>';
        return;
    }

    // Sort by date desc
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));

    orders.forEach(order => {
        const tr = document.createElement('tr');
        const dateStr = new Date(order.date).toLocaleDateString() + ' ' + new Date(order.date).toLocaleTimeString().slice(0,5);
        
        let statusBadge = 'bg-secondary';
        let statusText = order.status;
        if (order.status === 'Pending') { statusBadge = 'bg-warning text-dark'; statusText = 'Новая'; }
        if (order.status === 'Approved') { statusBadge = 'bg-success'; statusText = 'Обработана'; }
        if (order.status === 'Cancelled') { statusBadge = 'bg-danger'; statusText = 'Отменена'; }

        tr.innerHTML = `
            <td><small class="text-muted fw-bold">${dateStr}</small></td>
            <td>
                <div class="fw-bold">${escapeHtml(order.customerName || 'Гость')}</div>
                <div class="small text-muted">${escapeHtml(order.userName || '')}</div>
            </td>
            <td>
                <div><a href="mailto:${order.customerEmail}" class="text-decoration-none">${escapeHtml(order.customerEmail)}</a></div>
                <div><a href="tel:${order.customerPhone}" class="text-decoration-none text-dark">${escapeHtml(order.customerPhone)}</a></div>
            </td>
            <td>
                <span class="badge bg-light text-dark border">${escapeHtml(order.productType)}</span>
                <div class="small mt-1">${escapeHtml(order.productTitle)}</div>
            </td>
            <td><span class="badge ${statusBadge}">${statusText}</span></td>
            <td class="text-end">
                <div class="btn-group btn-group-sm">
                    ${order.status === 'Pending' ? `
                        <button class="btn btn-outline-success" onclick="updateOrderStatus(${order.id}, 'Approved')" title="Подтвердить"><i class="bi bi-check-lg"></i></button>
                        <button class="btn btn-outline-danger" onclick="updateOrderStatus(${order.id}, 'Cancelled')" title="Отменить"><i class="bi bi-x-lg"></i></button>
                    ` : `
                        <button class="btn btn-outline-secondary" onclick="deleteOrder(${order.id})" title="Удалить"><i class="bi bi-trash"></i></button>
                    `}
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.updateOrderStatus = async function(id, status) {
    if (!confirm(`Сменить статус заявки на ${status}?`)) return;
    try {
        const url = status === 'Approved' ? `${API_URL}/orders/${id}/approve` : 
                    status === 'Cancelled' ? `${API_URL}/orders/${id}/cancel` :
                    `${API_URL}/orders/${id}/status`;
        
        const method = 'PUT';
        const body = (status !== 'Approved' && status !== 'Cancelled') ? JSON.stringify({ status }) : null;

        const res = await fetch(url, {
            method,
            headers: authHeaders(),
            body
        });
        
        if (res.ok) {
            loadOrders(); 
        } else {
            showAlert('Ошибка обновления статуса', 'danger');
        }
    } catch (e) {
        console.error(e);
        showAlert('Ошибка сети', 'danger');
    }
};

window.deleteOrder = async function(id) {
    if (!confirm('Удалить эту заявку навсегда?')) return;
    try {
        const res = await fetch(`${API_URL}/orders/${id}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        if (res.ok) loadOrders();
    } catch (e) { console.error(e); }
};

/* --- UPLOAD HELPERS --- */
function bindUploadButtons() {
    const uploadMediaBtn = document.getElementById('uploadMediaBtn');
    if (uploadMediaBtn) {
        uploadMediaBtn.addEventListener('click', async () => {
            await uploadFileToField('mediaFile', 'uploadedUrl');
        });
    }

    const pairs = [
        ['uploadCourseImageBtn', 'courseImageFile', 'courseImageUrl'],
        ['uploadConsultationImageBtn', 'consultationImageFile', 'consultationImageUrl'],
        ['uploadArticleImageBtn', 'articleImageFile', 'articleImageUrl'],
        ['uploadTourImageBtn', 'tourImageFile', 'tourImageUrl']
    ];

    pairs.forEach(([buttonId, fileId, targetId]) => {
        const button = document.getElementById(buttonId);
        if (!button) return;
        button.addEventListener('click', async () => {
            await uploadFileToField(fileId, targetId);
        });
    });
}

async function uploadFileToField(fileInputId, targetInputId) {
    const fileInput = document.getElementById(fileInputId);
    const targetInput = document.getElementById(targetInputId);

    if (!fileInput || !targetInput || !fileInput.files || !fileInput.files.length) {
        showAlert('Выберите файл для загрузки.', 'warning');
        return null;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers: {
                Authorization: authHeaders(false).Authorization || ''
            },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Ошибка загрузки файла');
        }

        const payload = await response.json();
        targetInput.value = payload.url || '';
        showAlert('Файл успешно загружен.', 'success');
        return payload.url;
    } catch (error) {
        showAlert(`Ошибка загрузки файла: ${error.message}`, 'danger');
        return null;
    }
}

/* --- FORMS BINDING --- */
function bindForms() {
    const courseForm = document.getElementById('courseForm');
    if (courseForm) courseForm.addEventListener('submit', handleCourseSubmit);

    const consultationForm = document.getElementById('consultationForm');
    if (consultationForm) consultationForm.addEventListener('submit', handleConsultationSubmit);

    const articleForm = document.getElementById('articleForm');
    if (articleForm) articleForm.addEventListener('submit', handleArticleSubmit);

    const tourForm = document.getElementById('tourForm');
    if (tourForm) tourForm.addEventListener('submit', handleTourSubmit);

    const resetCourseBtn = document.getElementById('resetCourseBtn');
    if (resetCourseBtn) resetCourseBtn.addEventListener('click', resetCourseForm);

    const resetConsultationBtn = document.getElementById('resetConsultationBtn');
    if (resetConsultationBtn) resetConsultationBtn.addEventListener('click', resetConsultationForm);

    const resetArticleBtn = document.getElementById('resetArticleBtn');
    if (resetArticleBtn) resetArticleBtn.addEventListener('click', resetArticleForm);

    const resetTourBtn = document.getElementById('resetTourBtn');
    if (resetTourBtn) resetTourBtn.addEventListener('click', resetTourForm);
}


/* --- COURSES LOGIC --- */
async function loadCourses() {
    const tbody = document.getElementById('coursesTableBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Загрузка...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/courses`);
        if (!response.ok) throw new Error('Не удалось загрузить курсы');

        const items = await response.json();
        coursesCache = Array.isArray(items)
            ? [...items].sort((a, b) => Number(b.id || 0) - Number(a.id || 0))
            : [];

        if (coursesCache.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Курсы не найдены</td></tr>';
            return;
        }

        tbody.innerHTML = coursesCache.map(item => `
            <tr>
                <td><img class="thumb" src="${escapeHtml(item.imageUrl || '')}" alt="${escapeHtml(item.title || '')}"></td>
                <td>
                    <div class="fw-bold">${escapeHtml(item.title || '')}</div>
                    <div class="small text-muted">${escapeHtml((item.subtitle || '').slice(0, 90))}</div>
                </td>
                <td>${Number(item.price || 0).toLocaleString('ru-RU')} ₽</td>
                <td><span class="badge bg-secondary">${escapeHtml(item.category || '-')}</span></td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-dark me-1" type="button" onclick="window.editCourse(${item.id})">Ред.</button>
                    <button class="btn btn-sm btn-outline-danger" type="button" onclick="window.deleteCourse(${item.id})">Удал.</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">${escapeHtml(error.message)}</td></tr>`;
    }
}

async function handleCourseSubmit(event) {
    event.preventDefault();
    const id = Number(document.getElementById('courseId').value || 0);
    const payload = {
        id,
        title: document.getElementById('courseTitle').value.trim(),
        subtitle: document.getElementById('courseSubtitle').value.trim(),
        description: document.getElementById('courseDescription').value.trim(),
        content: document.getElementById('courseContent').value.trim(),
        price: Number(document.getElementById('coursePrice').value || 0),
        imageUrl: document.getElementById('courseImageUrl').value.trim(),
        category: document.getElementById('courseCategory').value,
        level: document.getElementById('courseLevel').value,
        durationWeeks: Number(document.getElementById('courseDuration').value || 1)
    };

    try {
        if (!payload.imageUrl) {
            showAlert('Для курса укажите URL картинки.', 'warning');
            return;
        }
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/courses/${id}` : `${API_URL}/courses`;

        const response = await fetch(url, {
            method,
            headers: authHeaders(true),
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(await response.text());

        showAlert(id ? 'Курс обновлен.' : 'Курс добавлен.', 'success');
        resetCourseForm();
        await loadCourses();
    } catch (error) {
        showAlert(`Ошибка: ${error.message}`, 'danger');
    }
}

function resetCourseForm() {
    document.getElementById('courseForm').reset();
    document.getElementById('courseId').value = '';
    document.getElementById('courseDuration').value = '4';
    document.getElementById('saveCourseBtn').textContent = 'Сохранить курс';
}

window.editCourse = function (id) {
    const item = coursesCache.find(x => Number(x.id) === Number(id));
    if (!item) return;

    document.getElementById('courseId').value = item.id || '';
    document.getElementById('courseTitle').value = item.title || '';
    document.getElementById('courseSubtitle').value = item.subtitle || '';
    document.getElementById('courseDescription').value = item.description || '';
    document.getElementById('courseContent').value = item.content || '';
    document.getElementById('coursePrice').value = item.price || 0;
    document.getElementById('courseImageUrl').value = item.imageUrl || '';
    
    // Set selects
    if(item.level) document.getElementById('courseLevel').value = item.level;
    if(item.category) document.getElementById('courseCategory').value = item.category;

    document.getElementById('courseDuration').value = item.durationWeeks || 4;
    document.getElementById('saveCourseBtn').textContent = 'Обновить курс';
    
    // Switch to tab
    document.querySelector('[data-target="coursesPane"]').click();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteCourse = async function (id) {
    if (!confirm('Удалить курс?')) return;
    try {
        const response = await fetch(`${API_URL}/courses/${id}`, { method: 'DELETE', headers: authHeaders(false) });
        if (response.ok) {
            showAlert('Курс удален');
            loadCourses();
        } else {
            showAlert('Ошибка удаления', 'danger');
        }
    } catch (e) {
        showAlert('Ошибка сети', 'danger');
    }
};

/* --- CONSULTATIONS LOGIC --- */
async function loadConsultations() {
    const tbody = document.getElementById('consultationsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Загрузка...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/consultations`);
        if (!response.ok) throw new Error('Не удалось загрузить консультации');

        const items = await response.json();
        consultationsCache = Array.isArray(items) ? [...items].sort((a,b)=>b.id-a.id) : [];

        if (consultationsCache.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Нет данных</td></tr>';
            return;
        }

        tbody.innerHTML = consultationsCache.map(item => `
            <tr>
                <td><img class="thumb" src="${escapeHtml(item.imageUrl || '')}" alt="${escapeHtml(item.title || '')}"></td>
                <td>
                    <div class="fw-bold">${escapeHtml(item.title || '')}</div>
                    <div class="small text-muted">${escapeHtml(item.expertName || '')}</div>
                </td>
                <td>${Number(item.price || 0).toLocaleString('ru-RU')} ₽</td>
                <td>${Number(item.durationMinutes || 0)} мин</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-dark me-1" type="button" onclick="window.editConsultation(${item.id})">Ред.</button>
                    <button class="btn btn-sm btn-outline-danger" type="button" onclick="window.deleteConsultation(${item.id})">Удал.</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">${escapeHtml(error.message)}</td></tr>`;
    }
}

async function handleConsultationSubmit(event) {
    event.preventDefault();
    const id = Number(document.getElementById('consultationId').value || 0);
    const payload = {
        id,
        title: document.getElementById('consultationTitle').value.trim(),
        description: document.getElementById('consultationDescription').value.trim(),
        price: Number(document.getElementById('consultationPrice').value || 0),
        category: document.getElementById('consultationCategory').value,
        imageUrl: document.getElementById('consultationImageUrl').value.trim(),
        durationMinutes: Number(document.getElementById('consultationDuration').value || 60),
        expertName: document.getElementById('consultationExpert').value.trim()
    };

    try {
        if (!payload.imageUrl) {
            showAlert('Укажите URL картинки.', 'warning');
            return;
        }
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/consultations/${id}` : `${API_URL}/consultations`;

        const response = await fetch(url, {
            method,
            headers: authHeaders(true),
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(await response.text());
        showAlert(id ? 'Консультация обновлена.' : 'Консультация добавлена.', 'success');
        resetConsultationForm();
        await loadConsultations();
    } catch (error) {
        showAlert(`Ошибка: ${error.message}`, 'danger');
    }
}

function resetConsultationForm() {
    document.getElementById('consultationForm').reset();
    document.getElementById('consultationId').value = '';
    document.getElementById('consultationDuration').value = '60';
    document.getElementById('saveConsultationBtn').textContent = 'Сохранить консультацию';
}

window.editConsultation = function (id) {
    const item = consultationsCache.find(x => Number(x.id) === Number(id));
    if (!item) return;

    document.getElementById('consultationId').value = item.id || '';
    document.getElementById('consultationTitle').value = item.title || '';
    document.getElementById('consultationDescription').value = item.description || '';
    document.getElementById('consultationPrice').value = item.price || 0;
    document.getElementById('consultationImageUrl').value = item.imageUrl || '';
    document.getElementById('consultationDuration').value = item.durationMinutes || 60;
    document.getElementById('consultationExpert').value = item.expertName || '';
    if(item.category) document.getElementById('consultationCategory').value = item.category;
    document.getElementById('saveConsultationBtn').textContent = 'Обновить консультацию';
    
    document.querySelector('[data-target="consultationsPane"]').click();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteConsultation = async function (id) {
    if (!confirm('Удалить консультацию?')) return;
    try {
        const response = await fetch(`${API_URL}/consultations/${id}`, { method: 'DELETE', headers: authHeaders(false) });
        if (!response.ok) throw new Error(await response.text());
        showAlert('Консультация удалена.', 'success');
        await loadConsultations();
    } catch (error) {
        showAlert(`Ошибка: ${error.message}`, 'danger');
    }
};


/* --- ARTICLES LOGIC --- */
async function loadArticles() {
    const tbody = document.getElementById('articlesTableBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Загрузка...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/articles`);
        if (!response.ok) throw new Error('Не удалось загрузить статьи');

        const items = await response.json();
        articlesCache = Array.isArray(items) ? [...items].sort((a,b)=>b.id-a.id) : [];

        if (articlesCache.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Материалы не найдены</td></tr>';
            return;
        }

        tbody.innerHTML = articlesCache.map(item => `
            <tr>
                <td><img class="thumb" src="${escapeHtml(item.imageUrl || '')}" alt="${escapeHtml(item.title || '')}"></td>
                <td>
                    <div class="fw-bold">${escapeHtml(item.title || '')}</div>
                    <div class="small text-muted">${escapeHtml((item.subtitle || '').slice(0, 90))}</div>
                </td>
                <td>${escapeHtml(item.category || '-')}</td>
                <td>${escapeHtml(item.author || '-')}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-dark me-1" type="button" onclick="window.editArticle(${item.id})">Ред.</button>
                    <button class="btn btn-sm btn-outline-danger" type="button" onclick="window.deleteArticle(${item.id})">Удал.</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">${escapeHtml(error.message)}</td></tr>`;
    }
}

async function handleArticleSubmit(event) {
    event.preventDefault();
    const id = Number(document.getElementById('articleId').value || 0);
    const createdAt = document.getElementById('articleCreatedAt').value || new Date().toISOString();

    const payload = {
        id,
        title: document.getElementById('articleTitle').value.trim(),
        subtitle: document.getElementById('articleSubtitle').value.trim(),
        content: document.getElementById('articleContent').value.trim(),
        imageUrl: document.getElementById('articleImageUrl').value.trim(),
        category: document.getElementById('articleCategory').value,
        createdAt,
        author: document.getElementById('articleAuthor').value.trim() || 'Admin'
    };

    try {
        if (!payload.imageUrl) {
            showAlert('Укажите URL картинки.', 'warning');
            return;
        }
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/articles/${id}` : `${API_URL}/articles`;

        const response = await fetch(url, {
            method,
            headers: authHeaders(true),
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(await response.text());
        showAlert(id ? 'Материал обновлен.' : 'Материал добавлен.', 'success');
        resetArticleForm();
        await loadArticles();
    } catch (error) {
        showAlert(`Ошибка: ${error.message}`, 'danger');
    }
}

function resetArticleForm() {
    document.getElementById('articleForm').reset();
    document.getElementById('articleId').value = '';
    document.getElementById('articleCreatedAt').value = '';
    document.getElementById('articleAuthor').value = 'Admin';
    document.getElementById('saveArticleBtn').textContent = 'Сохранить материал';
}

window.editArticle = function (id) {
    const item = articlesCache.find(x => Number(x.id) === Number(id));
    if (!item) return;

    document.getElementById('articleId').value = item.id || '';
    document.getElementById('articleCreatedAt').value = item.createdAt || new Date().toISOString();
    document.getElementById('articleTitle').value = item.title || '';
    document.getElementById('articleSubtitle').value = item.subtitle || '';
    document.getElementById('articleContent').value = item.content || '';
    document.getElementById('articleImageUrl').value = item.imageUrl || '';
    document.getElementById('articleCategory').value = item.category || 'Article';
    document.getElementById('articleAuthor').value = item.author || 'Admin';
    document.getElementById('saveArticleBtn').textContent = 'Обновить материал';
    
    document.querySelector('[data-target="articlesPane"]').click();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteArticle = async function (id) {
    if (!confirm('Удалить материал блога?')) return;
    try {
        const response = await fetch(`${API_URL}/articles/${id}`, { method: 'DELETE', headers: authHeaders(false) });
        if (!response.ok) throw new Error(await response.text());
        showAlert('Материал удален.', 'success');
        await loadArticles();
    } catch (error) {
        showAlert(`Ошибка: ${error.message}`, 'danger');
    }
};

/* --- TOURS LOGIC --- */
async function loadTours() {
    const tbody = document.getElementById('toursTableBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Загрузка...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/tours`);
        if (!response.ok) throw new Error('Не удалось загрузить туры');

        const items = await response.json();
        toursCache = Array.isArray(items) 
            ? [...items].sort((a, b) => new Date(b.startDate || 0) - new Date(a.startDate || 0))
            : [];

        if (toursCache.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Туры не найдены</td></tr>';
            return;
        }

        tbody.innerHTML = toursCache.map(item => `
            <tr>
                <td><img class="thumb" src="${escapeHtml(item.imageUrl || '')}" alt="${escapeHtml(item.title || '')}"></td>
                <td>
                    <div class="fw-bold">${escapeHtml(item.title || '')}</div>
                    <div class="small text-muted">${escapeHtml(item.location || '')}</div>
                </td>
                <td>${item.startDate ? new Date(item.startDate).toLocaleDateString() : '-'}</td>
                <td>${item.spotsAvailable || 0}</td>
                <td>${Number(item.price || 0).toLocaleString('ru-RU')} ₽</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editTour(${item.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteTour(${item.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Tours error:', error);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-4">Ошибка загрузки</td></tr>';
    }
}

async function handleTourSubmit(e) {
    if (e) e.preventDefault();

    const id = document.getElementById('tourId').value;
    const isEdit = !!id;

    const data = {
        title: document.getElementById('tourTitle').value,
        price: Number(document.getElementById('tourPrice').value),
        spotsAvailable: Number(document.getElementById('tourSpots').value),
        location: document.getElementById('tourLocation').value,
        startDate: (document.getElementById('tourStartDate').value ? new Date(document.getElementById('tourStartDate').value).toISOString() : new Date().toISOString()),
        difficulty: Number(document.getElementById('tourDifficulty').value),
        imageUrl: document.getElementById('tourImageUrl').value,
        isHit: document.getElementById('tourIsHit').checked,
        description: document.getElementById('tourDescription').value
    };

    if (isEdit) data.id = Number(id);

    try {
        const url = isEdit ? `${API_URL}/tours/${id}` : `${API_URL}/tours`;
        const method = isEdit ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...authHeaders(false)
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(errText || 'Ошибка сохранения');
        }

        showAlert(isEdit ? 'Тур обновлен!' : 'Тур создан!', 'success');
        resetTourForm();
        await loadTours();
    } catch (error) {
        console.error('Save tour error:', error);
        showAlert(`Ошибка: ${error.message}`, 'danger');
    }
}

function resetTourForm() {
    document.getElementById('tourForm').reset();
    document.getElementById('tourId').value = '';
    document.getElementById('saveTourBtn').textContent = 'Сохранить тур';
    document.getElementById('uploadTourImageBtn').textContent = 'Загрузить';
}

window.editTour = function(id) {
    const item = toursCache.find(x => x.id === id);
    if (!item) return;

    document.getElementById('tourId').value = item.id;
    document.getElementById('tourTitle').value = item.title || '';
    document.getElementById('tourPrice').value = item.price || 0;
    document.getElementById('tourSpots').value = item.spotsAvailable || 0;
    document.getElementById('tourLocation').value = item.location || '';
    
    // Convert date for input type=date
    if (item.startDate) {
        const d = new Date(item.startDate);
        // Format to YYYY-MM-DD
        const iso = d.toISOString().split('T')[0];
        document.getElementById('tourStartDate').value = iso;
    }

    document.getElementById('tourDifficulty').value = item.difficulty || 1;
    document.getElementById('tourImageUrl').value = item.imageUrl || '';
    document.getElementById('tourIsHit').checked = !!item.isHit;
    document.getElementById('tourDescription').value = item.description || '';

    document.getElementById('saveTourBtn').textContent = 'Обновить тур';
    
    // Switch tab
    const tabBtn = document.querySelector('[data-target="toursPane"]');
    if (tabBtn) tabBtn.click();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteTour = async function(id) {
    if (!confirm('Удалить этот тур?')) return;
    try {
        const response = await fetch(`${API_URL}/tours/${id}`, {
            method: 'DELETE',
            headers: authHeaders(false)
        });
        if (!response.ok) throw new Error(await response.text());
        showAlert('Тур удален.', 'success');
        await loadTours();
    } catch (error) {
        showAlert(`Ошибка: ${error.message}`, 'danger');
    }
};
