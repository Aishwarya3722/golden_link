import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.vitbhopal.goldenlink",
  appName: "Golden Link",
  webDir: "out",
  server: {
    androidScheme: "https",
  },
  plugins: {
    Camera: {
      // Used by the Medicine module to photograph a pill bottle label
      // before it is sent to the Gemini-based label reader.
      saveToGallery: false,
    },
    Geolocation: {
      // Used by the Emergency module to attach a location to an SOS.
    },
  },
};

export default config;
