import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 5180,
    strictPort: false,
    // Üretilen e-posta çıktıları izlenmesin — sunum sırasında sayfayı yeniden yüklemesin.
    watch: { ignored: ['**/emails/dist/**'] },
  },
  preview: { port: 5180 },
});
