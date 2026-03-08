'use client';

const sections = [
  {
    title: 'Загальні положення',
    body: 'Використовуючи платформу YOGA.LIFE, ви погоджуєтеся з цими Умовами використання. Якщо ви не згодні з будь-яким пунктом, будь ласка, утримайтеся від використання сервісу.'
  },
  {
    title: 'Реєстрація та акаунт',
    body: 'Для доступу до частини сервісів потрібна реєстрація. Ви зобов\'язані надавати достовірну інформацію та зберігати конфіденційність облікових даних. Ви несете відповідальність за всі дії, що здійснюються з вашого акаунту.'
  },
  {
    title: 'Оформлення заявок та оплата',
    body: 'Відправка заявки не є остаточним підтвердженням замовлення. Менеджер зв\'яжеться з вами для уточнення деталей та підтвердження оплати. Ціни можуть бути змінені без попереднього повідомлення.'
  },
  {
    title: 'Скасування та повернення',
    body: 'Умови скасування та повернення коштів обговорюються індивідуально в залежності від типу послуги. Ми прагнемо знайти оптимальне рішення для кожного клієнта.'
  },
  {
    title: 'Інтелектуальна власність',
    body: 'Весь контент платформи — тексти, фотографії, відео, дизайн — є власністю YOGA.LIFE та захищений авторським правом. Копіювання або розповсюдження без письмового дозволу заборонено.'
  },
  {
    title: 'Обмеження відповідальності',
    body: 'YOGA.LIFE не несе відповідальності за непрямі або випадкові збитки, які можуть виникнути внаслідок використання платформи. Ми забезпечуємо безперервність сервісу, однак не гарантуємо його роботу без перебоїв.'
  },
  {
    title: 'Зміни умов',
    body: 'Ми залишаємо за собою право змінювати ці Умови в будь-який час. Продовження використання сервісу після внесення змін свідчить про вашу згоду з оновленими Умовами.'
  }
];

export default function TermsPageClient() {
  return (
    <main style={{ background: 'var(--color-bg)', minHeight: '60vh', paddingTop: '80px' }}>
      <section className="py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8">

              <h1
                className="mb-2 text-center"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)' }}
              >
                Умови використання
              </h1>
              <p className="text-center text-muted mb-5 small">
                Актуально станом на березень 2026 року
              </p>

              <div
                className="p-4 p-md-5 rounded-4 mb-4"
                style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)' }}
              >
                <p style={{ color: 'var(--color-text)', lineHeight: 1.8 }}>
                  Ці Умови використання регулюють відносини між вами та платформою YOGA.LIFE.
                  Будь ласка, уважно ознайомтеся з ними перед використанням сервісу.
                </p>
              </div>

              {sections.map((s, i) => (
                <div
                  key={i}
                  className="mb-4 p-4 rounded-4"
                  style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)' }}
                >
                  <h2
                    className="h5 mb-3"
                    style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}
                  >
                    {i + 1}. {s.title}
                  </h2>
                  <p className="mb-0" style={{ color: 'var(--color-text)', lineHeight: 1.8 }}>
                    {s.body}
                  </p>
                </div>
              ))}

              <p className="text-muted small text-center mt-4">
                З питань щодо Умов звертайтеся через розділ{' '}
                <a href="/contact" style={{ color: 'var(--color-primary)' }}>Контакти</a>.
              </p>

            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
