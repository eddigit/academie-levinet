import React, { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';

const LANGS = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
];

const COOKIE_NAME = 'googtrans';

function readLang() {
  const match = document.cookie.match(/(?:^|;\s*)googtrans=\/[a-z]{2}\/([a-z]{2})/);
  return match ? match[1] : 'fr';
}

function setLang(lang) {
  const domains = [window.location.hostname, '.' + window.location.hostname.replace(/^www\./, '')];
  if (lang === 'fr') {
    document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    domains.forEach((d) => {
      document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${d}`;
    });
  } else {
    const value = `/fr/${lang}`;
    document.cookie = `${COOKIE_NAME}=${value}; path=/`;
    domains.forEach((d) => {
      document.cookie = `${COOKIE_NAME}=${value}; path=/; domain=${d}`;
    });
  }
  window.location.reload();
}

const LanguageSwitcher = () => {
  const [current, setCurrent] = useState('fr');

  useEffect(() => {
    setCurrent(readLang());
    if (window.__gtInjected) return;
    window.__gtInjected = true;
    window.googleTranslateElementInit = function () {
      // eslint-disable-next-line no-new, no-undef
      new google.translate.TranslateElement(
        {
          pageLanguage: 'fr',
          includedLanguages: 'en,fr',
          autoDisplay: false,
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        'google_translate_element'
      );
    };
    const s = document.createElement('script');
    s.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    s.async = true;
    document.body.appendChild(s);
  }, []);

  return (
    <div className="flex items-center gap-1">
      <div id="google_translate_element" style={{ display: 'none' }} />
      <Globe className="w-4 h-4 text-text-secondary" aria-hidden />
      {LANGS.map((l, i) => (
        <React.Fragment key={l.code}>
          {i > 0 && <span className="text-text-secondary/40 text-xs">|</span>}
          <button
            type="button"
            onClick={() => l.code !== current && setLang(l.code)}
            className={`px-1.5 text-xs lg:text-sm font-oswald uppercase tracking-wider transition-colors ${
              current === l.code
                ? 'text-primary font-bold'
                : 'text-text-secondary hover:text-primary'
            }`}
            aria-label={`Switch to ${l.label}`}
            translate="no"
          >
            {l.label}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
