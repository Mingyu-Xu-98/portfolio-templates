"use client";

import { useLanguage } from "@/components/LanguageProvider";
import ThemeToggle from "@/components/ThemeToggle";
import TypewriterHero from "@/components/TypewriterHero";
import ChatBot from "@/components/ChatBot";
import Image from "next/image";

const SKILL_ICONS = ["sparkles", "chart", "banknote", "palette", "code", "clipboard"];
const SKILL_COLORS = ["text-purple", "text-accent", "text-green", "text-orange", "text-pink", "text-cyan"];

export default function Home() {
  const { lang, t, toggle } = useLanguage();

  return (
    <div className="min-h-screen relative bg-bg text-text">
      {/* Breathing Purple Background Orbs */}
      <div className="breathing-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <div className="relative z-10">
        {/* Glassmorphism Navbar */}
        <nav className="nav-glass sticky top-0 z-50">
          <div className="max-w-[1100px] mx-auto px-6 h-[64px] flex items-center justify-between">
            <span className="font-bold text-lg tracking-tight">
              徐铭钰<span className="logo-dot" />
            </span>
            <div className="hidden md:flex items-center gap-6">
              <a href="#projects" className="nav-link">{t.nav.projects}</a>
              <a href="#timeline" className="nav-link">{t.nav.timeline}</a>
              <a href="#skills" className="nav-link">{t.nav.skills}</a>
              <a href="#education" className="nav-link">{t.nav.education}</a>
              <a href="#contact" className="nav-link">{t.nav.contact}</a>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggle}
                className="text-sm font-medium text-text-muted hover:text-text px-3 py-1.5 rounded-full border border-line hover:border-accent/30 transition-all duration-200"
              >
                {lang === "zh" ? "EN" : "中"}
              </button>
              <ThemeToggle />
              <a
                href="https://github.com/Mingyu-Xu-98"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-text transition-colors duration-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>
        </nav>

        {/* Hero Section: Avatar + Typewriter */}
        <section className="max-w-[1100px] mx-auto px-6 pt-20 pb-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
            {/* Avatar */}
            <div className="avatar-container w-[120px] h-[120px] shrink-0">
              <div className="avatar-glow" />
              <div className="w-[120px] h-[120px] rounded-full overflow-hidden relative z-10 border-2 border-line">
                <Image
                  src="/images/avatar.png"
                  alt="徐铭钰"
                  width={120}
                  height={120}
                  className="w-full h-full object-cover"
                  priority
                  unoptimized
                />
              </div>
            </div>
            {/* Typewriter */}
            <div className="flex-1">
              <TypewriterHero />
              <div className="flex flex-wrap gap-2 mt-6">
                {t.hero.tags.map((tag) => (
                  <span
                    key={tag}
                    className="tag-hover text-xs text-text-muted bg-bg-tag px-3 py-1.5 rounded-full border border-line cursor-default"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Projects: Bento Grid */}
        <section id="projects" className="max-w-[1100px] mx-auto px-6 py-16">
          <h2 className="section-heading">{t.sections.projects}</h2>
          <div className="bento-grid">
            {t.projects.map((p, i) => (
              <div
                key={i}
                className={`glass-card p-5 ${i === 0 ? "bento-wide" : ""}`}
              >
                {/* Card image */}
                <div className="card-image-container mb-4 h-[140px] bg-bg-tag rounded-xl">
                  <Image
                    src={p.image}
                    alt={p.title}
                    width={600}
                    height={300}
                    className="w-full h-full object-cover rounded-xl"
                    unoptimized
                  />
                </div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-base">{p.title}</h3>
                      <p className="text-xs text-text-muted mt-0.5">{p.org}</p>
                    </div>
                    {"badge" in p && p.badge ? (
                      <span className="text-xs bg-green/15 text-green px-2.5 py-0.5 rounded-full font-medium">
                        {p.badge}
                      </span>
                    ) : "link" in p && p.link ? (
                      <a
                        href={p.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-accent font-medium hover:underline"
                      >
                        GitHub →
                      </a>
                    ) : null}
                  </div>
                  <p className="text-sm text-text-muted mb-3 leading-relaxed line-clamp-3">
                    {p.desc}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.tags.map((tag) => (
                      <span key={tag} className="skill-badge text-xs">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section id="timeline" className="max-w-[1100px] mx-auto px-6 py-16">
          <h2 className="section-heading">{t.sections.timeline}</h2>
          <div className="max-w-2xl mx-auto relative pl-8">
            <div className="timeline-line" />
            {t.timeline.map((item, i) => (
              <div key={i} className="relative flex gap-6 mb-10 last:mb-0">
                <div
                  className={`timeline-dot mt-1 ${
                    "active" in item && item.active ? "timeline-dot-active dot-pulse" : ""
                  }`}
                />
                <div className="flex-1 pb-2">
                  <span className="text-sm text-accent font-medium">{item.date}</span>
                  <h3 className="text-base font-semibold mt-1">{item.title}</h3>
                  <p className="text-sm text-text-muted mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills Bento */}
        <section id="skills" className="max-w-[1100px] mx-auto px-6 py-16">
          <h2 className="section-heading">{t.sections.skills}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {t.skills.map((group, i) => (
              <div key={i} className="glass-card p-5">
                <div className="relative z-10">
                  <h3 className={`font-semibold text-sm mb-3 ${SKILL_COLORS[i]}`}>
                    {group.title}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {group.skills.map((s) => (
                      <span key={s} className="skill-badge">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section id="education" className="max-w-[1100px] mx-auto px-6 py-16">
          <h2 className="section-heading">{t.sections.education}</h2>
          <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {t.education.map((edu, i) => (
              <div key={i} className="glass-card p-5">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl ${i === 0 ? "bg-accent/15 text-accent" : "bg-green/15 text-green"} flex items-center justify-center`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{edu.school}</h3>
                      <p className="text-xs text-text-muted">{edu.degree}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {edu.highlights.map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                        <span className="text-sm text-text-muted">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="max-w-[1100px] mx-auto px-6 py-16">
          <h2 className="section-heading">{t.sections.contact}</h2>
          <div className="flex justify-center gap-12 flex-wrap">
            <a href="https://github.com/Mingyu-Xu-98" target="_blank" rel="noopener noreferrer" className="contact-icon">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              <span className="text-sm font-medium">GitHub</span>
            </a>
            <a href="mailto:xumingyu2021@163.com" className="contact-icon">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>
              <span className="text-sm font-medium">Email</span>
            </a>
            <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" className="contact-icon">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              <span className="text-sm font-medium">LinkedIn</span>
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-line">
          <div className="max-w-[1100px] mx-auto px-6 py-8 text-center">
            <p className="text-sm text-text-muted">{t.footer}</p>
          </div>
        </footer>
      </div>

      <ChatBot />
    </div>
  );
}
