export function JsonLd() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://jeffstudio.ir/#website',
        url: 'https://jeffstudio.ir',
        name: 'JEFF studio',
        alternateName: 'جف استودیو',
        description: 'Portfolio of Mostafa Jafari — Architecture, Interior Design, 3D Visualization, Furniture Design & AI Architecture',
        inLanguage: ['en', 'fa'],
        publisher: { '@id': 'https://jeffstudio.ir/#person' },
      },
      {
        '@type': 'Person',
        '@id': 'https://jeffstudio.ir/#person',
        name: 'Mostafa Jafari',
        alternateName: 'مصطفی جعفری',
        url: 'https://jeffstudio.ir',
        jobTitle: 'Architect & 3D Visualization Artist',
        worksFor: {
          '@type': 'Organization',
          name: 'JEFF studio',
          url: 'https://jeffstudio.ir',
        },
        knowsAbout: [
          'Architecture',
          'Interior Design',
          '3D Visualization',
          'Furniture Design',
          'AI Architecture',
          'V-Ray',
          'Corona Renderer',
        ],
        sameAs: [
          'https://www.instagram.com/_mostafa.jafari_',
          'https://www.instagram.com/_jeffstudio_',
          'https://www.pinterest.com/jeffstudiio',
          'https://www.behance.net/mostafajafari313',
          'https://www.linkedin.com/in/-mostafa-jafari-/',
        ],
      },
      {
        '@type': 'LocalBusiness',
        '@id': 'https://jeffstudio.ir/#business',
        name: 'JEFF studio',
        alternateName: 'جف استودیو',
        description: 'Professional architectural design, interior design, 3D rendering, and visualization services by Mostafa Jafari',
        url: 'https://jeffstudio.ir',
        telephone: '+989159026785',
        email: 'mostafa.jafari313@gmail.com',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Mashhad',
          addressCountry: 'IR',
        },
        founder: { '@id': 'https://jeffstudio.ir/#person' },
        areaServed: [
          { '@type': 'Country', name: 'Iran' },
          { '@type': 'Country', name: 'International' },
        ],
        serviceType: [
          'Architectural Design',
          'Interior Design',
          '3D Rendering',
          'Furniture Design',
          'AI Architecture',
          'Architecture Consultation',
        ],
        priceRange: '$$$',
        image: 'https://jeffstudio.ir/uploads/logo.jpg',
      },
      {
        '@type': 'ImageObject',
        '@id': 'https://jeffstudio.ir/#logo',
        url: 'https://jeffstudio.ir/uploads/logo.jpg',
        contentUrl: 'https://jeffstudio.ir/uploads/logo.jpg',
        caption: 'JEFF studio logo',
        owner: { '@id': 'https://jeffstudio.ir/#person' },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
