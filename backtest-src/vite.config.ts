import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// The build is one self-contained dist/backtester.html (scripts, styles and data inlined)
// that opens with a double-click: no server, no internet needed for the app itself.
function renameHtml(name: string): Plugin {
  return {
    name: 'rename-html',
    enforce: 'post',
    generateBundle(_, bundle) {
      const html = bundle['app/index.html']
      if (html) {
        html.fileName = name
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), viteSingleFile(), renameHtml('backtester.html')],
  base: './',
  build: {
    outDir: 'dist',
    // The app lives in app/; the root index.html is the static landing page and isn't built
    rollupOptions: { input: 'app/index.html' },
    chunkSizeWarningLimit: 30000,
  },
  server: {
    port: 5173,
    // The built file opened from disk (origin "null") uses these forwarders when the dev server is running
    // (src/data/proxy.ts), so it needs no relay. Any page opened from disk can then read this dev server.
    cors: { origin: [/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/, 'null'] },
    // Forwarders so the app can reach Yahoo and Composer, which block requests made from web pages.
    // The dev app at /app/ asks for ./yahoo/... (/app/yahoo/...); the built file asks for /yahoo/...
    proxy: {
      '^(/app)?/yahoo/(query1|query2)/': {
        target: 'https://query1.finance.yahoo.com',
        changeOrigin: true,
        router: req => `https://${req.url?.match(/\/yahoo\/(query[12])\//)?.[1] ?? 'query1'}.finance.yahoo.com`,
        rewrite: path => path.replace(/^(\/app)?\/yahoo\/query[12]/, ''),
        headers: { 'User-Agent': 'Mozilla/5.0' },
      },
      '^(/app)?/composer/': {
        target: 'https://api.composer.trade',
        changeOrigin: true,
        rewrite: path => path.replace(/^(\/app)?\/composer/, ''),
      },
      // Composer's public symphony page, which carries the last edit date (out of sample)
      '^(/app)?/composer-public/': {
        target: 'https://backtest-api.composer.trade',
        changeOrigin: true,
        rewrite: path => path.replace(/^(\/app)?\/composer-public/, ''),
      },
    },
  },
})
