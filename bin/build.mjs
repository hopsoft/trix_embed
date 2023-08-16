import * as esbuild from 'esbuild'
import fs from 'fs'
import chalk from 'chalk'

const watch = process.argv.includes('--watch')
const outfile = 'app/assets/builds/trix-embed.js'
const metafile = 'app/assets/builds/trix-embed.metafile.json'

const successMessage = `
${chalk.bold.green('ESM build succeeded')}
├── ${chalk.greenBright(outfile)}
└── ${chalk.greenBright(metafile)} analyze at ${chalk.underline('https://esbuild.github.io/analyze/')}
`

const metadata = async () => JSON.parse(await fs.promises.readFile('package.json', 'utf8'))

const copyright = async context => {
  const { author, name, license, version } = await metadata()
  return `/*
  ${name} ${version} (${license})
  Copyright © ${new Date().getFullYear()} ${author}
*/`
}

const logError = error =>
  console.error(`\n${chalk.bold.red('ESM build failed')}\n${chalk.redBright(error)}\n`)

let context
try {
  context = await esbuild.context({
    entryPoints: ['app/javascript/index.js'],
    external: [],
    bundle: true,
    format: 'esm',
    logLevel: 'debug',
    metafile: true,
    minify: true,
    outfile,
    sourcemap: false,
    target: ['chrome79', 'edge44', 'es2020', 'firefox71', 'opera65', 'safari13'],
    write: false
  })
} catch (error) {
  logError(error)
  process.exit(1)
}

if (watch) {
  context.logLevel = 'verbose'
  await context.watch()
} else {
  try {
    const result = await context.rebuild()
    const prefix = await copyright()
    let error
    result.outputFiles.forEach(out => fs.writeFile(outfile, `${prefix}\n${out.text}`, e => (error = e)))
    fs.writeFile(metafile, JSON.stringify(result.metafile), e => (error = e))
    error ? logError(error) : console.log(successMessage)
  } catch (error) {
    logError(error)
    process.exit(1)
  } finally {
    context.dispose()
  }
}
