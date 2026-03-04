"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Course } from "@/entities/course/model/types";
import { getConsultationById } from "@/shared/api/consultationApi";
import { usePurchase } from "@/shared/hooks/usePurchase";
import Link from "next/link";
import { useLanguage } from "@/shared/i18n/LanguageContext";
import { formatPrice } from "@/shared/lib/formatPrice";

type Lang = 'ru' | 'en' | 'uk';
type ML = Record<Lang, string>;
const L = (obj: ML, lang: Lang) => obj[lang] || obj.ru;

const CONSULT_INFO: Record<string, {
  benefits: { icon: string; title: ML; desc: ML }[];
  steps: { step: number; title: ML; desc: ML }[];
  note: ML;
  benefitsTitle: ML;
  howItWorksTitle: ML;
}> = {
  private: {
    benefitsTitle: { ru: 'Преимущества', en: 'Benefits', uk: 'Переваги' },
    howItWorksTitle: { ru: 'Как это работает', en: 'How it works', uk: 'Як це працює' },
    benefits: [
      {
        icon: 'bi-person-check',
        title: { ru: 'Персональная программа', en: 'Personal program', uk: 'Персональна програма' },
        desc: { ru: 'Занятие строится под ваши цели, уровень подготовки и особенности тела', en: 'Session built around your goals, fitness level, and physical characteristics', uk: 'Заняття будується навколо ваших цілей, рівня підготовки та особливостей тіла' },
      },
      {
        icon: 'bi-lightning-charge',
        title: { ru: 'Ускоренный прогресс', en: 'Accelerated progress', uk: 'Прискорений прогрес' },
        desc: { ru: 'Индивидуальная работа позволяет быстрее освоить технику и исправить ошибки', en: 'Personalized guidance helps you master technique and correct errors faster', uk: 'Індивідуальна робота дозволяє швидше освоїти техніку та виправити помилки' },
      },
      {
        icon: 'bi-shield-check',
        title: { ru: 'Безопасность движения', en: 'Safe movement', uk: 'Безпека руху' },
        desc: { ru: 'Корректировка техники помогает избежать травм и развить правильные паттерны', en: 'Technique correction helps avoid injuries and develop correct movement patterns', uk: 'Коригування техніки допомагає уникнути травм та розвинути правильні патерни' },
      },
    ],
    steps: [
      {
        step: 1,
        title: { ru: 'Выберите формат', en: 'Choose a format', uk: 'Оберіть формат' },
        desc: { ru: 'Разовое занятие или курс из нескольких сессий с отслеживанием прогресса', en: 'Single session or a multi-session course with progress tracking', uk: 'Разове заняття або курс із кількох сесій з відстеженням прогресу' },
      },
      {
        step: 2,
        title: { ru: 'Проведите занятие', en: 'Attend the session', uk: 'Проведіть заняття' },
        desc: { ru: '60 минут работы с преподавателем: разбор техники, постановка асан, ответы на вопросы', en: '60 minutes with a teacher: technique review, asana alignment, and Q&A', uk: '60 хвилин із викладачем: розбір техніки, постановка асан, відповіді на питання' },
      },
      {
        step: 3,
        title: { ru: 'Получите рекомендации', en: 'Get recommendations', uk: 'Отримайте рекомендації' },
        desc: { ru: 'Домашние задания и индивидуальный план для самостоятельной практики', en: 'Homework and a personal plan for independent practice', uk: 'Домашні завдання та індивідуальний план для самостійної практики' },
      },
    ],
    note: {
      ru: 'Подходит для начинающих и опытных практиков. Рекомендуется при восстановлении после травм.',
      en: 'Suitable for beginners and experienced practitioners. Recommended during injury recovery.',
      uk: 'Підходить для початківців і досвідчених практиків. Рекомендується при відновленні після травм.',
    },
  },
  nutrition: {
    benefitsTitle: { ru: 'Преимущества', en: 'Benefits', uk: 'Переваги' },
    howItWorksTitle: { ru: 'Как это работает', en: 'How it works', uk: 'Як це працює' },
    benefits: [
      {
        icon: 'bi-search',
        title: { ru: 'Анализ через призму аюрведы', en: 'Ayurvedic nutrition analysis', uk: 'Аналіз через призму аюрведи' },
        desc: { ru: 'Ваша доша и конституция определяют индивидуальные потребности в питании', en: 'Your dosha and constitution define your individual nutritional needs', uk: 'Ваша доша та конституція визначають індивідуальні потреби в харчуванні' },
      },
      {
        icon: 'bi-file-earmark-text',
        title: { ru: 'Конкретный план действий', en: 'Concrete action plan', uk: 'Конкретний план дій' },
        desc: { ru: 'Меню, список продуктов и советы по образу жизни в одном документе', en: 'Menu, shopping list and lifestyle advice all in one document', uk: 'Меню, список продуктів і поради зі способу життя в одному документі' },
      },
      {
        icon: 'bi-person-lines-fill',
        title: { ru: 'Поддержка специалиста', en: 'Expert support', uk: 'Підтримка спеціаліста' },
        desc: { ru: 'Ответы на вопросы и корректировка плана после консультации', en: 'Questions answered and plan adjusted after the consultation', uk: 'Відповіді на питання та коригування плану після консультації' },
      },
    ],
    steps: [
      {
        step: 1,
        title: { ru: 'Заполните анкету', en: 'Fill out the questionnaire', uk: 'Заповніть анкету' },
        desc: { ru: 'Расскажите о своём питании, целях и образе жизни перед встречей', en: 'Tell us about your diet, goals and lifestyle before the session', uk: 'Розкажіть про своє харчування, цілі та спосіб життя перед зустріччю' },
      },
      {
        step: 2,
        title: { ru: 'Сессия с нутрициологом', en: 'Session with nutritionist', uk: 'Сесія з нутриціологом' },
        desc: { ru: '90 минут онлайн: анализ рациона, разбор конституции, рекомендации', en: '90 minutes online: diet analysis, constitution review, recommendations', uk: '90 хвилин онлайн: аналіз раціону, розбір конституції, рекомендації' },
      },
      {
        step: 3,
        title: { ru: 'Получите план питания', en: 'Receive a nutrition plan', uk: 'Отримайте план харчування' },
        desc: { ru: 'Персональное меню с рецептами и рекомендациями на 4 недели', en: 'Personal menu with recipes and recommendations for 4 weeks', uk: 'Персональне меню з рецептами та рекомендаціями на 4 тижні' },
      },
    ],
    note: {
      ru: 'Подходит для улучшения самочувствия, нормализации веса и осознанного питания.',
      en: 'Suitable for improving wellbeing, normalizing weight and mindful eating.',
      uk: 'Підходить для покращення самопочуття, нормалізації ваги та усвідомленого харчування.',
    },
  },
  mentorship: {
    benefitsTitle: { ru: 'Преимущества', en: 'Benefits', uk: 'Переваги' },
    howItWorksTitle: { ru: 'Как это работает', en: 'How it works', uk: 'Як це працює' },
    benefits: [
      {
        icon: 'bi-compass',
        title: { ru: 'Ясность направления', en: 'Clear direction', uk: 'Ясність напрямку' },
        desc: { ru: 'Вместе определяем долгосрочные цели и намечаем чёткий путь к ним', en: 'Together we define long-term goals and map a clear path to them', uk: 'Разом визначаємо довгострокові цілі та намічаємо чіткий шлях до них' },
      },
      {
        icon: 'bi-bell',
        title: { ru: 'Постоянная поддержка', en: 'Ongoing support', uk: 'Постійна підтримка' },
        desc: { ru: 'Регулярные встречи и обратная связь между сессиями', en: 'Regular meetings and feedback between sessions', uk: 'Регулярні зустрічі та зворотний зв\'язок між сесіями' },
      },
      {
        icon: 'bi-stars',
        title: { ru: 'Глубокая трансформация', en: 'Deep transformation', uk: 'Глибока трансформація' },
        desc: { ru: 'Работа с ограничивающими убеждениями и устойчивый личностный рост', en: 'Working with limiting beliefs and sustainable personal growth', uk: 'Робота з обмежувальними переконаннями та стійке особистісне зростання' },
      },
    ],
    steps: [
      {
        step: 1,
        title: { ru: 'Вводная встреча', en: 'Introductory meeting', uk: 'Вступна зустріч' },
        desc: { ru: 'Знакомство, постановка целей и разработка плана трансформации', en: 'Introduction, goal setting and transformation plan development', uk: 'Знайомство, постановка цілей та розробка плану трансформації' },
      },
      {
        step: 2,
        title: { ru: 'Регулярные сессии', en: 'Regular sessions', uk: 'Регулярні сесії' },
        desc: { ru: 'Еженедельные встречи с разбором прогресса и адаптацией программы', en: 'Weekly meetings with progress review and program adaptation', uk: 'Щотижневі зустрічі з розбором прогресу та адаптацією програми' },
      },
      {
        step: 3,
        title: { ru: 'Рост и результаты', en: 'Growth and results', uk: 'Зростання та результати' },
        desc: { ru: 'Отслеживание изменений и выход на следующий уровень практики', en: 'Tracking changes and advancing to the next level of practice', uk: 'Відстеження змін і перехід на наступний рівень практики' },
      },
    ],
    note: {
      ru: 'Для тех, кто ищет глубинных изменений и хочет выстроить устойчивую духовную практику.',
      en: 'For those seeking deep change and wanting to build a sustained spiritual practice.',
      uk: 'Для тих, хто шукає глибинних змін і хоче побудувати стійку духовну практику.',
    },
  },
};

export default function CourseDetail() {
  const { t, tData, tStr } = useLanguage() as any;
  const params = useParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourse() {
      try {
        const id = params.id as string;
        const data = await getConsultationById(id);
        if (data) {
          setCourse(data);
        } else {
          setError(t.courseDetail.notFound);
        }
      } catch (err) {
        console.error("Error loading course:", err);
        setError(t.courseDetail.errLoad);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadCourse();
    }

    const handleStorageChange = () => {
      if (params.id) {
        loadCourse();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [params.id]);

  const { buyProduct } = usePurchase();
  const handleBuy = () => {
    if (course) buyProduct(tData ? tData(course).title : course.title, tData ? tData(course).price : course.price);
  };

  if (loading) {
    return (
      <main className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{t.courseDetail.loading}</span>
        </div>
      </main>
    );
  }

  const idStr = (params.id as string) || '';
  const isPrivate = idStr.startsWith('private');
  const isNutrition = idStr.startsWith('nutrition');
  const consultType = isPrivate ? 'private' : isNutrition ? 'nutrition' : 'mentorship';
  const info = CONSULT_INFO[consultType];

  const localized_course = course ? tData(course) : null;
  if (error || !course) {
    const heroImg = isPrivate
      ? 'https://images.unsplash.com/photo-1515020617130-eca80c7d0753?q=80&w=2070&auto=format&fit=crop'
      : isNutrition
      ? 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop'
      : 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop';
    const heroTitle = isPrivate
      ? t.programs.consultPrivateTitle
      : isNutrition
      ? t.programs.consultDietTitle
      : t.programs.consultMentor;
    const heroDesc = isPrivate
      ? t.programs.consultPrivateDesc
      : isNutrition
      ? t.programs.consultDietDesc
      : t.programs.consultMentorDesc;
    const backHref = isPrivate ? '/consultations-private' : isNutrition ? '/consultations-nutrition' : '/consultations-mentorship';
    return (
      <main>
        <section className="hero-section text-white position-relative d-flex align-items-end"
          style={{ height: '55vh', minHeight: '420px', background: `linear-gradient(rgba(62,66,58,0.55),rgba(62,66,58,0.75)),url('${heroImg}') center/cover` }}>
          <div className="container position-relative z-2 pb-5">
            <button onClick={() => router.back()} className="btn btn-outline-light rounded-pill px-4 py-2 mb-4 d-inline-flex align-items-center gap-2">
              <i className="bi bi-arrow-left"></i>{t.courseDetail.back}
            </button>
            <h1 className="display-4 font-playfair mb-3" style={{ textShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>{heroTitle}</h1>
            <p className="lead col-lg-7 fw-light mb-0" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>{heroDesc}</p>
          </div>
        </section>

        {/* BENEFITS */}
        <section className="py-5" style={{ backgroundColor: 'var(--color-bg)' }}>
          <div className="container py-3">
            <h2 className="font-playfair fw-bold text-center mb-5" style={{ color: 'var(--color-text)' }}>{L(info.benefitsTitle, lang as Lang)}</h2>
            <div className="row g-4">
              {info.benefits.map((item, i) => (
                <div key={i} className="col-md-4">
                  <div className="text-center p-4 h-100 rounded-4" style={{ backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)' }}>
                    <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: 72, height: 72, backgroundColor: 'var(--color-primary)' }}>
                      <i className={`bi ${item.icon} text-white`} style={{ fontSize: '1.8rem' }}></i>
                    </div>
                    <h5 className="font-playfair fw-bold mb-2" style={{ color: 'var(--color-text)' }}>{L(item.title, lang as Lang)}</h5>
                    <p className="text-muted small mb-0">{L(item.desc, lang as Lang)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-5" style={{ backgroundColor: 'var(--color-surface)' }}>
          <div className="container py-3">
            <h2 className="font-playfair fw-bold text-center mb-5" style={{ color: 'var(--color-text)' }}>{L(info.howItWorksTitle, lang as Lang)}</h2>
            <div className="row g-4 justify-content-center">
              {info.steps.map((item) => (
                <div key={item.step} className="col-md-4">
                  <div className="d-flex gap-4 align-items-start">
                    <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-bold text-white" style={{ width: 48, height: 48, backgroundColor: 'var(--color-primary)', fontSize: '1.1rem' }}>{item.step}</div>
                    <div>
                      <h5 className="font-playfair fw-bold mb-1" style={{ color: 'var(--color-text)' }}>{L(item.title, lang as Lang)}</h5>
                      <p className="text-muted small mb-0">{L(item.desc, lang as Lang)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 p-4 rounded-4 text-center" style={{ backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)' }}>
              <i className="bi bi-info-circle me-2" style={{ color: 'var(--color-primary)' }}></i>
              <span className="text-muted">{L(info.note, lang as Lang)}</span>
            </div>
          </div>
        </section>

        <section className="py-5" style={{ backgroundColor: 'var(--color-bg)' }}>
          <div className="container py-3 text-center">
            <div className="p-5 rounded-4 d-inline-block" style={{ backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)', maxWidth: 520 }}>
              <i className="bi bi-calendar-check fs-1 mb-4 d-block" style={{ color: 'var(--color-primary)' }}></i>
              <h4 className="font-playfair fw-bold mb-3" style={{ color: 'var(--color-text)' }}>{t.programs.consultTitleNum}</h4>
              <p className="text-muted mb-4">{t.programs.consultDescNum}</p>
              <a href={backHref} className="btn rounded-pill px-5 py-2 fw-semibold me-2 mb-2" style={{ backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none' }}>
                {t.programs.btnConsult}
              </a>
              <button onClick={() => router.back()} className="btn btn-outline-secondary rounded-pill px-4 py-2 mb-2">
                {t.courseDetail.goBack}
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      {/* HERO SECTION */}
      <section
          className="hero-section text-white position-relative"
          style={{
              height: '60vh',
              minHeight: '500px',
              paddingTop: '100px',
              paddingBottom: '40px',
              background: `linear-gradient(rgba(62, 66, 58, 0.6), rgba(62, 66, 58, 0.8)), url('${localized_course.imageUrl}') no-repeat center center/cover`
          }}
        >
            <div className="container position-relative z-2 h-100 d-flex flex-column">
                <div className="pt-2 pt-md-4">
                  <button
                    onClick={() => router.back()}
                    className="btn btn-outline-light rounded-pill px-4 py-2 mb-4 d-inline-flex align-items-center gap-2"
                    style={{ transition: 'all 0.3s ease', backdropFilter: 'blur(5px)' }}
                  >
                    <i className="bi bi-arrow-left"></i>{t.courseDetail.back}
                  </button>
                </div>
                <div className="mt-auto mb-auto">
                  <span className="text-uppercase mb-3 d-block small fw-bold" style={{ letterSpacing: '2px', color: 'var(--color-secondary)' }}>{t.courseDetail.program}</span>
                  <h1 className="display-3 font-playfair mb-4" style={{ textShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>{localized_course.title}</h1>
                  <p className="lead mb-5 col-lg-8 fw-light" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                    {localized_course.description}
                  </p>
                </div>
            </div>
        </section>

      {/* CONTENT SECTION */}
      <section className="py-5" style={{ backgroundColor: 'var(--color-surface)' }}>
          <div className="container py-5">
            <div className="row g-5">
              <div className="col-lg-8">
                <h3 className="font-playfair mb-4" style={{ color: 'var(--color-text)' }}>{t.programs.aboutCourse}</h3>
                  <div className="text-muted mb-4" style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                    {localized_course.fullDescription || `${t.courseDetail.desc1} ${t.courseDetail.desc2} ${t.courseDetail.desc3}`}
                  </div>

                  <h4 className="font-playfair mt-5 mb-4" style={{ color: 'var(--color-text)' }}>{t.programs.whatAwaits}</h4>
                  <ul className="list-unstyled text-muted">
                    {localized_course.features && Array.isArray(localized_course.features) && localized_course.features.length > 0 ? (
                      localized_course.features.map((feat: string, i: number) => (
                        <li key={i} className="mb-3 d-flex align-items-start gap-3">
                          <i className="bi bi-check-circle-fill text-success mt-1"></i>
                          <span>{feat}</span>
                        </li>
                      ))
                    ) : localized_course.features && typeof localized_course.features === 'string' ? (
                      localized_course.features.split('\n').filter((f: string) => f.trim()).map((feat: string, i: number) => (
                        <li key={i} className="mb-3 d-flex align-items-start gap-3">
                          <i className="bi bi-check-circle-fill text-success mt-1"></i>
                          <span>{feat}</span>
                        </li>
                      ))
                    ) : (
                      <>
                        <li className="mb-3 d-flex align-items-start gap-3">
                          <i className="bi bi-check-circle-fill text-success mt-1"></i>
                          <span>{t.courseDetail.feat1}</span>
                        </li>
                        <li className="mb-3 d-flex align-items-start gap-3">
                          <i className="bi bi-check-circle-fill text-success mt-1"></i>
                          <span>{t.courseDetail.feat2}</span>
                        </li>
                        <li className="mb-3 d-flex align-items-start gap-3">
                          <i className="bi bi-check-circle-fill text-success mt-1"></i>
                          <span>{t.courseDetail.feat3}</span>
                        </li>
                        <li className="mb-3 d-flex align-items-start gap-3">
                          <i className="bi bi-check-circle-fill text-success mt-1"></i>
                          <span>{t.courseDetail.feat4}</span>
                        </li>
                      </>
                    )}
                  </ul>
              </div>
              <div className="col-lg-4">
                <div className="card border-0 shadow-sm p-4 sticky-top" style={{ top: '100px', borderRadius: '20px', backgroundColor: 'var(--color-card-bg)' }}>
                  <h4 className="font-playfair mb-4" style={{ color: 'var(--color-text)' }}>{t.programs.programDetails}</h4>
                  <div className="d-flex align-items-center gap-3 mb-3 text-muted">
                    <i className="bi bi-clock fs-5"></i>
                    <div>
                      <small className="d-block text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>{t.courseDetail.durationLabel}</small>
                      <span className="fw-bold" style={{ color: 'var(--color-text)' }}>{t.courseDetail.durationVal}</span>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3 mb-3 text-muted">
                    <i className="bi bi-camera-video fs-5"></i>
                    <div>
                      <small className="d-block text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>{t.courseDetail.formatLabel}</small>
                      <span className="fw-bold" style={{ color: 'var(--color-text)' }}>{t.courseDetail.formatVal}</span>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3 mb-4 text-muted">
                    <i className="bi bi-infinity fs-5"></i>
                    <div>
                      <small className="d-block text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>{t.courseDetail.accessLabel}</small>
                      <span className="fw-bold" style={{ color: 'var(--color-text)' }}>{t.courseDetail.accessVal}</span>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3 mb-4 text-muted">
                    {localized_course.authorPhoto ? (
                      <img src={localized_course.authorPhoto} alt={localized_course.author || t.courseDetail.authorLabel} className="rounded-circle object-fit-cover" style={{ width: '24px', height: '24px' }} />
                    ) : (
                      <i className="bi bi-person fs-5"></i>
                    )}
                    <div>
                      <small className="d-block text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>{t.courseDetail.authorLabel}</small>
                      <span className="fw-bold" style={{ color: 'var(--color-text)' }}>{localized_course.author || t.courseDetail.authorDef}</span>
                    </div>
                  </div>
                  <hr className="my-4" />
                  <div className="text-center">
                    <span className="d-block fs-3 fw-bold mb-3" style={{ color: 'var(--color-text)' }}>{formatPrice(localized_course.price, lang)}</span>
                    <button onClick={handleBuy} className="btn btn-primary-custom w-100 rounded-pill py-3 fw-bold">{t.courseDetail.enroll}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </section>

      {/* BENEFITS & HOW IT WORKS */}
      <section className="py-5" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="container py-3">
          <h2 className="font-playfair fw-bold text-center mb-5" style={{ color: 'var(--color-text)' }}>{L(info.benefitsTitle, lang as Lang)}</h2>
          <div className="row g-4">
            {info.benefits.map((item, i) => (
              <div key={i} className="col-md-4">
                <div className="text-center p-4 h-100 rounded-4" style={{ backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)' }}>
                  <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: 72, height: 72, backgroundColor: 'var(--color-primary)' }}>
                    <i className={`bi ${item.icon} text-white`} style={{ fontSize: '1.8rem' }}></i>
                  </div>
                  <h5 className="font-playfair fw-bold mb-2" style={{ color: 'var(--color-text)' }}>{L(item.title, lang as Lang)}</h5>
                  <p className="text-muted small mb-0">{L(item.desc, lang as Lang)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="container py-3">
          <h2 className="font-playfair fw-bold text-center mb-5" style={{ color: 'var(--color-text)' }}>{L(info.howItWorksTitle, lang as Lang)}</h2>
          <div className="row g-4 justify-content-center">
            {info.steps.map((item) => (
              <div key={item.step} className="col-md-4">
                <div className="d-flex gap-4 align-items-start">
                  <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-bold text-white" style={{ width: 48, height: 48, backgroundColor: 'var(--color-primary)', fontSize: '1.1rem' }}>{item.step}</div>
                  <div>
                    <h5 className="font-playfair fw-bold mb-1" style={{ color: 'var(--color-text)' }}>{L(item.title, lang as Lang)}</h5>
                    <p className="text-muted small mb-0">{L(item.desc, lang as Lang)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 p-4 rounded-4 text-center" style={{ backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)' }}>
            <i className="bi bi-info-circle me-2" style={{ color: 'var(--color-primary)' }}></i>
            <span className="text-muted">{L(info.note, lang as Lang)}</span>
          </div>
        </div>
      </section>
    </main>
  );
}
