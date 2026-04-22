# Architecture Decision Record

## ADR-001: Client-Side Only Processing

**Decision:** All image processing happens in the browser via WebAssembly.

**Rationale:** Privacy constraint eliminates any server-side option. ffmpeg.wasm
compiles the full FFmpeg stack (including libwebp) to Wasm, giving us the same
encoding pipeline used in Chromium without any network exposure.

**Consequences:** ~30MB initial Wasm download (cached by Service Worker after
first load). Peak memory = 3× input file size during encode.

---

## ADR-002: Sequential Batch Processing

**Decision:** Files in a batch are processed one at a time, not in parallel.

**Rationale:** Parallel processing would hold all input ArrayBuffers, Wasm FS
copies, and output Uint8Arrays in memory simultaneously:

- Parallel peak: O(Σ|Fᵢ|)
- Sequential peak: O(max|Fᵢ|)

For typical user batches (10–50 images), sequential processing prevents OOM
crashes on mobile devices with constrained heap sizes.

---

## ADR-003: Blob URL Lifecycle Management

**Decision:** Each `ConversionResult` exposes a `cleanup()` function the caller
must invoke to release the Object URL.

**Rationale:** `URL.revokeObjectURL()` must be called explicitly. Delegating this
to the result object keeps the conversion core stateless and lets the UI decide
*when* to revoke (e.g., after download completes vs. on component unmount).

---

## ADR-004: COOP/COEP Headers Required

**Decision:** The Vite dev server and all production deployments must set:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

**Rationale:** `SharedArrayBuffer` (required by ffmpeg.wasm's multi-threaded
Wasm) is only available in cross-origin isolated contexts. Without these headers,
`SharedArrayBuffer` is `undefined` at runtime and ffmpeg.wasm fails silently.
