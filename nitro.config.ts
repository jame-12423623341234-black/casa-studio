import { defineNitroConfig } from "nitropack/config";

export default defineNitroConfig({
  // Use Railway's PORT environment variable (defaults to 3000 if not set)
  port: parseInt(process.env.PORT || "3000", 10),
  host: "0.0.0.0",
  
  // Cache settings for better performance
  routeRules: {
    "/**": {
      cache: {
        maxAge: 1,
      },
    },
  },
});
