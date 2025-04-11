const siteMetadata = {
  title: "Planner",
  author: "Sebastian Smith",
  headerTitle: "Planner",
  description: "An app to manage Kids Schedules and Timetables.",
  language: "en-us",
  theme: "system",
  siteUrl:
    "https://sswecalca.braveriver-7416f6dc.westeurope.azurecontainerapps.io/",
  siteRepo: "https://github.com/horizonmode/calendar/src",
  siteLogo: "/static/logo.png",
  socialBanner: "/static/logo.png",
  github: "https://github.com/horizonmode",
  linkedin: "https://www.linkedin.com/in/sebastian-smith-85775515a/",
  locale: "en-US",
  analytics: {
    umamiAnalytics: {
      umamiWebsiteId: process.env.NEXT_UMAMI_ID, // e.g. 123e4567-e89b-12d3-a456-426614174000
    },
  },
};

module.exports = siteMetadata;
