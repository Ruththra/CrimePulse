# CrimePulse Frontend

This is the frontend for the CrimePulse application, built with React, TypeScript, and Vite.

## Source Map Configuration

To resolve source map errors, we've implemented the following configurations:

1. **Vite Configuration**: Enabled source maps in `vite.config.ts`
2. **Environment Variables**: Added `.env` and `.env.development` files
3. **Build Scripts**: Updated npm scripts to properly handle source maps

## Development

To start the development server with proper source map support:

```bash
npm run dev
```

For debugging with additional information:

```bash
npm run dev:debug
```

## Troubleshooting Source Map Errors

If you encounter source map errors like:
```
Source map error: No sources are declared in this source map.
```

Try these solutions:

1. Clear the Vite cache:
   ```bash
   rm -rf node_modules/.vite
   ```

2. Reinstall dependencies:
   ```bash
   npm install
   ```

3. Check that source maps are enabled in browser dev tools

These errors are typically harmless warnings that don't affect functionality but can impact debugging experience.
