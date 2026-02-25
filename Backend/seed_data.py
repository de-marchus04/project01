import requests
import json

BASE_URL = "http://localhost:5253/api"

# Admin credentials
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "adminpassword123"
ADMIN_CREATION_KEY = "YogaAdmin2026!ChangeThis"

def get_admin_token():
    # Try to login first
    login_data = {
        "username": ADMIN_USERNAME,
        "password": ADMIN_PASSWORD
    }
    response = requests.post(f"{BASE_URL}/users/login", json=login_data)
    if response.status_code == 200:
        return response.json().get("token")
    
    # If login fails, purge admins
    purge_data = {
        "adminCreationKey": ADMIN_CREATION_KEY
    }
    requests.post(f"{BASE_URL}/users/purge-admins", json=purge_data)

    # Try to create admin
    create_data = {
        "username": ADMIN_USERNAME,
        "password": ADMIN_PASSWORD,
        "fullName": "System Admin",
        "email": "admin@yoga.life",
        "adminCreationKey": ADMIN_CREATION_KEY
    }
    response = requests.post(f"{BASE_URL}/users/create-admin", json=create_data)
    if response.status_code in [200, 201]:
        # Login again
        response = requests.post(f"{BASE_URL}/users/login", json=login_data)
        if response.status_code == 200:
            return response.json().get("token")
    
    print(f"Failed to get admin token. Create response: {response.status_code} {response.text}")
    return None

courses = [
    {
        "title": "Основы медитации",
        "description": "Погружение в практику осознанности для начинающих. Научитесь управлять стрессом и находить внутренний баланс.",
        "duration": "4 недели",
        "level": "Начинающий",
        "price": 2500,
        "imageUrl": "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
        "title": "Хатха-йога: Базовый курс",
        "description": "Изучение основных асан, правильного дыхания и отстройка тела. Идеально для тех, кто только начинает свой путь в йоге.",
        "duration": "6 недель",
        "level": "Начинающий",
        "price": 3500,
        "imageUrl": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
        "title": "Виньяса Флоу",
        "description": "Динамичная практика, синхронизирующая движение и дыхание. Развивает силу, гибкость и выносливость.",
        "duration": "8 недель",
        "level": "Средний",
        "price": 4500,
        "imageUrl": "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
        "title": "Йога для спины",
        "description": "Специализированный курс для укрепления мышечного корсета, снятия напряжения и улучшения осанки.",
        "duration": "4 недели",
        "level": "Любой",
        "price": 3000,
        "imageUrl": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
        "title": "Кундалини йога",
        "description": "Практика пробуждения внутренней энергии через крии, пранаямы и медитации.",
        "duration": "6 недель",
        "level": "Средний",
        "price": 4000,
        "imageUrl": "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
        "title": "Йога-нидра",
        "description": "Практика глубокого расслабления и работы с подсознанием. Эффективна при бессоннице и стрессе.",
        "duration": "3 недели",
        "level": "Любой",
        "price": 2000,
        "imageUrl": "https://images.unsplash.com/photo-1528319725582-ddc096101511?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
]

consultations = [
    {
        "title": "Индивидуальная практика",
        "description": "Персональное занятие с учетом ваших целей, уровня подготовки и особенностей здоровья.",
        "duration": "60 минут",
        "price": 2000,
        "type": "Практика",
        "imageUrl": "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
        "title": "Разбор питания",
        "description": "Анализ вашего рациона, рекомендации по аюрведическому питанию и составление плана.",
        "duration": "90 минут",
        "price": 3000,
        "type": "Питание",
        "imageUrl": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
        "title": "Йога-терапия",
        "description": "Специализированная консультация для решения конкретных проблем со здоровьем методами йоги.",
        "duration": "90 минут",
        "price": 3500,
        "type": "Терапия",
        "imageUrl": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
        "title": "Психосоматика",
        "description": "Работа с телесными блоками и зажимами через осознанность и дыхательные практики.",
        "duration": "60 минут",
        "price": 2500,
        "type": "Психология",
        "imageUrl": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
]

articles = [
    {
        "title": "Как начать заниматься йогой дома",
        "summary": "Простые советы для тех, кто хочет внедрить практику в свою повседневную жизнь.",
        "content": "Йога дома — это отличный способ начать свой путь к здоровью и гармонии. Главное — регулярность и правильный подход. Начните с 15 минут в день, выберите спокойное место и удобную одежду. Не гонитесь за сложными асанами, слушайте свое тело.",
        "author": "Анна Смирнова",
        "publishedDate": "2023-10-15T00:00:00Z",
        "imageUrl": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
        "title": "Польза медитации для современного человека",
        "summary": "Почему 10 минут тишины в день могут изменить вашу жизнь к лучшему.",
        "content": "В современном мире, полном стресса и информационного шума, медитация становится не просто духовной практикой, а необходимостью. Она помогает снизить уровень тревожности, улучшить концентрацию и обрести внутреннее спокойствие.",
        "author": "Иван Петров",
        "publishedDate": "2023-10-20T00:00:00Z",
        "imageUrl": "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
        "title": "Питание по Аюрведе: основные принципы",
        "summary": "Как древняя наука о жизни помогает сохранить здоровье и молодость.",
        "content": "Аюрведа рассматривает питание как основу здоровья. Главный принцип — есть в соответствии со своей дошей (конституцией тела) и сезоном. Важно употреблять свежую, теплую пищу, богатую специями, которые улучшают пищеварение.",
        "author": "Елена Иванова",
        "publishedDate": "2023-10-25T00:00:00Z",
        "imageUrl": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
        "title": "Дыхательные практики (Пранаяма) для снятия стресса",
        "summary": "Эффективные техники дыхания, которые можно применять где угодно.",
        "content": "Дыхание — это мост между телом и умом. Практики пранаямы, такие как Нади Шодхана (попеременное дыхание) или Уджайи, помогают быстро успокоить нервную систему, снизить частоту сердечных сокращений и вернуть ясность ума.",
        "author": "Мария Соколова",
        "publishedDate": "2023-11-01T00:00:00Z",
        "imageUrl": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
        "title": "Йога для офисных работников",
        "summary": "Комплекс упражнений для снятия напряжения в спине и шее.",
        "content": "Сидячий образ жизни негативно сказывается на здоровье позвоночника. Простые асаны, такие как Марджариасана (поза кошки) или скрутки сидя, помогут снять напряжение, улучшить кровообращение и повысить продуктивность.",
        "author": "Дмитрий Волков",
        "publishedDate": "2023-11-05T00:00:00Z",
        "imageUrl": "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
]

def seed():
    token = get_admin_token()
    if not token:
        print("Cannot proceed without admin token.")
        return

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    print("Seeding courses...")
    for course in courses:
        response = requests.post(f"{BASE_URL}/courses", json=course, headers=headers)
        if response.status_code in [200, 201]:
            print(f"  Added: {course['title']}")
        else:
            print(f"  Failed: {response.status_code} - {response.text}")

    print("\nSeeding consultations...")
    for consultation in consultations:
        response = requests.post(f"{BASE_URL}/consultations", json=consultation, headers=headers)
        if response.status_code in [200, 201]:
            print(f"  Added: {consultation['title']}")
        else:
            print(f"  Failed: {response.status_code} - {response.text}")

    print("\nSeeding articles...")
    for article in articles:
        response = requests.post(f"{BASE_URL}/articles", json=article, headers=headers)
        if response.status_code in [200, 201]:
            print(f"  Added: {article['title']}")
        else:
            print(f"  Failed: {response.status_code} - {response.text}")

if __name__ == "__main__":
    seed()
