"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "./LanguageProvider";

export default function TypewriterHero() {
  const { t } = useLanguage();
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [done, setDone] = useState(false);

  const lines = t.hero.lines;

  useEffect(() => {
    // Reset on language change
    setDisplayedLines([]);
    setCurrentLine(0);
    setCurrentChar(0);
    setDone(false);
  }, [t]);

  useEffect(() => {
    if (done) return;
    if (currentLine >= lines.length) {
      setDone(true);
      return;
    }

    const line = lines[currentLine];
    if (currentChar < line.length) {
      const timer = setTimeout(() => {
        setDisplayedLines((prev) => {
          const updated = [...prev];
          updated[currentLine] = line.slice(0, currentChar + 1);
          return updated;
        });
        setCurrentChar((c) => c + 1);
      }, 40);
      return () => clearTimeout(timer);
    } else {
      // Move to next line after a brief pause
      const timer = setTimeout(() => {
        setCurrentLine((l) => l + 1);
        setCurrentChar(0);
        setDisplayedLines((prev) => [...prev, ""]);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentLine, currentChar, done, lines]);

  return (
    <div className="font-mono text-sm md:text-base space-y-1 min-h-[160px]">
      {displayedLines.map((line, i) => (
        <div key={i} className="flex items-start">
          <span
            className={`${
              line.startsWith(">")
                ? "text-accent"
                : "text-text-muted"
            }`}
          >
            {line.startsWith("> ") ? (
              <>
                <span className="text-green mr-2">&gt;</span>
                <span className={i === 0 ? "text-accent font-bold text-lg md:text-xl" : "text-text"}>
                  {line.slice(2)}
                </span>
              </>
            ) : (
              line
            )}
          </span>
          {/* Blinking cursor on current line */}
          {i === currentLine && !done && (
            <span className="inline-block w-2.5 h-5 bg-accent ml-0.5 animate-pulse" />
          )}
        </div>
      ))}
      {/* Final cursor blink */}
      {done && (
        <div className="flex items-center">
          <span className="text-green mr-2">&gt;</span>
          <span className="inline-block w-2.5 h-5 bg-accent animate-pulse" />
        </div>
      )}
    </div>
  );
}
