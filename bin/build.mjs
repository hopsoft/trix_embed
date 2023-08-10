import * as esbuild from 'esbuild'
import fs from 'fs'

const context = await esbuild.context({
  entryPoints: ['src/index.js'],
  external: [],
  bundle: true,
  format: 'esm',
  logLevel: 'debug',
  metafile: true,
  minify: true,
  outfile: 'dist/trix-embed.js',
  sourcemap: false,
  target: ['chrome79', 'edge44', 'es2020', 'firefox71', 'opera65', 'safari13']
})

const watch = process.argv.includes('--watch')

if (watch) {
  context.logLevel = 'verbose'
  await context.watch()
} else {
  const result = await context.rebuild()
  const metafile = 'dist/trix-embed.metafile.json'

  fs.writeFile(metafile, JSON.stringify(result.metafile), ex => {
    if (ex) {
      console.error('Build failed!❗️')
      conosle.error(ex)
    } else {
      const message = [
        'Build succeeded! 🚀',
        `|- Metafile saved to ... → ${metafile}`,
        '|- Analyze the bundle at → https://esbuild.github.io/analyze/'
      ]
      console.log(message.join('\n'))
    }
    context.dispose()
  })
}
