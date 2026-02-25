document.addEventListener('DOMContentLoaded', () => {
    const currentPath = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    applyMainPageTemplate(currentPath);
    removeSecondaryPageHero(currentPath);
    harmonizePageTypography(currentPath);
    injectPageMaterials(currentPath);
    
    // 1. ПЛАВНЫЙ СКРОЛЛ (Smooth Scroll)
    // Находим все ссылки, которые начинаются с #
    const anchors = document.querySelectorAll('a[href^="#"]');

    for (let anchor of anchors) {
        anchor.addEventListener('click', function (e) {
            e.preventDefault(); // Отменяем стандартный рывок
            
            const blockID = anchor.getAttribute('href').substr(1);
            const targetElement = document.getElementById(blockID);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }

            // Если открыто мобильное меню, то закрываем его
            const navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                if (bsCollapse) bsCollapse.hide();
            }
        });
    }

    // 2. СУПЕР-ПЛАВНЫЙ ГРАДИЕНТ ТЕКСТА
    const navbar = document.querySelector('.navbar');
    // Берем высоту первого экрана (где происходит переход)
    // Try to find .hero-section OR .page-hero
    const heroSection = document.querySelector('.hero-section') || document.querySelector('.page-hero'); 
    const heroHeight = heroSection ? heroSection.offsetHeight : 500; // По умолчанию 500px если героя нет

    function updateNavbarGradient() {
        // Now applies to all pages with .page-hero or .hero-section
        const path = window.location.pathname.toLowerCase();
        // Removed check so logic works universally
        /* const isIndexPage = path.indexOf('index.html') !== -1 || path === '/' || path.endsWith('/');
        if (!isIndexPage) { ... } */

        // Ensure we have a valid hero height to work with
        if (!heroSection) {
             // If no hero section, just ensure dark text immediately
             navbar.style.setProperty('--navbar-text-color', '#2c3e50'); 
             navbar.style.setProperty('--navbar-stroke-color', 'transparent'); 
             navbar.style.setProperty('--navbar-text-shadow', 'none');
             return;
        }

        // If no hero section exists on this page, maybe we should just set it to solid color immediately?
        // But the user wants "smoothly collapse".
        // Let's assume standard behavior: transparent at top, solid formatting on scroll.
        
        const scrollY = window.scrollY;
        
        // --- 1. ВЫЧИСЛЯЕМ ПРОГРЕСС (от 0 до 1) ---
        // Делаем переход МАКСИМАЛЬНО плавным и незаметным.
        // Он начинается с самого верха и длится дольше высоты экрана (1.2 высоты),
        // чтобы изменение цвета на каждый пиксель было микроскопическим.
        let rawProgress = scrollY / (heroHeight * 1.2);

        if (rawProgress < 0) rawProgress = 0;
        if (rawProgress > 1) rawProgress = 1;

        // Easing: cubic-bezier-like curve for extreme smoothness
        // t^3 * (t * (6t - 15) + 10) - еще более плавная кривая (smootherstep)
        // Но оставим квадратичную p*p*(3-2p), она достаточно хороша.
        const progress = rawProgress * rawProgress * (3 - 2 * rawProgress);

        // --- 2. СМЕШИВАЕМ ЦВЕТА (RGB) ---
        // Начало (Белый): 255, 255, 255
        // Конец (Темно-оранжевый #b8621b): 184, 98, 27
        
        const startR = 255, startG = 255, startB = 255;
        const endR = 184, endG = 98, endB = 27;

        // Формула линейной интерполяции: Start + (End - Start) * Progress
        const currentR = Math.round(startR + (endR - startR) * progress);
        const currentG = Math.round(startG + (endG - startG) * progress);
        const currentB = Math.round(startB + (endB - startB) * progress);
        
        const colorString = `rgb(${currentR}, ${currentG}, ${currentB})`;

        // Оптимизация: если цвет не изменился, не обновляем DOM
        if (navbar.getAttribute('data-last-color') === colorString && !navbar.classList.contains('app-scrolled')) return;
        navbar.setAttribute('data-last-color', colorString);

        // --- 3. ПРИМЕНЯЕМ К ЭЛЕМЕНТАМ ЧЕРЕЗ CSS ПЕРЕМЕННЫЕ ---
        // Если прокрутили больше 50px, ставим фиксированный темный цвет для читаемости на белом фоне
        if (scrollY > 50) {
             navbar.style.setProperty('--navbar-text-color', '#2c3e50'); // Dark Blue
             navbar.style.setProperty('--navbar-stroke-color', 'transparent'); 
             navbar.style.setProperty('--navbar-text-shadow', 'none');
             return;
        }
        
        // В начале страницы (на герое) используем градиент
        navbar.style.setProperty('--navbar-text-color', colorString);
        navbar.style.setProperty('--navbar-stroke-color', colorString); 
        
        // Тень для текста тоже можно сделать динамической, но проще оставить логику JS для тени
        // или тоже через переменную. Сделаем пока просто инлайн для тени, т.к. прозрачность сложнее
        
        const shadowOpacity = 0.3 * (1 - progress); 
        const shadowString = `0 1px 3px rgba(0,0,0,${shadowOpacity})`;
        navbar.style.setProperty('--navbar-text-shadow', shadowString);

        // Кнопка ЛК - фон прозрачный
        const btn = document.querySelector('.navbar .btn-outline-light');
        if (btn) {
           btn.style.setProperty('color', colorString, 'important');
           btn.style.setProperty('border-color', colorString, 'important');
           
           // При наведении нам нужно менять стили. 
           // Лучше просто задать CSS, который использует currentColor или inherit
        }

        const staticToggler = document.querySelector('.navbar-toggler-icon');
        if (staticToggler) {
            const orange = 'rgb(212, 163, 115)';
            const svgIcon = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'><path stroke='${orange}' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/></svg>`;
            const encodedIcon = btoa(svgIcon);
            staticToggler.style.backgroundImage = `url("data:image/svg+xml;base64,${encodedIcon}")`;
            staticToggler.style.filter = 'none';
        }
    }

    // Запускаем при скролле и сразу при загрузке
    window.addEventListener('scroll', updateNavbarGradient);
    updateNavbarGradient();
    
    // 3. ЗAГРУЗКА КОНТЕНТА В ЗАВИСИМОСТИ ОТ СТРАНИЦЫ
    const path = window.location.pathname;
    const handledByUnifiedCatalog = initializeUnifiedPublicCatalog(path);

    if (path.includes('index.html') || path === '/' || path.endsWith('/Frontend/')) {
        loadTours();
        loadHomepageHighlights();
        loadLatestGalleryPhotos(); // Added unified gallery loader
        initializeInteractiveSectionsCarousel();
        initializeAutoHideNavbar();
    } else if (!handledByUnifiedCatalog && path.includes('consultations-')) {
        // Логика для страниц консультаций (подгрузка актуальной цены)
        loadConsultationDetails();
    } else if (!handledByUnifiedCatalog && path.includes('courses-')) {
        // Логика для страниц курсов
        loadCourseDetails();
    } else if (path.includes('blog-articles.html')) {
        loadArticles(); 
    }

    // Инициализация модального окна на всех страницах
    injectBookingModal();
    
    // Инициализация авто-скрытия навбара на всех публичных страницах
    initializeAutoHideNavbar();
});

const API_URL = 'http://localhost:5253/api';

const PAGINATION_SIZE = 6;

function applyMainPageTemplate(currentPath) {
    const excludedPages = new Set([
        'index.html',
        'admin.html',
        'admin-dashboard.html',
        'profile.html',
        'login.html',
        'register.html'
    ]);

    if (excludedPages.has(currentPath)) return;

    const navbar = document.querySelector('nav.navbar');
    if (navbar) {
        // Unified Standard: Use the same structure as Index page
        // We initialize it transparent (no bg-white, no shadow) and let the scroll logic handle the rest.
        // RESTORED 'navbar-expand-lg' to show full menu on desktop
        navbar.className = 'navbar navbar-expand-lg fixed-top'; 
        
        navbar.removeAttribute('style'); 

        navbar.innerHTML = `
            <div class="container">
                <a class="navbar-brand" href="index.html">YOGA.LIFE</a>
                <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#globalNavbarMenu" aria-controls="globalNavbarMenu" aria-expanded="false" aria-label="Переключить навигацию">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="globalNavbarMenu">
                    <ul class="navbar-nav ms-auto w-100 justify-content-lg-end align-items-lg-center gap-lg-4 mt-3 mt-lg-0 pe-lg-1">
                        <li class="nav-item"><a class="nav-link" href="tours.html">Туры</a></li>
                        <li class="nav-item"><a class="nav-link" href="courses-beginners.html">Курсы</a></li>
                        <li class="nav-item"><a class="nav-link" href="consultations-private.html">Консультации</a></li>
                        <li class="nav-item"><a class="nav-link" href="blog-articles.html">Блог</a></li>
                        <li class="nav-item"><a class="nav-link" href="about.html">О нас</a></li>
                        <li class="nav-item ms-lg-3">
                            <a class="btn btn-outline-dark rounded-pill px-4" href="profile.html" id="authBtn">Войти</a>
                        </li>
                    </ul>
                </div>
            </div>
        `;
        document.body.style.paddingTop = '0'; // Reset padding so hero image goes under navbar
    }

    const footer = document.querySelector('footer');
    if (footer) {
        const socialLinksMarkup = currentPath === 'about.html'
            ? ''
            : `
                <div class="d-flex justify-content-center gap-3 mb-4 fs-4">
                    <a href="about-contacts.html#instagram" class="text-white" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
                    <a href="about-contacts.html#telegram" class="text-white" aria-label="Telegram"><i class="bi bi-telegram"></i></a>
                    <a href="about-contacts.html#facebook" class="text-white" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
                    <a href="about-contacts.html#whatsapp" class="text-white" aria-label="WhatsApp"><i class="bi bi-whatsapp"></i></a>
                </div>
            `;

        footer.className = 'bg-dark text-white py-5';
        footer.innerHTML = `
            <div class="container text-center">
                <h3 class="fw-bold mb-3">YOGA.LIFE</h3>
                <p class="text-muted mb-4">Практикуйте йогу где угодно и когда угодно.</p>
                ${socialLinksMarkup}
                <div class="mb-2">
                    <a href="user-agreement.html" class="text-white-50 text-decoration-none me-3">Пользовательское соглашение</a>
                    <a href="privacy-policy.html" class="text-white-50 text-decoration-none">Политика конфиденциальности</a>
                </div>
                <div class="mb-2"><a href="admin.html" class="text-white-50 text-decoration-none">Админка</a></div>
                <p class="small text-muted mb-0">&copy; 2026 - YOGA.LIFE</p>
            </div>
        `;
    }
}

function chooseCourseLink(course) {
    const title = (course?.title || '').toLowerCase();
    if (title.includes('медита') || title.includes('pranayama') || title.includes('meditation')) {
        return 'courses-meditation.html';
    }
    return 'courses-beginners.html';
}

function chooseConsultationLink(item) {
    const title = (item?.title || '').toLowerCase();
    if (title.includes('group') || title.includes('групп')) {
        return 'consultations-group.html';
    }
    return 'consultations-private.html';
}

function chooseArticleLink(article) {
    if (!article || !article.id) return 'blog-articles.html';
    return `article-details.html?id=${article.id}`;
}

function renderHomepageCards(containerId, items, mapToCard) {
    const container = document.getElementById(containerId);
    if (!container || !Array.isArray(items) || items.length === 0) return;

    container.innerHTML = items.map(mapToCard).join('');
}

async function loadHomepageHighlights() {
    try {
        const [coursesResponse, consultationsResponse, articlesResponse] = await Promise.all([
            fetch(`${API_URL}/courses`),
            fetch(`${API_URL}/consultations`),
            fetch(`${API_URL}/articles`)
        ]);

        if (!coursesResponse.ok || !consultationsResponse.ok || !articlesResponse.ok) {
            return;
        }

        const [courses, consultations, articles] = await Promise.all([
            coursesResponse.json(),
            consultationsResponse.json(),
            articlesResponse.json()
        ]);

        const topCourses = [...(courses || [])]
            .sort((a, b) => Number(b.id || 0) - Number(a.id || 0))
            .slice(0, 2);

        const topConsultations = [...(consultations || [])]
            .sort((a, b) => Number(b.id || 0) - Number(a.id || 0))
            .slice(0, 2);

        const sortedArticles = [...(articles || [])]
            .sort((a, b) => {
                const aDate = new Date(a.createdAt || 0).getTime();
                const bDate = new Date(b.createdAt || 0).getTime();
                return bDate - aDate;
            });

        const topBlog = sortedArticles.slice(0, 2);

        renderHomepageCards('courses-cards-container', topCourses, (item) => `
            <div class="col-md-6">
                <a href="${chooseCourseLink(item)}" class="text-decoration-none text-dark">
                    <div class="interactive-card interactive-card--overlay">
                        <img src="${item.imageUrl || ''}" class="interactive-media" alt="${item.title || 'Курс'}">
                        <div class="interactive-info">
                            <h5 class="mb-1">${item.title || 'Курс'}</h5>
                            <p>${(item.description || '').slice(0, 80)}</p>
                        </div>
                    </div>
                </a>
            </div>
        `);

        renderHomepageCards('consultations-cards-container', topConsultations, (item) => `
            <div class="col-md-6">
                <a href="${chooseConsultationLink(item)}" class="text-decoration-none text-dark">
                    <div class="interactive-card interactive-card--overlay">
                        <img src="${item.imageUrl || ''}" class="interactive-media" alt="${item.title || 'Консультация'}">
                        <div class="interactive-info">
                            <h5 class="mb-1">${item.title || 'Консультация'}</h5>
                            <p>${(item.description || '').slice(0, 80)}</p>
                        </div>
                    </div>
                </a>
            </div>
        `);

        renderHomepageCards('blog-cards-container', topBlog, (item) => `
            <div class="col-md-6">
                <a href="${chooseArticleLink(item)}" class="text-decoration-none text-dark">
                    <div class="interactive-card interactive-card--overlay">
                        <img src="${item.imageUrl || ''}" class="interactive-media" alt="${item.title || 'Материал блога'}">
                        <div class="interactive-info">
                            <h5 class="mb-1">${item.title || 'Материал блога'}</h5>
                            <p>${(item.subtitle || '').slice(0, 80)}</p>
                        </div>
                    </div>
                </a>
            </div>
        `);
    } catch (_) {
    }
}

function harmonizePageTypography(currentPath) {
    const brand = document.querySelector('.navbar .navbar-brand');
    if (brand) {
        brand.style.fontFamily = "'Segoe UI', sans-serif";
        brand.style.fontWeight = '800';
        brand.style.fontSize = '2.28rem';
        brand.style.letterSpacing = '-0.5px';
    }

    const navLinks = document.querySelectorAll('.navbar .nav-link');
    navLinks.forEach(link => {
        link.style.fontFamily = "'Segoe UI', sans-serif";
        link.style.fontWeight = '800';
        link.style.fontSize = '1.1rem';
        link.style.letterSpacing = '0.02em';
    });

    const sectionHeadings = document.querySelectorAll('section h1, section h2');
    sectionHeadings.forEach(heading => {
        heading.style.fontFamily = "'Segoe UI', sans-serif";
        heading.style.fontWeight = '800';
        heading.style.letterSpacing = '-0.5px';
    });

    if (currentPath === 'about.html') {
        const aboutHeroTitle = document.querySelector('.hero-section h1');
        if (aboutHeroTitle) {
            aboutHeroTitle.style.fontWeight = '300';
            aboutHeroTitle.style.letterSpacing = '0.04em';
        }
    }
}

function injectPageMaterials(currentPath) {
    const skipPages = new Set(['admin.html', 'admin-dashboard.html', 'profile.html']);
    if (skipPages.has(currentPath)) return;
    if (document.getElementById('page-materials-section')) return;

    const footer = document.querySelector('footer');
    if (!footer) return;

    const byPage = {
        'index.html': {
            title: 'Материалы для ежедневной практики',
            text: 'Поддерживайте регулярный ритм занятий с короткими последовательностями, дыхательными практиками и рекомендациями по восстановлению.',
            image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80'
        },
        'about.html': {
            title: 'Наша философия',
            text: 'Мы объединяем мягкий вход в йогу, системную практику и бережное сопровождение, чтобы вы двигались в своем темпе и видели устойчивый результат.',
            image: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&q=80'
        },
        'tours.html': {
            title: 'Как проходят туры',
            text: 'Каждый тур сочетает практику, восстановление и природные локации: утренние занятия, тематические блоки и комфортный ритм дня.',
            image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80'
        },
        'tour-details.html': {
            title: 'Что вы получите в поездке',
            text: 'Программа построена так, чтобы участники укрепляли тело, успокаивали нервную систему и возвращались с понятным личным планом практики.',
            image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&q=80'
        },
        'courses-beginners.html': {
            title: 'Материалы курса для старта',
            text: 'Пошаговые уроки, видеоразбор техники и вспомогательные конспекты помогают освоить базу без перегрузки и травм.',
            image: 'https://images.unsplash.com/photo-1599447421405-0753f5d1a5ca?auto=format&fit=crop&q=80'
        },
        'courses-meditation.html': {
            title: 'Практики концентрации и дыхания',
            text: 'В разделе собраны материалы по медитации, пранаяме и навыкам внимания для снижения стресса и улучшения качества сна.',
            image: 'https://images.unsplash.com/photo-1549570652-97324981a6fd?auto=format&fit=crop&q=80'
        },
        'consultations-private.html': {
            title: 'Персональные рекомендации',
            text: 'Индивидуальный формат помогает разобрать запрос, подобрать практику и получить маршрут прогресса на ближайшие недели.',
            image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80'
        },
        'consultations-group.html': {
            title: 'Групповая поддержка',
            text: 'Групповые встречи усиливают мотивацию, создают среду единомышленников и помогают закрепить результат регулярной практикой.',
            image: 'https://images.unsplash.com/photo-1593810450967-f9c42742e326?auto=format&fit=crop&q=80'
        },
        'blog-articles.html': {
            title: 'Полезные статьи по йоге',
            text: 'Читайте короткие практические материалы о технике, восстановлении, привычках и мягком развитии дисциплины.',
            image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80'
        },
        'blog-videos.html': {
            title: 'Видео и визуальные практики',
            text: 'Наглядные разборы движений, короткие комплексы и визуальные подсказки помогают быстрее применять знания на практике.',
            image: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&q=80'
        },
        'privacy-policy.html': {
            title: 'Прозрачность обработки данных',
            text: 'Мы стремимся объяснять правила хранения и использования данных простым языком, чтобы у пользователя была ясность и контроль.',
            image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80'
        },
        'user-agreement.html': {
            title: 'Понятные правила использования',
            text: 'Мы оформляем условия сервиса в удобной структуре: права, обязанности и основные ограничения описаны максимально прозрачно.',
            image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80'
        }
    };

    const pageKey = currentPath || 'index.html';
    const material = byPage[pageKey] || {
        title: 'Дополнительные материалы',
        text: 'На этой странице собраны полезные текстовые и визуальные материалы для комфортной и регулярной практики.',
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80'
    };

    const section = document.createElement('section');
    section.id = 'page-materials-section';
    section.className = 'py-5 bg-light';
    section.innerHTML = `
        <div class="container py-4">
            <div class="row g-4 align-items-center">
                <div class="col-lg-6">
                    <h2 class="mb-3">${material.title}</h2>
                    <p class="text-muted mb-0">${material.text}</p>
                </div>
                <div class="col-lg-6">
                    <img src="${material.image}" alt="Материалы раздела" class="img-fluid rounded-4 shadow-sm" style="width:100%;height:320px;object-fit:cover;">
                </div>
            </div>
        </div>
    `;

    footer.parentNode.insertBefore(section, footer);
}

function removeSecondaryPageHero(currentPath) {
    const keepHeroPages = new Set(['index.html', 'about.html']);
    if (keepHeroPages.has(currentPath)) return;

    const hero = document.querySelector('.hero-section');
    if (hero) {
        hero.remove();
    }
}

function setupAutoScrollableContainer(container, options = {}) {
    if (!container) return;
    if (container.dataset.carouselInitialized === 'true') return;

    const cardNodes = Array.from(container.children);

    const uniqueCards = [...new Set(cardNodes)].filter(Boolean);
    if (uniqueCards.length === 0) return;

    const viewportWidth = container.parentElement ? container.parentElement.clientWidth : window.innerWidth;
    const gapPx = options.gapPx ?? 16;
    const cardWidthDesktop = options.cardWidthDesktop || Math.max(320, Math.floor((viewportWidth - gapPx) / 2));
    const cardWidthMobile = options.cardWidthMobile || viewportWidth;
    const imageHeightDesktop = options.imageHeightDesktop || Math.round(window.innerHeight * 0.5);
    const imageHeightMobile = options.imageHeightMobile || Math.round(window.innerHeight * 0.42);
    const stepPx = options.stepPx || 1;
    const tickMs = options.tickMs || 24;
    const imageSelector = options.imageSelector || '.interactive-media';

    const isMobile = window.innerWidth < 768;
    const cardWidth = isMobile ? cardWidthMobile : cardWidthDesktop;
    const imageHeight = isMobile ? imageHeightMobile : imageHeightDesktop;

    container.classList.remove('row');
    container.classList.add('d-flex', 'flex-nowrap', 'overflow-auto', 'pb-2');
    container.style.gap = `${gapPx}px`;
    container.style.scrollBehavior = 'auto';
    container.style.webkitOverflowScrolling = 'touch';

    uniqueCards.forEach(card => {
        card.classList.add('flex-shrink-0');
        card.style.minWidth = `${cardWidth}px`;
        card.style.maxWidth = `${cardWidth}px`;

        const img = card.querySelector(imageSelector);
        if (img) {
            img.style.height = `${imageHeight}px`;
        }
    });

    const clones = uniqueCards.map(card => {
        const clone = card.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        return clone;
    });
    clones.forEach(clone => container.appendChild(clone));

    requestAnimationFrame(() => {
        container.scrollLeft = 0;
    });

    let timer = null;
    const start = () => {
        if (timer) return;
        timer = setInterval(() => {
            container.scrollLeft += stepPx;

            const halfWidth = container.scrollWidth / 2;
            if (container.scrollLeft >= halfWidth) {
                container.scrollLeft -= halfWidth;
            }
        }, tickMs);
    };
    const stop = () => {
        if (!timer) return;
        clearInterval(timer);
        timer = null;
    };

    start();
    container.addEventListener('mouseenter', stop);
    container.addEventListener('mouseleave', start);
    container.addEventListener('touchstart', stop, { passive: true });
    container.addEventListener('touchend', start, { passive: true });

    container.dataset.carouselInitialized = 'true';
}

function initializeInteractiveSectionsCarousel() {
    setupAutoScrollableContainer(document.getElementById('sections-cards-container'), {
        imageSelector: '.interactive-media',
        cardWidthDesktop: Math.max(320, Math.floor(((document.querySelector('#sections-menu .container')?.clientWidth || window.innerWidth) - 30) / 2)),
        cardWidthMobile: document.querySelector('#sections-menu .container')?.clientWidth || window.innerWidth,
        imageHeightDesktop: Math.round(window.innerHeight * 0.5),
        imageHeightMobile: Math.round(window.innerHeight * 0.42),
        gapPx: 30,
        stepPx: 1,
        tickMs: 24
    });
}

function initializeAutoHideNavbar() {
    const navbar = document.querySelector('.navbar');
    // If navbar is not found, we can't do anything
    if (!navbar) return;
    
    // Using includes because sometimes paths can be /Frontend/index.html or just /index.html
    const path = window.location.pathname.toLowerCase();
    
    // Explicitly set transition for smoothness
    // Use !important to override any bootstrap or other conflicting styles if necessary
    navbar.style.cssText += 'transition: transform 0.4s ease-in-out, background-color 0.3s ease !important;';

    let lastScrollY = window.scrollY;
    let isHidden = false;

    // Use a simple boolean to track if we just scrolled down
    // This debounces the hiding a bit
    let ticking = false;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const delta = currentScrollY - lastScrollY;
                
                // 1. Logic for Hiding/Showing Navbar
                // Hide if scrolling DOWN (delta > 0) and we are past 100px
                if (currentScrollY > 100 && delta > 0) {
                    if (!isHidden) {
                        navbar.classList.add('nav-hidden');
                        navbar.style.transform = 'translateY(-100%)'; // Force inline style to be sure
                        isHidden = true;
                        
                        // Close mobile menu if open
                        const collapse = navbar.querySelector('.navbar-collapse');
                        if (collapse && collapse.classList.contains('show')) {
                             const bsCollapse = bootstrap.Collapse.getInstance(collapse);
                             if (bsCollapse) bsCollapse.hide();
                        }
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
                
                // Always ensure visibility at the very top
                if (currentScrollY < 100 && isHidden) {
                     navbar.classList.remove('nav-hidden');
                     navbar.style.transform = 'translateY(0)';
                     isHidden = false;
                }

                // 2. Logic for Background Transparency (app-scrolled)
                if (currentScrollY > 50) {
                    if (!navbar.classList.contains('app-scrolled')) {
                        navbar.classList.add('app-scrolled');
                        // Dark text for visibility on white background
                        navbar.style.setProperty('--navbar-text-color', '#2c3e50'); 
                    }
                } else {
                    if (navbar.classList.contains('app-scrolled')) {
                        navbar.classList.remove('app-scrolled');
                        // Reset text color is handled by CSS or default vars
                    }
                }

                lastScrollY = currentScrollY;
                ticking = false;
            });

            ticking = true;
        }
    }, { passive: true });
    
    // Trigger once on load to set initial state
    const initialScroll = window.scrollY;
    if (initialScroll > 50) {
         navbar.classList.add('app-scrolled');
    }
}

// Ensure the navbar logic runs fully after everything else
// If document is already loaded, run immediately
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initializeAutoHideNavbar();
} else {
    document.addEventListener('DOMContentLoaded', initializeAutoHideNavbar);
    window.addEventListener('load', initializeAutoHideNavbar);
}

const TOUR_DETAILS_CONTENT = {
    'Магия Бали': {
        subtitle: 'Духовные практики и океанская энергия',
        duration: '8 дней / 7 ночей',
        format: 'Ежедневная йога, медитации, выездные практики',
        program: [
            'День 1: Заезд, адаптация, вечерняя практика на закате',
            'Дни 2-6: Утренние асаны, дневные лекции, вечерние медитации',
            'День 7: Свободная программа + индивидуальные консультации',
            'День 8: Итоговая практика и отъезд'
        ],
        includes: ['Проживание в отеле 4*', 'Завтраки и ужины', 'Трансфер аэропорт-отель-аэропорт', 'Практики и групповые сессии'],
        excluded: ['Авиабилеты', 'Страховка', 'Личные расходы'],
        accommodation: 'Бутик-отель рядом с океаном, двухместное размещение.',
        audience: 'Подходит для начального и среднего уровня практики.'
    },
    'Алтайская Тишина': {
        subtitle: 'Перезагрузка в горах и тишина природы',
        duration: '7 дней / 6 ночей',
        format: 'Йога на природе, треккинг, дыхательные практики',
        program: [
            'День 1: Заезд и мягкая практика восстановления',
            'Дни 2-5: Утренние практики и пешие маршруты в сопровождении',
            'День 6: Глубокая медитация и йога-нидра',
            'День 7: Подведение итогов и отъезд'
        ],
        includes: ['Проживание на эко-базе', 'Трехразовое питание', 'Сопровождение инструктора'],
        excluded: ['Дорога до точки сбора', 'Личные активности'],
        accommodation: 'Эко-домики в горах, теплые залы для практики.',
        audience: 'Для тех, кто хочет отключиться от города и восстановиться.'
    },
    'Мальдивы Релакс': {
        subtitle: 'Море, восстановление и мягкая йога',
        duration: '6 дней / 5 ночей',
        format: 'Релакс-программа у океана',
        program: [
            'Ежедневно: Утренние практики на берегу',
            'Дневные блоки: дыхание и антистресс-практики',
            'Вечер: расслабляющая медитация и растяжка'
        ],
        includes: ['Отель 4*', 'Завтраки', 'Групповые практики'],
        excluded: ['Авиабилеты', 'Экскурсии вне программы'],
        accommodation: 'Отель на первой линии, двухместные номера.',
        audience: 'Идеально для новичков и восстановления после перегрузок.'
    },
    'Непал: Путь к Гималаям': {
        subtitle: 'Практика в горах и философия йоги',
        duration: '10 дней / 9 ночей',
        format: 'Трекинг + духовные практики',
        program: [
            'День 1-2: Катманду, вводная программа',
            'Дни 3-7: Трекинг и практики на маршруте',
            'Дни 8-9: Покхара, восстановление и лекции',
            'День 10: Завершение и трансфер'
        ],
        includes: ['Проживание по маршруту', 'Сопровождение гида и инструктора', 'Групповые практики'],
        excluded: ['Визовые сборы', 'Страховка', 'Личное снаряжение'],
        accommodation: 'Комбинированное размещение: отели и горные лоджи.',
        audience: 'Для участников со средним уровнем физической подготовки.'
    },
    'Турция: Йога и Детокс': {
        subtitle: 'Баланс тела и питания у моря',
        duration: '7 дней / 6 ночей',
        format: 'Йога, детокс-питание, лекции по нутрициологии',
        program: [
            'Утро: динамическая практика и дыхание',
            'День: лекции и консультации по питанию',
            'Вечер: восстановительные практики и йога-нидра'
        ],
        includes: ['Проживание', 'Детокс-меню', 'Групповые практики', 'Материалы по питанию'],
        excluded: ['Авиабилеты', 'Личные процедуры SPA'],
        accommodation: 'Ретрит-отель у моря, спокойная природная зона.',
        audience: 'Для тех, кто хочет мягко перезапустить режим и питание.'
    }
};

// --- ФУНКЦИИ ЗАГРУЗКИ ---

function initializeUnifiedPublicCatalog(path) {
    const tourDetailsPage = document.getElementById('tour-details-page');
    if (tourDetailsPage) {
        loadTourDetailsPage();
        return true;
    }

    const toursCatalogContainer = document.getElementById('tours-catalog-container');
    const upcomingToursContainer = document.getElementById('upcoming-tours-container');
    const pastToursContainer = document.getElementById('past-tours-container');
    if (toursCatalogContainer || (upcomingToursContainer && pastToursContainer)) {
        loadToursCatalog();
        return true;
    }

    const articlesContainer = document.getElementById('articles-container');
    if (articlesContainer) {
        const categoryByPage = {
            'blog-articles.html': 'Article',
            'blog-videos.html': 'Video',
            'blog-classes.html': 'Class',
            'blog-recipes.html': 'Recipe',
            'blog-podcasts.html': 'Podcast'
        };

        const pageName = path.split('/').pop() || '';
        const selectedCategory = categoryByPage[pageName] || null;
        loadArticlesCatalog(selectedCategory);
        return true;
    }

    const productsContainer = document.getElementById('products-container');
    if (productsContainer) {
        const pageName = path.split('/').pop() || '';
        loadProgramCatalog(pageName);
        return true;
    }

    return false;
}

function createCatalogControls(container) {
    const wrapper = document.createElement('div');
    wrapper.className = 'row g-3 mb-4 align-items-end';
    wrapper.innerHTML = `
        <div class="col-12 text-md-end">
            <div class="small text-muted" id="catalogCount"></div>
        </div>
    `;

    container.parentElement.insertBefore(wrapper, container);
    return {
        countNode: wrapper.querySelector('#catalogCount')
    };
}

function renderPagination(container, currentPage, totalPages, onPageChange) {
    let paginationNode = container.parentElement.querySelector('#catalogPagination');
    if (!paginationNode) {
        paginationNode = document.createElement('div');
        paginationNode.id = 'catalogPagination';
        paginationNode.className = 'd-flex justify-content-center mt-4';
        container.parentElement.appendChild(paginationNode);
    }

    if (totalPages <= 1) {
        paginationNode.innerHTML = '';
        return;
    }

    const buttons = [];
    for (let page = 1; page <= totalPages; page += 1) {
        buttons.push(`
            <button class="btn btn-sm ${page === currentPage ? 'btn-warning text-white' : 'btn-outline-secondary'} mx-1" data-page="${page}">
                ${page}
            </button>
        `);
    }

    paginationNode.innerHTML = buttons.join('');
    paginationNode.querySelectorAll('button[data-page]').forEach(button => {
        button.addEventListener('click', () => {
            onPageChange(Number(button.getAttribute('data-page')));
        });
    });
}

function paginate(items, currentPage) {
    const totalPages = Math.max(1, Math.ceil(items.length / PAGINATION_SIZE));
    const safePage = Math.min(Math.max(currentPage, 1), totalPages);
    const start = (safePage - 1) * PAGINATION_SIZE;
    return {
        pageItems: items.slice(start, start + PAGINATION_SIZE),
        totalPages,
        safePage
    };
}

async function loadArticlesCatalog(categoryFilter = null) {
    const container = document.getElementById('articles-container');
    if (!container) return;

    try {
        const response = await fetch(`${API_URL}/articles`);
        if (!response.ok) throw new Error('Failed to fetch content');
        const allItems = await response.json();

        const controls = createCatalogControls(container);

        let currentPage = 1;

        const applyAndRender = () => {
            let items = allItems;
            if (categoryFilter) {
                items = items.filter(item => item.category === categoryFilter);
            }

            items.sort((a, b) => new Date(b.createdAt || b.publishedDate || 0) - new Date(a.createdAt || a.publishedDate || 0));

            const { pageItems, totalPages, safePage } = paginate(items, currentPage);
            currentPage = safePage;
            controls.countNode.innerText = `Найдено: ${items.length}`;

            if (pageItems.length === 0) {
                container.innerHTML = '<p class="text-center text-muted w-100">По вашему запросу ничего не найдено.</p>';
            } else {
                container.innerHTML = '';
                pageItems.forEach(article => {
                    const html = `
                        <div class="col-md-4">
                            <div class="card h-100 border-0 shadow-sm article-card">
                                <img src="${article.imageUrl}" class="card-img-top" style="height: 200px; object-fit: cover; border-radius: 8px;">
                                <div class="card-body">
                                    <span class="badge bg-light text-dark mb-2">${article.category}</span>
                                    <h5 class="card-title font-playfair fw-bold">${article.title}</h5>
                                    <p class="card-text text-muted small">${(article.content || '').substring(0, 100)}...</p>
                                    <div class="d-flex justify-content-between align-items-center mt-3">
                                        <small class="text-muted">By ${article.author || 'Admin'}</small>
                                        <button class="btn btn-link text-warning p-0 fw-bold text-decoration-none" type="button">
                                            ${article.category === 'Video' ? 'Смотреть' : 'Читать далее'} &rarr;
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    container.insertAdjacentHTML('beforeend', html);
                });
            }

            renderPagination(container, currentPage, totalPages, (newPage) => {
                currentPage = newPage;
                applyAndRender();
            });
        };

        applyAndRender();
    } catch (e) {
        container.innerHTML = `<p class="text-danger text-center">Ошибка загрузки: ${e.message}</p>`;
    }
}

function normalizeLevel(value) {
    return (value || '').toLowerCase();
}

function matchCourseByPage(pageName, course) {
    const title = (course.title || '').toLowerCase();
    const level = normalizeLevel(course.level);

    if (pageName === 'courses-beginners.html') {
        return title.includes('начина') || title.includes('begin') || title.includes('занят') || level.includes('begin');
    }
    if (pageName === 'courses-back.html') {
        return title.includes('спин') || title.includes('back');
    }
    if (pageName === 'courses-meditation.html') {
        return title.includes('медита') || title.includes('meditation') || title.includes('pranayama');
    }
    return true;
}

function matchConsultationByPage(pageName, item) {
    const title = (item.title || '').toLowerCase();
    if (pageName === 'consultations-private.html') {
        return title.includes('individual') || title.includes('private') || title.includes('индивиду');
    }
    if (pageName === 'consultations-group.html') {
        return title.includes('group') || title.includes('групп');
    }
    return true;
}

async function loadProgramCatalog(pageName) {
    const container = document.getElementById('products-container');
    if (!container) return;

    const isCoursePage = pageName.startsWith('courses-');
    const bookingType = isCoursePage ? 'course' : 'consultation';

    try {
        const controls = createCatalogControls(container);

        let currentPage = 1;
        const pageSize = PAGINATION_SIZE;

        const applyAndRender = async () => {
            let pageItems = [];
            let totalItems = 0;
            let totalPages = 1;
            let safePage = currentPage;

            if (isCoursePage) {
                const query = new URLSearchParams({
                    pageName,
                    page: String(currentPage),
                    pageSize: String(pageSize)
                });

                const response = await fetch(`${API_URL}/courses/catalog?${query.toString()}`);
                if (!response.ok) throw new Error('Failed to fetch courses catalog');
                const payload = await response.json();

                pageItems = payload.items || [];
                totalItems = Number(payload.total || 0);
                safePage = Number(payload.page || currentPage);
                totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
                currentPage = safePage;
            } else {
                const response = await fetch(`${API_URL}/consultations`);
                if (!response.ok) throw new Error('Failed to fetch programs');
                const allItems = await response.json();

                const filteredItems = allItems.filter(item => matchConsultationByPage(pageName, item));
                let items = filteredItems.length > 0 ? filteredItems : allItems;

                const paged = paginate(items, currentPage);
                pageItems = paged.pageItems;
                safePage = paged.safePage;
                totalPages = paged.totalPages;
                totalItems = items.length;
                currentPage = safePage;
            }

            controls.countNode.innerText = `Найдено: ${totalItems}`;

            if (pageItems.length === 0) {
                container.innerHTML = '<p class="text-center text-muted w-100">По вашему запросу ничего не найдено.</p>';
            } else {
                container.innerHTML = pageItems.map(item => `
                    <div class="col-md-6 col-lg-4">
                        <div class="card h-100 shadow border-0">
                            <div class="position-relative overflow-hidden" style="height: 200px;">
                                <img src="${item.imageUrl || ''}" class="card-img-top w-100 h-100 object-fit-cover" alt="${item.title}">
                            </div>
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title font-playfair fw-bold mb-3">${item.title}</h5>
                                <p class="card-text text-muted small flex-grow-1">${item.description || ''}</p>
                                <div class="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                                    <span class="fs-4 fw-bold text-dark">${item.price || 0} ₽</span>
                                    <button class="btn btn-warning rounded-pill text-white fw-bold px-4 shadow-sm"
                                        onclick="openBookingModal(${item.id}, '${(item.title || '').replace(/'/g, "\\'")}', '${bookingType}')">
                                        Записаться
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('');
            }

            renderPagination(container, currentPage, totalPages, (newPage) => {
                currentPage = newPage;
                applyAndRender().catch(error => {
                    console.error('Error loading programs:', error);
                    container.innerHTML = `<div class="alert alert-warning text-center">Не удалось загрузить данные. Попробуйте позже.</div>`;
                });
            });
        };

        await applyAndRender();
    } catch (error) {
        console.error('Error loading programs:', error);
        container.innerHTML = `<div class="alert alert-warning text-center">Не удалось загрузить данные. Попробуйте позже.</div>`;
    }
}

async function loadToursCatalog() {
    const upcomingContainer = document.getElementById('upcoming-tours-container');
    const pastContainer = document.getElementById('past-tours-container');
    if (!upcomingContainer || !pastContainer) return;

    try {
        const response = await fetch(`${API_URL}/tours`);
        if (!response.ok) throw new Error('Failed to fetch tours');
        const allTours = await response.json();

        const controls = createCatalogControls(upcomingContainer);

        let currentPage = 1;

        const applyAndRender = () => {
            const now = new Date();

            let items = [...allTours];

            items.sort((a, b) => new Date(a.startDate || 0) - new Date(b.startDate || 0));

            const upcomingTours = items.filter(tour => new Date(tour.startDate) >= now);
            const pastTours = items.filter(tour => new Date(tour.startDate) < now)
                .sort((a, b) => new Date(b.startDate || 0) - new Date(a.startDate || 0));

            const { pageItems, totalPages, safePage } = paginate(upcomingTours, currentPage);
            currentPage = safePage;
            controls.countNode.innerText = `Найдено: ${items.length}`;

            if (pageItems.length === 0) {
                upcomingContainer.innerHTML = '<p class="text-center text-muted w-100">Актуальные туры по вашему запросу не найдены.</p>';
            } else {
                upcomingContainer.innerHTML = pageItems.map(tour => `
                    <div class="col-md-6 col-lg-4">
                        <div class="card h-100 border-0 shadow-sm tour-card">
                            <div class="position-relative overflow-hidden">
                                ${(tour.isHit ? '<span class="badge bg-warning position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill z-2">ХИТ</span>' : '')}
                                <img src="${tour.imageUrl || ''}" class="card-img-top" alt="${tour.title}" style="height: 250px; object-fit: cover;">
                            </div>
                            <div class="card-body p-4 text-center">
                                <h5 class="font-playfair fs-4 mb-3">${tour.title}</h5>
                                <ul class="list-unstyled text-muted small mb-4">
                                    <li class="mb-2"><i class="bi bi-calendar3 me-2 text-warning"></i>${new Date(tour.startDate).toLocaleDateString()}</li>
                                    <li class="mb-2"><i class="bi bi-geo-alt me-2 text-warning"></i>${tour.location || 'Локация уточняется'}</li>
                                    <li><i class="bi bi-people me-2 text-warning"></i>Мест: ${tour.spotsAvailable ?? 0}</li>
                                </ul>
                                <div class="d-flex justify-content-between align-items-center mt-4 gap-3">
                                    <span class="fs-5 fw-bold text-dark">${tour.price || 0} ₽</span>
                                    <div class="btn-group gap-2">
                                        <a href="tour-details.html?id=${tour.id}" class="btn btn-outline-dark rounded-pill px-3 btn-sm">Подробнее</a>
                                        <button onclick="openBookingModal(${tour.id}, '${(tour.title || '').replace(/'/g, "\\'")}', 'tour')" class="btn btn-warning rounded-pill px-3 btn-sm fw-bold shadow-sm">Записаться</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('');
            }

            if (pastTours.length === 0) {
                pastContainer.innerHTML = '<p class="text-center text-muted w-100">Прошедшие туры пока не добавлены.</p>';
            } else {
                pastContainer.innerHTML = pastTours.map(tour => `
                    <div class="col-md-6 col-lg-4">
                        <div class="card h-100 border-0 shadow-sm tour-card">
                            <a href="tour-details.html?id=${tour.id}" class="position-relative overflow-hidden d-block">
                                <img src="${tour.imageUrl || ''}" class="card-img-top" alt="${tour.title}" style="height: 250px; object-fit: cover;">
                            </a>
                            <div class="card-body p-4 text-center">
                                <h5 class="font-playfair fs-4 mb-2">${tour.title}</h5>
                                <p class="text-muted small mb-3">Прошел ${new Date(tour.startDate).toLocaleDateString()}</p>
                                <a href="tour-details.html?id=${tour.id}" class="btn btn-outline-dark rounded-pill px-3 btn-sm">Смотреть фото и видео</a>
                            </div>
                        </div>
                    </div>
                `).join('');
            }

            renderPagination(upcomingContainer, currentPage, totalPages, (newPage) => {
                currentPage = newPage;
                applyAndRender();
            });
        };

        applyAndRender();
    } catch (error) {
        console.error('Error loading tours catalog:', error);
        upcomingContainer.innerHTML = '<div class="alert alert-warning text-center">Не удалось загрузить туры. Попробуйте позже.</div>';
        pastContainer.innerHTML = '<div class="alert alert-warning text-center">Не удалось загрузить прошедшие туры.</div>';
    }
}

async function loadTourDetailsPage() {
    const root = document.getElementById('tour-details-page');
    if (!root) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        root.innerHTML = '<div class="alert alert-warning">Тур не найден. Вернитесь в каталог туров.</div>';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/tours/${id}`);
        if (!response.ok) throw new Error('Тур не найден');

        const tour = await response.json();
        const isPastTour = new Date(tour.startDate) < new Date();
        const details = TOUR_DETAILS_CONTENT[tour.title] || {
            subtitle: 'Авторская программа йога-путешествия',
            duration: 'Уточняется',
            format: 'Групповые практики и сопровождение кураторов',
            program: ['День заезда и адаптация', 'Ежедневные практики и лекции', 'Заключительная групповая сессия'],
            includes: ['Проживание', 'Групповые практики'],
            excluded: ['Авиабилеты', 'Личные расходы'],
            accommodation: 'Детали проживания уточняются после брони.',
            audience: 'Подходит участникам с разным уровнем подготовки.',
            pastSummary: 'Тур успешно завершен. Участники прошли практики, выезды и групповые сессии.',
            gallery: [tour.imageUrl || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80'],
            videoUrl: 'https://www.youtube.com/embed/4pKly2JojMw'
        };

        root.innerHTML = `
            <div class="row g-5 align-items-start">
                <div class="col-lg-5">
                    <img src="${tour.imageUrl || ''}" alt="${tour.title}" class="img-fluid rounded-4 shadow-sm mb-4">
                    <div class="card border-0 shadow-sm">
                        <div class="card-body">
                            <h5 class="mb-3">Кратко о туре</h5>
                            <p class="mb-2"><strong>Локация:</strong> ${tour.location || '-'}</p>
                            <p class="mb-2"><strong>Дата старта:</strong> ${new Date(tour.startDate).toLocaleDateString()}</p>
                            <p class="mb-2"><strong>Длительность:</strong> ${details.duration}</p>
                            <p class="mb-2"><strong>Формат:</strong> ${details.format}</p>
                            <p class="mb-2"><strong>Сложность:</strong> ${tour.difficulty || 1}/5</p>
                            <p class="mb-3"><strong>Свободных мест:</strong> ${tour.spotsAvailable ?? 0}</p>
                            <p class="fs-4 fw-bold mb-3">${tour.price || 0} ₽</p>
                            ${isPastTour ? `
                                <div class="alert alert-secondary mb-0">Тур завершен. Смотрите фото и видео ниже.</div>
                            ` : `
                                <button id="showTourContactsBtn" class="btn btn-outline-dark w-100 mb-2 fw-bold">Показать контакты</button>
                                <div id="tourContactsBox" class="border rounded p-3 mb-2 text-start d-none">
                                    <div><strong>Телефон:</strong> +7 (900) 000-00-00</div>
                                    <div><strong>Telegram:</strong> @yogalife_manager</div>
                                    <div><strong>Email:</strong> booking@yoga.life</div>
                                </div>
                                <button onclick="openBookingModal(${tour.id}, '${(tour.title || '').replace(/'/g, "\\'")}', 'tour')" class="btn btn-warning w-100 fw-bold">Записаться</button>
                            `}
                        </div>
                    </div>
                </div>
                <div class="col-lg-7">
                    <h1 class="font-playfair mb-2">${tour.title}</h1>
                    <p class="lead text-muted mb-4">${details.subtitle}</p>
                    <p class="mb-4">${tour.description || ''}</p>

                    <div class="mb-4">
                        <h4 class="mb-3">Подраздел: Программа тура</h4>
                        <ul class="list-group list-group-flush border rounded-3">
                            ${details.program.map(item => `<li class="list-group-item">${item}</li>`).join('')}
                        </ul>
                    </div>

                    <div class="mb-4">
                        <h4 class="mb-3">Подраздел: Что включено</h4>
                        <ul>
                            ${details.includes.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>

                    <div class="mb-4">
                        <h4 class="mb-3">Подраздел: Что не включено</h4>
                        <ul>
                            ${details.excluded.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>

                    <div class="mb-4">
                        <h4 class="mb-2">Подраздел: Проживание</h4>
                        <p>${details.accommodation}</p>
                    </div>

                    <div class="mb-2">
                        <h4 class="mb-2">Подраздел: Для кого тур</h4>
                        <p>${details.audience}</p>
                    </div>

                    ${isPastTour ? `
                        <div class="mt-4">
                            <h4 class="mb-3">Фото и видео тура</h4>
                            <p class="text-muted">${details.pastSummary || 'Короткая информация о прошедшем туре.'}</p>
                            <div class="row g-3 mb-3">
                                ${(details.gallery || []).slice(0, 3).map(photo => `
                                    <div class="col-md-4">
                                        <img src="${photo}" alt="Фото тура" class="img-fluid rounded-3 shadow-sm" style="height: 180px; object-fit: cover; width: 100%;">
                                    </div>
                                `).join('')}
                            </div>
                            <div class="ratio ratio-16x9 rounded-3 overflow-hidden shadow-sm">
                                <iframe src="${details.videoUrl || 'https://www.youtube.com/embed/4pKly2JojMw'}" title="Видео тура" allowfullscreen></iframe>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        const showContactsBtn = document.getElementById('showTourContactsBtn');
        if (showContactsBtn) {
            showContactsBtn.addEventListener('click', () => {
                const contactsBox = document.getElementById('tourContactsBox');
                if (contactsBox) {
                    contactsBox.classList.remove('d-none');
                }
            });
        }
    } catch (error) {
        console.error(error);
        root.innerHTML = '<div class="alert alert-danger">Не удалось загрузить информацию о туре.</div>';
    }
}

async function loadArticles(categoryFilter = null) {
    const container = document.getElementById('articles-container');
    if (!container) return; // Not on blog page

    try {
        const response = await fetch(`${API_URL}/articles`);
        if (!response.ok) throw new Error('Failed to fetch content');
        
        const allItems = await response.json();
        let items = allItems.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (categoryFilter) {
            items = items.filter(item => (item.category || '').toLowerCase() === categoryFilter.toLowerCase());
        }

        container.innerHTML = '';
        
        if (items.length === 0) {
            container.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted fs-4">Пока нет материалов.</p></div>';
            return;
        }

        items.forEach(article => {
            const html = `
                <div class="col-md-4 col-sm-6">
                    <a href="article-details.html?id=${article.id}" class="text-decoration-none text-dark">
                        <div class="card h-100 border-0 shadow-sm article-card hover-lift">
                            <div class="position-relative" style="height: 220px; overflow: hidden; border-radius: 12px 12px 0 0;">
                                <img src="${article.imageUrl}" class="w-100 h-100 object-fit-cover transition-transform" alt="${article.title}">
                                <span class="position-absolute top-0 end-0 m-3 badge bg-white text-dark shadow-sm rounded-pill">${article.category || 'Блог'}</span>
                            </div>
                            <div class="card-body p-4">
                                <h5 class="card-title font-playfair fw-bold mb-3 lh-sm">${article.title}</h5>
                                <p class="card-text text-muted small mb-4 line-clamp-3">${(article.subtitle || article.content || '').substring(0, 100)}...</p>
                                <div class="d-flex justify-content-between align-items-center mt-auto pt-3 border-top border-light">
                                    <small class="text-muted d-flex align-items-center gap-2">
                                        <i class="bi bi-person-circle"></i> ${article.author || 'Admin'}
                                    </small>
                                    <span class="text-warning fw-bold small">
                                        Читать <i class="bi bi-arrow-right ms-1"></i>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </a>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        });
    } catch (e) {
        container.innerHTML = `<div class="col-12 text-center py-5"><p class="text-danger">Ошибка загрузки: ${e.message}</p></div>`;
    }
}

async function loadConsultationDetails() {
    // Определяем какую консультацию ищем по заголовку H1 на странице
    const titleEl = document.querySelector('h1');
    if (!titleEl) return;
    const pageTitle = titleEl.innerText.trim(); // "Индивидуальная Тренировка" и т.д.

    try {
        const response = await fetch(`${API_URL}/consultations`);
        const items = await response.json();
        
        let item = null;
        if (pageTitle.includes('Индивидуальная') || pageTitle.includes('Индивидуальные')) item = items.find(i => (i.title || '').toLowerCase().includes('individual') || (i.title || '').toLowerCase().includes('индивиду')) || items[0];
        else if (pageTitle.includes('Групп')) item = items.find(i => (i.title || '').toLowerCase().includes('group') || (i.title || '').toLowerCase().includes('групп')) || items[0];
        if (!item && items.length > 0) item = items[0];

        if (item) {
            const btn = document.querySelector('button.btn-warning');
            if (btn) {
                btn.innerHTML = 'Записаться';
                btn.onclick = () => openBookingModal(item.id, item.title, 'consultation');
            }
        }
    } catch (e) { console.error(e); }
}

async function loadCourseDetails() {
    const titleEl = document.querySelector('h1');
    if (!titleEl) return;
    const pageTitle = titleEl.innerText.trim();

    try {
        const response = await fetch(`${API_URL}/courses`);
        const items = await response.json();
        
        let item = null;
        if (pageTitle.toLowerCase().includes('начина')) item = items.find(i => i.title.toLowerCase().includes('начина')) || items.find(i => i.title.toLowerCase().includes('begin'));
        else if (pageTitle.toLowerCase().includes('спин')) item = items.find(i => i.title.toLowerCase().includes('спин')) || items.find(i => i.title.toLowerCase().includes('back'));
        else if (pageTitle.toLowerCase().includes('медитац')) item = items.find(i => i.title.toLowerCase().includes('медитац')) || items.find(i => i.title.toLowerCase().includes('meditation'));
        else if (pageTitle.toLowerCase().includes('жен')) item = items.find(i => i.title.toLowerCase().includes('women'));
        if (!item && items.length > 0) item = items[0];

        if (item) {
            const btn = document.querySelector('button.btn-warning'); // Кнопка "Записаться"
            if (btn) {
                btn.innerHTML = 'Записаться';
                btn.onclick = () => openBookingModal(item.id, item.title, 'course');
            }
        }
    } catch (e) { console.error(e); }
}

// Функция загрузки туров (асинхронная)
async function loadTours() {
    const container = document.getElementById('tours-container');
    if (!container) return; // Не на главной
    
    // Искусственная задержка (чтобы увидеть спиннер), в реальном проекте не нужна
    // await new Promise(r => setTimeout(r, 1000)); 

    try {
        const response = await fetch(`${API_URL}/tours`);
        
        if (!response.ok) {
            throw new Error('Ошибка загрузки данных');
        }

        const tours = await response.json();
        const sortedTours = [...tours].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

        container.className = 'd-flex flex-nowrap gap-4 overflow-auto pb-2';
        container.style.scrollBehavior = 'smooth';
        container.style.webkitOverflowScrolling = 'touch';
        container.innerHTML = '';

        sortedTours.forEach(tour => {
            const isPastTour = new Date(tour.startDate) < new Date();
            const safeTitle = (tour.title || '').replace(/'/g, "\\'");
            const cardHTML = `
                <div class="flex-shrink-0">
                    <div class="card h-100 border-0 shadow-sm tour-card">
                        <a href="tour-details.html?id=${tour.id}" class="position-relative overflow-hidden d-block">
                            ${tour.isHit ? `<span class="badge bg-warning position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill z-2">ХИТ ПРОДАЖ</span>` : ''}
                            <img src="${tour.imageUrl || ''}" class="card-img-top" alt="${tour.title}" style="height: 50vh; object-fit: cover;">
                            <div class="card-overlay"></div>
                            ${!isPastTour ? `<button onclick="event.preventDefault(); openBookingModal(${tour.id}, '${safeTitle}', 'tour')" class="btn btn-warning rounded-pill px-4 btn-sm fw-bold shadow-sm position-absolute start-50 translate-middle-x" style="bottom: 16px;">Записаться</button>` : ''}
                        </a>
                        <div class="card-body p-4 text-center">
                            <h5 class="font-playfair fs-5 mb-2">${tour.title}</h5>
                            <ul class="list-unstyled text-muted small mb-3">
                                <li class="mb-2"><i class="bi bi-calendar3 me-2 text-warning"></i> ${new Date(tour.startDate).toLocaleDateString()}</li>
                                <li class="mb-2"><i class="bi bi-geo-alt me-2 text-warning"></i> ${tour.location || '-'}</li>
                                <li><i class="bi bi-activity me-2 text-warning"></i> ${isPastTour ? 'Тур завершен' : 'Открыта запись'}</li>
                            </ul>
                            <div class="d-flex justify-content-center mt-3">
                                ${isPastTour
                                    ? `<a href="tour-details.html?id=${tour.id}" class="btn btn-outline-dark rounded-pill px-3 btn-sm">Фото/видео</a>`
                                    : ''
                                }
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', cardHTML);
        });

        setupAutoScrollableContainer(container, {
            imageSelector: '.card-img-top',
            cardWidthDesktop: Math.max(320, Math.floor(((container.parentElement ? container.parentElement.clientWidth : window.innerWidth) - 16) / 2)),
            cardWidthMobile: container.parentElement ? container.parentElement.clientWidth : window.innerWidth,
            imageHeightDesktop: Math.round(window.innerHeight * 0.5),
            imageHeightMobile: Math.round(window.innerHeight * 0.42),
            gapPx: 16,
            stepPx: 1,
            tickMs: 24
        });

    } catch (error) {
        console.error('Ошибка:', error);
        container.innerHTML = '<div class="alert alert-danger">Не удалось загрузить туры. Попробуйте позже.</div>';
    }
}

// === ЛОГИКА БРОНИРОВАНИЯ ===

// Внедрение HTML модалки на любую страницу
function injectBookingModal() {
    if (document.getElementById('bookingModal')) return; // Уже есть

    const modalHTML = `
    <!-- 🟢 Скрытое Модальное окно (Bootstrap Modal) -->
    <div class="modal fade" id="bookingModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Бронирование</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="bookingForm">
                        <!-- Скрытые поля ID -->
                        <input type="hidden" id="tourIdInput" name="tourId">
                        <input type="hidden" id="courseIdInput" name="courseId">
                        <input type="hidden" id="consultationIdInput" name="consultationId">
                        
                        <div class="mb-3">
                            <label class="form-label">Ваш выбор</label>
                            <input type="text" class="form-control" id="productTitleInput" readonly disabled>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Имя</label>
                            <input type="text" class="form-control" name="customerName" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-control" name="customerEmail" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Телефон</label>
                            <input type="tel" class="form-control" name="customerPhone" required>
                        </div>
                        <button type="submit" class="btn btn-warning w-100 fw-bold">Отправить заявку</button>
                    </form>
                </div>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Вешаем обработчик, так как форма только что создалась
    document.getElementById('bookingForm').addEventListener('submit', handleBookingSubmit);
}

// 1. Открыть окно
window.openBookingModal = function(id, title, type = 'tour') {
    // Очищаем старые ID
    const tId = document.getElementById('tourIdInput');
    const cId = document.getElementById('courseIdInput');
    const consId = document.getElementById('consultationIdInput');
    if(tId) tId.value = '';
    if(cId) cId.value = '';
    if(consId) consId.value = '';

    // Ставим новый ID в нужное поле
    if (type === 'tour') tId.value = id;
    if (type === 'course') cId.value = id;
    if (type === 'consultation') consId.value = id;

    // Заголовок
    document.getElementById('productTitleInput').value = title;
    
    const userJson = localStorage.getItem('yoga_user');
    if (userJson) {
        try {
            const auth = JSON.parse(userJson);
            const user = auth.user || auth;
            const form = document.getElementById('bookingForm');
            if (form) {
                if (form.customerName && user.fullName) form.customerName.value = user.fullName;
                if (form.customerEmail && user.email) form.customerEmail.value = user.email;
                if (form.customerPhone && user.phoneNumber) form.customerPhone.value = user.phoneNumber;
            }
        } catch (_) { }
    }

    // Показываем окно через Bootstrap JS
    const myModal = new bootstrap.Modal(document.getElementById('bookingModal'));
    myModal.show();
}

// 2. Отправить форму (обработчик)
async function handleBookingSubmit(e) {
    e.preventDefault(); // Не перезагружать страницу
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    if(submitBtn) {
        submitBtn.disabled = true; 
        submitBtn.innerText = 'Отправка...';
    }

    // Собираем данные
    const tourId = form.querySelector('#tourIdInput').value;
    const courseId = form.querySelector('#courseIdInput').value;
    const consId = form.querySelector('#consultationIdInput').value;

    const userJson = localStorage.getItem('yoga_user');
    let userName = '';
    if (userJson) {
        try {
            const authData = JSON.parse(userJson);
            const user = authData.user || authData;
            userName = user.username || user.Username || '';
        } catch (_) {}
    }

    let productType = 'General';
    if (tourId) productType = 'Tour';
    if (courseId) productType = 'Course';
    if (consId) productType = 'Consultation';

    const orderData = {
        userName,
        productTitle: form.querySelector('#productTitleInput').value,
        productType,
        customerName: form.customerName.value,
        customerEmail: form.customerEmail.value,
        customerPhone: form.customerPhone.value,
        comment: "Заявка с сайта"
    };
    
    // Добавляем только нужный ID
    if (tourId) orderData.tourId = Number(tourId);
    if (courseId) orderData.courseId = Number(courseId);
    if (consId) orderData.consultationId = Number(consId);

    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            alert('Спасибо! Ваша заявка принята. Менеджер свяжется с вами.');
            const modalEl = document.getElementById('bookingModal');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();
            form.reset();
        } else {
            const errorText = await response.text();
            alert('Ошибка сервера: ' + errorText);
        }
    } catch (error) {
        console.error(error);
        alert('Ошибка сети! Проверьте, запущен ли сервер.');
    } finally {
        if(submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = 'Отправить заявку';
        }
    }
}
/**
 * Loads the latest 3 photos (from Tours and Articles) into the gallery section.
 * This simulates a "Latest Moments" feed.
 */
async function loadLatestGalleryPhotos() {
    const container = document.getElementById('latest-photos-gallery');
    if (!container) return;

    try {
        const [toursRes, articlesRes] = await Promise.all([
            fetch(`${API_URL}/tours`),
            fetch(`${API_URL}/articles`)
        ]);

        let items = [];

        if (toursRes.ok) {
            const tours = await toursRes.json();
            // Map tours to gallery items
            items.push(...tours.map(t => ({
                title: t.title,
                image: t.imageUrl,
                date: new Date(t.startDate || Date.now()), 
                type: 'Тур',
                link: `tour-details.html?id=${t.id}`
            })));
        }

        if (articlesRes.ok) {
            const articles = await articlesRes.json();
            // Map articles to gallery items
            items.push(...articles.map(a => ({
                title: a.title,
                image: a.imageUrl,
                date: new Date(a.createdAt || Date.now()),
                type: 'Блог',
                link: `article-details.html?id=${a.id}`
            })));
        }

        // Sort by date descending (newest first) and take top 3 valid images
        const galleryItems = items
            .filter(item => item.image && item.image.length > 10) 
            .sort((a, b) => b.date - a.date)
            .slice(0, 3);

        if (galleryItems.length === 0) {
            container.innerHTML = '<p class="text-center text-muted w-100">Скоро здесь появятся фото...</p>';
            return;
        }

        // Render gallery grid
        container.innerHTML = galleryItems.map(item => `
            <div class="col-md-4">
                <a href="${item.link}" class="text-decoration-none">
                    <div class="card border-0 shadow-sm h-100 overflow-hidden gallery-card">
                        <div class="position-relative" style="height: 300px;">
                            <img src="${item.image}" class="w-100 h-100 object-fit-cover transition-transform" alt="${item.title}" style="object-fit: cover;">
                            <div class="position-absolute bottom-0 start-0 w-100 p-3" style="background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);">
                                <span class="badge bg-warning mb-2">${item.type}</span>
                                <h5 class="card-title mb-0 fs-6 text-white text-truncate">${item.title}</h5>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        `).join('');

    } catch (e) {
        console.error('Failed to load gallery:', e);
        container.innerHTML = '<p class="text-center text-danger w-100">Ошибка загрузки галереи.</p>';
    }
}
