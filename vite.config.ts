import { cloudflareDevProxyVitePlugin as remixCloudflareDevProxy, vitePlugin as remixVitePlugin } from '@remix-run/dev';
import UnoCSS from 'unocss/vite';
import { defineConfig, type ViteDevServer, loadEnv } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { optimizeCssModules } from 'vite-plugin-optimize-css-modules';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig((config) => {
  // Load app-level env vars to node-level env vars.
  const envLocal = loadEnv(config.mode, process.cwd(), '.env.local');
    // Set each variable only if it is undefined or an empty string
    const processEnv = Object.fromEntries(
      Object.entries(envLocal).map(([key, value]) => [
        key,
        process.env[key] === undefined || process.env[key] === '' ? value : process.env[key],
      ])
    );

  return {
    build: {
      target: 'esnext',
    },
    plugins: [
      nodePolyfills({
        include: ['path', 'buffer'],
      }),
      config.mode !== 'test' && remixCloudflareDevProxy(),
      remixVitePlugin({
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
        },
      }),
      UnoCSS(),
      tsconfigPaths(),
      chrome129IssuePlugin(),
      config.mode === 'production' && optimizeCssModules({ apply: 'build' }),
    ],
    envPrefix:["VITE_"],
    define: {
      'import.meta.env': processEnv, // Forcibly gab from env.local
//      'process.env': processEnv,
//      'import.meta.env.OPENAI_LIKE_API_BASE_URL': JSON.stringify(process.env.OPENAI_LIKE_API_BASE_URL),
//      'import.meta.env.OLLAMA_API_BASE_URL': JSON.stringify(process.env.OLLAMA_API_BASE_URL),
      // Add other non-prefixed variables here as needed
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
  };
});

function chrome129IssuePlugin() {
  return {
    name: 'chrome129IssuePlugin',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        const raw = req.headers['user-agent']?.match(/Chrom(e|ium)\/([0-9]+)\./);

        if (raw) {
          const version = parseInt(raw[2], 10);

          if (version === 129) {
            res.setHeader('content-type', 'text/html');
            res.end(
              '<body><h1>Please use Chrome Canary for testing.</h1><p>Chrome 129 has an issue with JavaScript modules & Vite local development, see <a href="https://github.com/stackblitz/bolt.new/issues/86#issuecomment-2395519258">for more information.</a></p><p><b>Note:</b> This only impacts <u>local development</u>. `pnpm run build` and `pnpm run start` will work fine in this browser.</p></body>',
            );

            return;
          }
        }

        next();
      });
    },
  };
}
