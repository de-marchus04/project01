"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/shared/i18n/LanguageContext";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";
import { SectionHeader } from "@/shared/ui/SectionHeader/SectionHeader";
import { getTeamMembers } from "@/shared/api/teamApi";
import type { TeamMember } from "@/shared/api/teamApi";

export default function AboutPage() {
  const { t, tStr } = useLanguage();
  const { observe } = useScrollReveal();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    getTeamMembers().then(setTeamMembers).catch(() => {});
  }, []);

  return (
    <main className="min-vh-100 pt-5" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Hero Section */}
      <section className="py-5">
        <div className="container py-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-6 reveal-up" ref={observe as any}>
              <div className="badge text-uppercase px-3 py-2 mb-3 rounded-pill" style={{ backgroundColor: 'rgba(140, 154, 129, 0.1)', color: 'var(--color-primary)', letterSpacing: '1px' }}>
                {t.home.aboutBadge}
              </div>
              <h1 className="display-4 font-playfair fw-bold mb-4" style={{ color: 'var(--color-text)' }}>
                {t.home.aboutTitle.split(" ").slice(0, 3).join(" ")} <br/>{t.home.aboutTitle.split(" ").slice(3).join(" ")}
              </h1>
              <p className="lead mb-4" style={{ color: 'var(--color-text-muted)' }}>
                {t.home.aboutP1}
              </p>
              <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
                {t.home.aboutP2}
              </p>
              <div className="row g-4 mt-2">
                <div className="col-6">
                  <h3 className="display-5 fw-bold mb-0" style={{ color: 'var(--color-primary)' }}>5+</h3>
                  <p className="fw-medium" style={{ color: 'var(--color-text-muted)' }}>{t.home.yearsExp}</p>
                </div>
                <div className="col-6">
                  <h3 className="display-5 fw-bold mb-0" style={{ color: 'var(--color-primary)' }}>10k+</h3>
                  <p className="fw-medium" style={{ color: 'var(--color-text-muted)' }}>{t.home.studentsCount}</p>
                </div>
              </div>
            </div>
            <div className="col-lg-6 reveal-up reveal-delay-1" ref={observe as any}>
              <div className="position-relative">
                <div className="position-absolute top-0 end-0 translate-middle-y rounded-circle" style={{ width: '150px', height: '150px', backgroundColor: 'var(--color-accent)', zIndex: 0, opacity: 0.5 }}></div>
                <div className="position-absolute bottom-0 start-0 translate-middle-x rounded-circle" style={{ width: '100px', height: '100px', backgroundColor: 'var(--color-primary)', zIndex: 0, opacity: 0.2 }}></div>
                <img
                  src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2020&auto=format&fit=crop"
                  alt={tStr("О нас")}
                  className="img-fluid rounded-4 shadow-lg position-relative"
                  style={{ zIndex: 1, objectFit: 'cover', height: '600px', width: '100%' }}
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-5" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="container py-5">
          <SectionHeader
            badge={t.home.aboutBadge}
            title={t.home.valuesTitle}
            subtitle={t.home.valuesSubtitle}
            observe={observe}
          />
          <div className="row g-4">
            {[
              { icon: "bi-heart", title: t.home.val1Title, desc: t.home.val1Desc },
              { icon: "bi-book", title: t.home.val2Title, desc: t.home.val2Desc },
              { icon: "bi-people", title: t.home.val3Title, desc: t.home.val3Desc },
              { icon: "bi-globe", title: t.home.val4Title, desc: t.home.val4Desc }
            ].map((val, i) => (
              <div className={`col-md-6 col-lg-3 reveal-up reveal-delay-${i % 4}`} key={i} ref={observe as any}>
                <div className="card border-0 h-100 text-center p-4 rounded-4" style={{ backgroundColor: 'var(--color-bg)', transition: 'transform 0.3s ease' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4 mx-auto" style={{ width: '80px', height: '80px', backgroundColor: 'rgba(140, 154, 129, 0.1)' }}>
                    <i className={`bi ${val.icon} fs-1`} style={{ color: 'var(--color-primary)' }}></i>
                  </div>
                  <h4 className="h5 fw-bold mb-3" style={{ color: 'var(--color-text)' }}>{val.title}</h4>
                  <p className="mb-0" style={{ color: 'var(--color-text-muted)' }}>{val.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-5">
        <div className="container py-5">
          <SectionHeader
            badge={t.home.aboutBadge}
            title={t.home.teamTitle}
            subtitle={t.home.teamSubtitle}
            observe={observe}
          />
          <div className="row g-4 justify-content-center">
            {(teamMembers.length > 0 ? teamMembers.map((m) => ({ name: m.name, role: m.role, img: m.imageUrl || '' })) : [
              { name: t.home.team1Name, role: t.home.team1Role, img: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop" },
              { name: t.home.team2Name, role: t.home.team2Role, img: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop" },
              { name: t.home.team3Name, role: t.home.team3Role, img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop" }
            ]).map((member, i) => (
              <div className={`col-md-4 reveal-up reveal-delay-${i}`} key={i} ref={observe as any}>
                <div className="card border-0 rounded-4 overflow-hidden shadow-sm h-100">
                  <img src={member.img} alt={member.name} className="card-img-top" style={{ height: '350px', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                  <div className="card-body text-center p-4" style={{ backgroundColor: 'var(--color-surface)' }}>
                    <h4 className="h5 fw-bold mb-1" style={{ color: 'var(--color-text)' }}>{member.name}</h4>
                    <p className="small mb-0" style={{ color: 'var(--color-primary)' }}>{member.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 mb-5 reveal-up" ref={observe as any}>
        <div className="container">
          <div className="card border-0 rounded-4 overflow-hidden shadow-lg" style={{ backgroundColor: 'var(--color-primary)' }}>
            <div className="row g-0">
              <div className="col-lg-8 p-5 d-flex flex-column justify-content-center">
                <h2 className="h2 font-playfair fw-bold text-white mb-3">{tStr("Готовы начать свой путь?")}</h2>
                <p className="lead text-white mb-4" style={{ opacity: 0.9 }}>{tStr("Присоединяйтесь к нашему сообществу и откройте для себя мир гармонии и здоровья.")}</p>
                <div>
                  <Link href="/courses" className="btn btn-light rounded-pill px-5 py-3 fw-bold me-3 mb-3 mb-md-0" style={{ color: 'var(--color-primary)' }}>
                    {t.home.joinBtn}
                  </Link>
                  <Link href="/contact" className="btn btn-outline-light rounded-pill px-5 py-3 fw-bold">{tStr("Связаться с нами")}</Link>
                </div>
              </div>
              <div className="col-lg-4 d-none d-lg-block" style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
