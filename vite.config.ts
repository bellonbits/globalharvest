import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, loadEnv, type Plugin } from 'vite'

/**
 * Serves the Vercel-style functions in api/ during `npm run dev`, so forms
 * write to the real database locally without needing the Vercel CLI.
 */
function devApi(): Plugin {
  return {
    name: 'global-harvest-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res, next) => {
        const name = (req.url ?? '/').split('?')[0].replace(/^\/+|\/+$/g, '')
        // /api/v1/* is served by the catch-all admin API function.
        const file = name.startsWith('v1/') || name === 'v1'
          ? path.resolve(server.config.root, 'api', 'v1', '[...path].ts')
          : path.resolve(server.config.root, 'api', `${name}.ts`)
        if (!name || name.startsWith('_') || name.includes('..') || !fs.existsSync(file)) return next()
        try {
          const mod = await server.ssrLoadModule(file)
          // Restore the full path the Vercel runtime would see.
          req.url = `/api${req.url}`
          await mod.default(req, res)
        } catch (err) {
          server.config.logger.error(`[api/${name}] ${(err as Error).stack}`)
          if (!res.headersSent) {
            res.statusCode = 500
            res.end(JSON.stringify({ ok: false, message: 'Internal error' }))
          }
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Expose server-only secrets (DATABASE_URL, …) to the dev API without leaking them to the client bundle.
  const env = loadEnv(mode, process.cwd(), '')
  for (const key of ['DATABASE_URL', 'DATABASE_CA_CERT']) if (env[key] && !process.env[key]) process.env[key] = env[key]

  return {
    plugins: [react(), tailwindcss(), devApi()],
    build: {
      target: 'es2022',
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) return 'motion'
              if (id.includes('animejs')) return 'anime'
              if (id.includes('react-router')) return 'router'
              if (id.includes('react')) return 'react'
            }
          },
        },
      },
    },
  }
})
