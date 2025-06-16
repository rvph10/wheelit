/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://wheelit.app",
  generateRobotsTxt: false, // We already have robots.txt
  generateIndexSitemap: false, // (optional) - for smaller sites
  exclude: ["/api/*", "/admin/*"], // pages to exclude

  // Sitemap specific configuration
  changefreq: "daily",
  priority: 0.7,

  // Additional paths
  additionalPaths: async (config) => [
    await config.transform(config, "/"),
    await config.transform(config, "/setup"),
    await config.transform(config, "/spin"),
    await config.transform(config, "/teams"),
  ],

  // Custom transformation for specific routes
  transform: async (config, path) => {
    // Custom priority and changefreq for different pages
    if (path === "/") {
      return {
        loc: path,
        changefreq: "daily",
        priority: 1.0,
        lastmod: new Date().toISOString(),
      };
    }

    if (path.startsWith("/spin") || path.startsWith("/teams")) {
      return {
        loc: path,
        changefreq: "weekly",
        priority: 0.8,
        lastmod: new Date().toISOString(),
      };
    }

    // Default return
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString(),
    };
  },
};
