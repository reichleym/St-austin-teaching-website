/** @type {import('next-sitemap').IConfig} */

module.exports = {
  // siteUrl: 'https://www.st-austin.org',
  siteUrl: "http://localhost:3000",

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
    // Static pages
    const staticPages = [
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
    ].map((path) => ({
      loc: path,
      changefreq: "weekly",
      priority: 1.0,
      lastmod: new Date().toISOString(),
    }));

    try {
      // Dynamic program pages
      // const response = await fetch("https://www.st-austin.org/api/courses");

      const response = await fetch("http://localhost:3000/api/courses");

      const result = await response.json();

      const dynamicPrograms =
        result?.ok && Array.isArray(result.data)
          ? result.data.map((program) => ({
              loc: `/program/${program.id}`,
              changefreq: "weekly",
              priority: 0.8,
              lastmod: new Date().toISOString(),
            }))
          : [];

      return [...staticPages, ...dynamicPrograms];
    } catch (error) {
      console.error("Sitemap generation failed:", error);

      return staticPages;
    }
  },
};
