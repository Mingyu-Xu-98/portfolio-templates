"use client";

import Image from "next/image";
import { useLanguage } from "@/components/LanguageProvider";
import ChatBot from "@/components/ChatBot";

export default function Home() {
  const { lang, t, toggle } = useLanguage();

  return (
    <>
      <div className="two-column-layout">
        {/* ===== LEFT SIDEBAR ===== */}
        <aside className="sidebar-panel">
          <div className="sidebar-card">
            {/* Avatar */}
            <div className="relative w-28 h-28 mx-auto mb-5">
              <div className="avatar-glow" />
              <Image
                src="/images/avatar.png"
                alt="徐铭钰"
                width={112}
                height={112}
                className="relative z-10 w-full h-full rounded-full object-cover border-3 border-white/60 shadow-lg"
                unoptimized
              />
            </div>

            {/* Name & Tagline */}
            <h1 className="text-xl font-bold text-text mb-1">
              {lang === "zh" ? "徐铭钰" : "Xu Mingyu"}
            </h1>
            <p className="text-sm text-text-muted mb-5">
              {lang === "zh"
                ? "业务分析师 & AI 应用工程师"
                : "Business Analyst & AI Engineer"}
            </p>
            <p className="text-xs text-text-muted mb-6">
              {lang === "zh"
                ? "上海 · xumingyu2021@163.com"
                : "Shanghai · xumingyu2021@163.com"}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {t.hero.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="ghibli-badge">
                  {tag}
                </span>
              ))}
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-1 mb-6">
              {(
                [
                  ["projects", t.nav.projects],
                  ["timeline", t.nav.timeline],
                  ["skills", t.nav.skills],
                  ["education", t.nav.education],
                ] as const
              ).map(([id, label]) => (
                <a key={id} href={`#${id}`} className="sidebar-nav-link">
                  {label}
                </a>
              ))}
            </nav>

            {/* Contact Icons */}
            <div className="flex justify-center gap-5 mb-5">
              <a
                href="https://github.com/Mingyu-Xu-98"
                target="_blank"
                className="contact-icon"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
              <a
                href="mailto:xumingyu2021@163.com"
                className="contact-icon"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                className="contact-icon"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>

            {/* Language Toggle */}
            <button
              onClick={toggle}
              className="text-xs text-text-muted hover:text-accent transition-colors border border-line rounded-full px-4 py-1.5"
            >
              {lang === "zh" ? "EN" : "中"}
            </button>
          </div>
        </aside>

        {/* ===== RIGHT CONTENT ===== */}
        <main className="content-panel">
          {/* Projects */}
          <section id="projects" className="mb-14">
            <h2 className="section-heading">{t.sections.projects}</h2>
            <div className="grid grid-cols-2 gap-5">
              {t.projects.map((p) => (
                <div key={p.title} className="parchment-card">
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="font-bold text-sm text-text">{p.title}</h3>
                        <p className="text-xs text-text-muted">{p.org}</p>
                      </div>
                      {p.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/15 text-accent font-medium">
                          {p.badge}
                        </span>
                      )}
                      {p.link && (
                        <a
                          href={p.link}
                          target="_blank"
                          className="text-xs text-accent hover:underline"
                        >
                          GitHub &rarr;
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-text-muted mt-2 leading-relaxed line-clamp-3">
                      {p.desc}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {p.tags.map((tag) => (
                        <span key={tag} className="ghibli-badge text-[11px]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Timeline */}
          <section id="timeline" className="mb-14">
            <h2 className="section-heading">{t.sections.timeline}</h2>
            <div className="relative pl-6">
              <div className="timeline-line" />
              <div className="space-y-6">
                {t.timeline.map((item) => (
                  <div key={item.title} className="relative flex gap-4">
                    <div
                      className={`timeline-dot ${
                        item.active ? "timeline-dot-active" : ""
                      }`}
                    />
                    <div className="parchment-card flex-1 p-4">
                      <span className="text-xs font-semibold text-accent">
                        {item.date}
                      </span>
                      <h3 className="font-bold text-sm text-text mt-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-text-muted mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Skills */}
          <section id="skills" className="mb-14">
            <h2 className="section-heading">{t.sections.skills}</h2>
            <div className="grid grid-cols-2 gap-4">
              {t.skills.map((group) => (
                <div key={group.title} className="parchment-card p-4">
                  <h3 className="font-bold text-sm text-text mb-3">
                    {group.title}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {group.skills.map((s) => (
                      <span key={s} className="ghibli-badge">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Education */}
          <section id="education" className="mb-14">
            <h2 className="section-heading">{t.sections.education}</h2>
            <div className="grid grid-cols-2 gap-5">
              {t.education.map((edu) => (
                <div key={edu.school} className="parchment-card p-5">
                  <h3 className="font-bold text-sm text-text">{edu.school}</h3>
                  <p className="text-xs text-text-muted mt-1">{edu.degree}</p>
                  <ul className="mt-3 space-y-1.5">
                    {edu.highlights.map((h) => (
                      <li
                        key={h}
                        className="text-xs text-text-muted flex items-start gap-2"
                      >
                        <span className="text-accent mt-0.5">&#8226;</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="text-center text-xs text-text-muted py-8 border-t border-line">
            {t.footer}
          </footer>
        </main>
      </div>

      <ChatBot />
    </>
  );
}
