// vite.config.ts
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ""); // loads .env*, no prefix filter

  // Put your key in one of these:
  // .env.local (not committed): NBA_API_KEY=xxxx
  // or VITE_NBA_API_KEY=xxxx (only needed if accessed in browser code—NOT recommended for secrets)
  const API_KEY = env.NBA_API_KEY || env.VITE_NBA_API_KEY || "";

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/nba": {
          target: "https://v2.nba.api-sports.io",
          changeOrigin: true,
          secure: true, // set false only if you hit TLS issues
          // rewrite /nba/teams -> /teams
          rewrite: (p) => p.replace(/^\/nba/, ""),
          configure: (proxy, options) => {
            proxy.on("proxyReq", (proxyReq, req, res) => {
              // Force-set the header here to guarantee it’s present
              proxyReq.setHeader("x-apisports-key", API_KEY);
              proxyReq.setHeader("accept", "application/json");

              // Debug: confirm key presence (don’t print the key)
              const hasKey = !!proxyReq.getHeader("x-apisports-key");
              console.log(
                "[proxy→apisports]",
                proxyReq.method,
                proxyReq.path,
                "key?",
                hasKey
              );
            });
            proxy.on("proxyRes", (proxyRes, req, res) => {
              console.log(
                "[apisports→proxy]",
                proxyRes.statusCode,
                req.method,
                req.url
              );
            });
            proxy.on("error", (err, req) => {
              console.error("[proxy error]", err?.message, req?.url);
            });
          },
        },
      },
    },
  };
});
