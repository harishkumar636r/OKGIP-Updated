// Bundles server.ts into dist/server.cjs using esbuild's Node API.
//
// Why not just use the esbuild CLI with --define directly in package.json?
// Because the value passed to --define needs to end up as the JS string
// literal "production" (with quotes) inside the bundle. Getting quotes
// through an npm script string is shell-dependent: Windows cmd.exe and
// Linux sh (used by Render's build step) escape backslash-quote sequences
// differently, so a script that works on one breaks silently on the other.
// Calling esbuild's API here instead passes the define value as a real JS
// value, no shell involved, so it's consistent everywhere.
import { build } from 'esbuild';

await build({
  entryPoints: ['server.ts'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  packages: 'external',
  sourcemap: true,
  outfile: 'dist/server.cjs',
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
});

console.log('✅ Server bundle built: dist/server.cjs');