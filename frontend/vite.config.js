import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Set this to true only when you need to use FFmpeg features that require SharedArrayBuffer
const enableFFmpegMode = false;

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util', '@ffmpeg/core']
  },
  server: {
    headers: enableFFmpegMode ? {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    } : {}
  },
});