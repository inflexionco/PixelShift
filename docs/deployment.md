# Deployment Guide

## Required Headers

All deployments **must** send these HTTP headers or ffmpeg.wasm will not work:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

---

## Netlify

Create `netlify.toml` in the project root:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Cross-Origin-Opener-Policy = "same-origin"
    Cross-Origin-Embedder-Policy = "require-corp"
```

---

## GitHub Pages

GitHub Pages does not support custom response headers natively.
Use a `_headers` file (via Cloudflare Pages) or proxy through Cloudflare Workers.

Alternatively, self-host on Netlify/Vercel where header config is trivial.

---

## Vercel

Create `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Opener-Policy",   "value": "same-origin" },
        { "key": "Cross-Origin-Embedder-Policy",  "value": "require-corp" }
      ]
    }
  ]
}
```

---

## Self-Hosted Wasm (Recommended for Full Privacy)

To eliminate the unpkg.com CDN dependency:

1. Copy Wasm files to `public/wasm/`:
   ```bash
   cp node_modules/@ffmpeg/core/dist/esm/* public/wasm/
   ```

2. Update `src/core/ffmpegLoader.ts`:
   ```ts
   const BASE_URL = '/wasm'
   ```

3. Remove the CDN URLs from `public/sw.js` cache list and add `/wasm/*` instead.

This makes the tool fully air-gapped — zero external requests after deployment.
