export default {
  // Read PORT from Railway environment variable, fallback to 3000 locally
  port: parseInt("3000", 10),
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
