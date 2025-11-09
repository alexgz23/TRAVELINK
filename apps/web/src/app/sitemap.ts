import { MetadataRoute } from 'next';
import { get } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://viajeroconectado.com';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/experiences`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/social`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ];

  // Fetch experiences for dynamic pages
  let experiencePages: MetadataRoute.Sitemap = [];
  try {
    const response = await get<{ data: any[] }>(
      `${API_ENDPOINTS.EXPERIENCES.BASE}?limit=1000`
    );

    experiencePages = response.data.map((experience) => ({
      url: `${baseUrl}/experiences/${experience.id}`,
      lastModified: new Date(experience.updatedAt),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Error fetching experiences for sitemap:', error);
  }

  // Category pages
  const categories = [
    'ADVENTURE',
    'CULTURAL',
    'GASTRONOMIC',
    'NATURE',
    'SPORTS',
    'WELLNESS',
    'URBAN',
    'EDUCATIONAL',
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/experiences?category=${category}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  // City pages
  const cities = ['Bogotá', 'Medellín', 'Cali', 'Cartagena', 'Barranquilla'];

  const cityPages: MetadataRoute.Sitemap = cities.map((city) => ({
    url: `${baseUrl}/experiences?city=${encodeURIComponent(city)}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  return [...staticPages, ...experiencePages, ...categoryPages, ...cityPages];
}
