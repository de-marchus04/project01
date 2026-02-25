import os

empty_files = [
    "blog-about-classes.html",
    "blog-healthy-lifestyle.html",
    "blog-nutrition-interesting.html",
    "blog-techniques.html",
    "blog-useful.html",
    "consultations-body.html",
    "consultations-booking.html",
    "consultations-media.html"
]

template = """<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | YOGA.LIFE</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
</head>
<body>
    <nav class="navbar fixed-top bg-white shadow-sm">
        <div class="container">
            <a class="navbar-brand" href="index.html">YOGA.LIFE</a>
            <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto w-100 justify-content-lg-end align-items-lg-center gap-lg-4 mt-3 mt-lg-0 pe-lg-1"> 
                    <li class="nav-item"><a class="nav-link" href="tours.html">Туры</a></li>
                    <li class="nav-item"><a class="nav-link" href="courses-beginners.html">Курсы</a></li>
                    <li class="nav-item"><a class="nav-link" href="consultations-private.html">Консультации</a></li>
                    <li class="nav-item"><a class="nav-link" href="blog-articles.html">Блог</a></li>
                    <li class="nav-item"><a class="nav-link" href="about.html">О нас</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <section class="py-5 mt-5 bg-light min-vh-100">
        <div class="container py-5 text-center">
            <h1 class="font-playfair mb-4">{title}</h1>
            <p class="lead text-muted mb-5">Раздел находится в стадии наполнения. Скоро здесь появится много полезной информации!</p>
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <div class="card border-0 shadow-sm p-4">
                        <i class="bi bi-tools display-1 text-warning mb-3"></i>
                        <h3>Мы работаем над контентом</h3>
                        <p>Возвращайтесь позже, чтобы узнать больше о разделе "{title}".</p>
                        <a href="index.html" class="btn btn-outline-dark mt-3">Вернуться на главную</a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <footer class="bg-dark text-white py-4 text-center">
        <div class="container">
            <small class="text-white-50">&copy; 2026 - YOGA.LIFE</small>
        </div>
    </footer>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="js/main.js"></script>
</body>
</html>"""

titles = {
    "blog-about-classes.html": "О занятиях",
    "blog-healthy-lifestyle.html": "Здоровый образ жизни",
    "blog-nutrition-interesting.html": "Питание и интересное",
    "blog-techniques.html": "Техники",
    "blog-useful.html": "Полезное / интересное",
    "consultations-body.html": "Консультации: тело",
    "consultations-booking.html": "Запись на консультацию",
    "consultations-media.html": "Медиа материалы"
}

for file in empty_files:
    path = f"/home/dmitrij/Freelance_Projects/YogaPlatform/Frontend/{file}"
    if os.path.exists(path):
        with open(path, "w") as f:
            f.write(template.format(title=titles.get(file, "Раздел")))
        print(f"Filled {file}")

