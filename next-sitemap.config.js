/** @type {import('next-sitemap').IConfig} */

module.exports = {
  siteUrl: "https://www.st-austin.org",
  generateRobotsTxt: true,

  exclude: ["/admin/*"],

  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
  },

  additionalPaths: async () => {
    const locales = ['en', 'fr', 'es'];

    // Static pages
    const staticPaths = [
      "/",
      "/about",
      "/admissions",
      "/apply",
      "/careers",
      "/donations",
      "/government-employees",
      "/portal",
      "/program",
      "/request-info",
      "/studentExperience",
      "/tuition",
    ];

    // For each static path, generate entries for each locale. Default locale ('en') keeps root path.
    const staticPages = staticPaths.flatMap((path) => {
      return locales.map((locale) => {
        const loc = locale === 'en' ? path : `/${locale}${path === '/' ? '' : path}`;
        return {
          loc,
          changefreq: 'weekly',
          priority: 1.0,
          lastmod: new Date().toISOString(),
        };
      });
    });

    try {
      // Dynamic program pages
      const response = await fetch("https://www.st-austin.org/api/courses");

      const result = await response.json();

      const dynamicPrograms =
        result?.ok && Array.isArray(result.data)
          ? result.data.flatMap((program) => {
              return locales.map((locale) => {
                const base = `/program/${program.id}`;
                const loc = locale === 'en' ? base : `/${locale}${base}`;
                return {
                  loc,
                  changefreq: 'weekly',
                  priority: 0.8,
                  lastmod: new Date().toISOString(),
                };
              });
            })
          : [];

      return [...staticPages, ...dynamicPrograms];
    } catch (error) {
      console.error("Sitemap generation failed:", error);

      return staticPages;
    }
  },
};
