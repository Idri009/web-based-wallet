import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/inject/inject.ts'),
            name: 'inject',
            fileName: () => 'inject.js',
            formats: ['iife'], // Important!
        },
        outDir: 'dist/inject',
        emptyOutDir: false, // Don't wipe entire dist/
        rollupOptions: {
            output: {
                inlineDynamicImports: true, // Required for IIFE format
            }
        }
    }
});
