/** @type {import('next-sitemap').IConfig} */

module.exports = {
  siteUrl: 'https://www.st-austin.org',

  generateRobotsTxt: true,

  exclude: ['/admin/*'],

  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },

  additionalPaths: async (config) => {
    try {
      const response = await fetch(
        'https://www.st-austin.org/api/courses'
      )

      const result = await response.json()

      if (!result?.ok || !Array.isArray(result.data)) {
        return []
      }

      return result.data.map((program) => ({
        loc: `/program/${program.id}`,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      }))
    } catch (error) {
      console.error('Sitemap generation failed:', error)
      return []
    }
  },
}