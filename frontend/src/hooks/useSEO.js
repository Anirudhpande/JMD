import { useEffect } from 'react';

/**
 * useSEO — sets document.title, meta description, og:title, og:description,
 * og:image and canonical link dynamically per page.
 *
 * @param {Object} opts
 * @param {string} opts.title        — Page <title> (appended with "| JMD Global Stones")
 * @param {string} opts.description  — Meta description (max ~155 chars)
 * @param {string} [opts.image]      — og:image URL (optional)
 * @param {string} [opts.canonical]  — Canonical URL (optional)
 * @param {Object} [opts.jsonLd]     — JSON-LD structured data object (optional)
 */
export default function useSEO({ title, description, image, canonical, jsonLd } = {}) {
  useEffect(() => {
    const siteName = 'JMD Global Stones';
    const fullTitle = title ? `${title} | ${siteName}` : `${siteName} | Premium Indian Sandstone, Porcelain & Natural Paving UK`;

    // Title
    document.title = fullTitle;

    // Helper to set or create a <meta> tag
    const setMeta = (selector, attr, value) => {
      if (!value) return;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        const [attrName, attrVal] = selector.replace(/[\[\]']/g, '').split('=');
        el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    // Helper to set or create a <link> tag
    const setLink = (rel, href) => {
      if (!href) return;
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    setMeta(`meta[name='description']`, 'content', description);
    setMeta(`meta[name='title']`, 'content', fullTitle);
    setMeta(`meta[property='og:title']`, 'content', fullTitle);
    setMeta(`meta[property='og:description']`, 'content', description);
    setMeta(`meta[property='og:url']`, 'content', canonical || window.location.href);
    if (image) setMeta(`meta[property='og:image']`, 'content', image);
    setMeta(`meta[name='twitter:title']`, 'content', fullTitle);
    setMeta(`meta[name='twitter:description']`, 'content', description);
    if (image) setMeta(`meta[name='twitter:image']`, 'content', image);
    setLink('canonical', canonical || window.location.href);

    // JSON-LD structured data
    if (jsonLd) {
      let el = document.getElementById('page-jsonld');
      if (!el) {
        el = document.createElement('script');
        el.type = 'application/ld+json';
        el.id = 'page-jsonld';
        document.head.appendChild(el);
      }
      el.textContent = JSON.stringify(jsonLd);
    }
  }, [title, description, image, canonical, jsonLd]);
}
