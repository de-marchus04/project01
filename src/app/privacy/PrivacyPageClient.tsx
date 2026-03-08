'use client';

const sections = [
  {
    title: 'Збір інформації',
    body: "Ми збираємо лише ту інформацію, яку ви надаєте добровільно при реєстрації або оформленні заявки: ім'я, адресу електронної пошти та контактний номер телефону. Ці дані необхідні для підтвердження замовлення і зв'язку з вами.",
  },
  {
    title: 'Використання даних',
    body: "Отримані персональні дані використовуються виключно для обробки ваших заявок, надсилання підтверджень та інформаційних повідомлень, пов'язаних із вашим навчанням або турами YOGA.LIFE.",
  },
  {
    title: 'Захист інформації',
    body: "Ми вживаємо технічних і організаційних заходів для захисту ваших даних від несанкціонованого доступу. Доступ до персональної інформації мають лише авторизовані співробітники, які пов'язані зобов'язанням конфіденційності.",
  },
  {
    title: 'Передача третім особам',
    body: 'Ми не продаємо, не обмінюємо і не передаємо ваші персональні дані третім особам без вашої згоди, крім випадків, передбачених законодавством України.',
  },
  {
    title: 'Файли Cookie',
    body: 'Наш сайт використовує файли cookie для покращення досвіду користування, аналізу трафіку та персоналізації контенту. Ви можете відключити cookie у налаштуваннях браузера, проте деякі функції сайту можуть стати недоступними.',
  },
  {
    title: 'Зберігання даних',
    body: 'Ваші персональні дані зберігаються протягом усього часу дії вашого акаунту. Після видалення акаунту дані видаляються протягом 30 днів, якщо інше не передбачено законодавством.',
  },
  {
    title: 'Ваші права',
    body: "Ви маєте право запитати доступ до своїх персональних даних, виправити або видалити їх, а також відкликати згоду на обробку в будь-який час. Для цього зверніться до нас через форму зворотного зв'язку.",
  },
];

export default function PrivacyPageClient() {
  return (
    <main style={{ background: 'var(--color-bg)', minHeight: '60vh', paddingTop: '80px' }}>
      <section className="py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8">
              <h1
                className="mb-2 text-center"
                style={{
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--color-primary)',
                  fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                }}
              >
                Політика конфіденційності
              </h1>
              <p className="text-center text-muted mb-5 small">Актуально станом на березень 2026 року</p>

              <div
                className="p-4 p-md-5 rounded-4 mb-4"
                style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)' }}
              >
                <p style={{ color: 'var(--color-text)', lineHeight: 1.8 }}>
                  YOGA.LIFE поважає вашу приватність і зобов&apos;язується захищати персональні дані, які ви нам
                  довіряєте. Ця Політика конфіденційності описує, яку інформацію ми збираємо, як її використовуємо та
                  які заходи вживаємо для її захисту.
                </p>
              </div>

              {sections.map((s, i) => (
                <div
                  key={i}
                  className="mb-4 p-4 rounded-4"
                  style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)' }}
                >
                  <h2 className="h5 mb-3" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
                    {i + 1}. {s.title}
                  </h2>
                  <p className="mb-0" style={{ color: 'var(--color-text)', lineHeight: 1.8 }}>
                    {s.body}
                  </p>
                </div>
              ))}

              <p className="text-muted small text-center mt-4">
                З питань конфіденційності звертайтеся через розділ{' '}
                <a href="/contact" style={{ color: 'var(--color-primary)' }}>
                  Контакти
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
