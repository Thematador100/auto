import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  author?: string;
  jsonLd?: object;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords = 'auto inspection, car inspection, vehicle inspection, pre-purchase inspection, mobile mechanic',
  ogImage = '/og-image.jpg',
  ogType = 'website',
  canonical,
  author = 'Auto Inspection Pro',
  jsonLd
}) => {
  useEffect(() => {
    // Set document title
    document.title = title;

    // Helper function to set or update meta tags
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Set or update link tags
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;

      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // Basic meta tags
    setMetaTag('description', description);
    setMetaTag('keywords', keywords);
    setMetaTag('author', author);

    // Open Graph / Facebook
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:type', ogType, true);
    setMetaTag('og:image', ogImage, true);
    if (canonical) {
      setMetaTag('og:url', canonical, true);
    }

    // Twitter Card
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', ogImage);

    // Additional SEO tags
    setMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setMetaTag('googlebot', 'index, follow');
    setMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=5');

    // Mobile optimization
    setMetaTag('mobile-web-app-capable', 'yes');
    setMetaTag('apple-mobile-web-app-capable', 'yes');
    setMetaTag('apple-mobile-web-app-status-bar-style', 'black-translucent');

    // Canonical URL
    if (canonical) {
      setLinkTag('canonical', canonical);
    }

    // JSON-LD structured data for rich snippets
    if (jsonLd) {
      let scriptElement = document.querySelector('script[type="application/ld+json"]');

      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptElement);
      }
      scriptElement.textContent = JSON.stringify(jsonLd);
    }
  }, [title, description, keywords, ogImage, ogType, canonical, author, jsonLd]);

  return null;
};

export default SEO;
