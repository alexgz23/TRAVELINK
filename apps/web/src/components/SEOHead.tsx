import Head from 'next/head';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
}

const defaultMeta = {
  siteName: 'Viajero Conectado',
  defaultTitle: 'Viajero Conectado - Experiencias auténticas en Colombia',
  defaultDescription:
    'Descubre y reserva experiencias auténticas en Colombia. Conecta con viajeros locales y expertos. Tours, aventuras, gastronomía y más.',
  defaultImage: '/images/og-image.jpg',
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://viajeroconectado.com',
  twitterHandle: '@viajeroconectado',
  locale: 'es_CO',
};

export function SEOHead({
  title,
  description = defaultMeta.defaultDescription,
  image = defaultMeta.defaultImage,
  url,
  type = 'website',
  keywords = [],
  author,
  publishedTime,
  modifiedTime,
  noindex = false,
}: SEOHeadProps) {
  const fullTitle = title
    ? `${title} | ${defaultMeta.siteName}`
    : defaultMeta.defaultTitle;
  const fullUrl = url ? `${defaultMeta.baseUrl}${url}` : defaultMeta.baseUrl;
  const fullImage = image.startsWith('http')
    ? image
    : `${defaultMeta.baseUrl}${image}`;

  const defaultKeywords = [
    'experiencias colombia',
    'turismo colombia',
    'tours colombia',
    'viajes colombia',
    'aventuras colombia',
    'guías locales',
  ];

  const allKeywords = [...defaultKeywords, ...keywords].join(', ');

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords} />
      {author && <meta name="author" content={author} />}
      <link rel="canonical" href={fullUrl} />

      {/* Robots */}
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content={defaultMeta.siteName} />
      <meta property="og:locale" content={defaultMeta.locale} />
      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:site" content={defaultMeta.twitterHandle} />
      <meta name="twitter:creator" content={defaultMeta.twitterHandle} />

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="Spanish" />
      <meta name="revisit-after" content="7 days" />

      {/* Favicons */}
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <meta name="theme-color" content="#3B82F6" />

      {/* Structured Data (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': type === 'article' ? 'Article' : 'WebSite',
            name: fullTitle,
            description: description,
            url: fullUrl,
            image: fullImage,
            publisher: {
              '@type': 'Organization',
              name: defaultMeta.siteName,
              logo: {
                '@type': 'ImageObject',
                url: `${defaultMeta.baseUrl}/logo.png`,
              },
            },
            ...(publishedTime && { datePublished: publishedTime }),
            ...(modifiedTime && { dateModified: modifiedTime }),
            ...(author && {
              author: {
                '@type': 'Person',
                name: author,
              },
            }),
          }),
        }}
      />
    </Head>
  );
}

/**
 * Experience Structured Data
 */
export function ExperienceStructuredData({ experience }: { experience: any }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: experience.title,
    description: experience.description,
    image: experience.images,
    offers: {
      '@type': 'Offer',
      price: experience.price,
      priceCurrency: 'COP',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: experience.rating,
      reviewCount: experience.reviewCount,
    },
    category: experience.category,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
