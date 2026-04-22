# PixelShift

> Privacy-first, client-side WebP converter powered by WebAssembly.

**No uploads. No server. Your images never leave your device.**

## Features

- Converts JPEG, PNG, GIF, TIFF, BMP, AVIF → WebP
- Animated GIF → animated WebP support
- Lossless or quality-controlled lossy encoding (0–100)
- Alpha channel preservation via `yuva420p`
- Offline capable (Service Worker caches Wasm binary)
- Installable PWA on all platforms

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 18 + TypeScript |
| Bundler | Vite 5 |
| Image processing | ffmpeg.wasm (libwebp) |
| Offline | Service Worker |
| Distribution | Static files — deploy anywhere |

## Quick Start

```bash
npm install
npm run dev
```

> **Note:** The dev server sets `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` headers automatically. These are required for `SharedArrayBuffer` (used by ffmpeg.wasm).

## Build & Deploy

```bash
npm run build     # outputs to dist/
npm run preview   # preview production build locally
```

For deployment to GitHub Pages, Netlify, or Vercel add the COOP/COEP headers to your hosting config. See `docs/deployment.md`.

## Architecture

```
Input (File API)
  → ArrayBuffer
  → ffmpeg.wasm virtual FS (in-memory only)
  → libwebp encode
  → Uint8Array
  → Blob → Object URL
  → <a download> trigger
  → URL.revokeObjectURL() cleanup
```

## Privacy Guarantees

| Surface | Mitigation |
|---|---|
| Network | No external requests after Wasm load |
| Wasm FS | Cleaned via `deleteFile()` in `finally` block |
| Blob URLs | Revoked after download via `cleanup()` |
| SW Cache | Caches only Wasm binary, never user images |

## License

MIT
