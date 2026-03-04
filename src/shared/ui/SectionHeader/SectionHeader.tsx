"use client";

interface SectionHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
  observe?: (el: Element | null) => void;
}

export function SectionHeader({ badge, title, subtitle, observe }: SectionHeaderProps) {
  return (
    <div
      className="text-center mb-5 reveal-up"
      ref={observe as any}
    >
      <svg
        width="60"
        height="24"
        viewBox="0 0 60 24"
        fill="none"
        aria-hidden="true"
        style={{ display: 'block', margin: '0 auto 16px', opacity: 0.45 }}
      >
        <path d="M2,12 Q15,2 30,12 Q45,22 58,12" stroke="var(--color-primary)" strokeWidth="1.5" fill="none" />
        <path d="M10,12 Q18,5 22,12" stroke="var(--color-primary)" strokeWidth="1" fill="none" opacity="0.6" />
        <path d="M38,12 Q42,5 50,12" stroke="var(--color-primary)" strokeWidth="1" fill="none" opacity="0.6" />
      </svg>
      {badge && <span className="section-badge">{badge}</span>}
      <h2 className="font-playfair display-5 fw-bold mt-4 mb-3">{title}</h2>
      {subtitle && (
        <p className="text-muted font-montserrat mx-auto" style={{ maxWidth: '600px' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
