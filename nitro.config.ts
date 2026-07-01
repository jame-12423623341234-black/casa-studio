export default {
  // Railway should always listen on port 3000 for this app.
  port: 3000,
  host: "0.0.0.0",

  // Cache settings for better performance
  routeRules: {
    "/**": {
      cache: {
        maxAge: 1,
      },
    },
  },
};
