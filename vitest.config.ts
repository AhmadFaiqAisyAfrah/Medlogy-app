import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./_tests_/unit/setup.ts'],
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
} as any)
