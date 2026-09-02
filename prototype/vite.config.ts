import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    // Yerel ağa açık: aynı Wi-Fi'daki başka cihazlar da erişebilir.
    host: true,
    port: 5180,
    strictPort: false,
    // Üretilen e-posta çıktıları izlenmesin — sunum sırasında sayfayı yeniden yüklemesin.
    watch: { ignored: ['**/emails/dist/**'] },
  },
  preview: { host: true, port: 5180 },
});
