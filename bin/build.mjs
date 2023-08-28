import * as esbuild from 'esbuild'
import fs from 'fs'
import chalk from 'chalk'

const outfile = 'app/assets/builds/trix-embed.js'
const metafile = 'app/assets/builds/trix-embed.metafile.json'

const successMessage = `
${chalk.bold.green('ESM build succeeded')}
├── ${chalk.greenBright(outfile)}
└── ${chalk.greenBright(metafile)} analyze at ${chalk.underline('https://esbuild.github.io/analyze/')}
`

const metadata = JSON.parse(await fs.promises.readFile('package.json', 'utf8'))
const { author, description, name, license, repository, version } = metadata
const copyright = `Copyright © ${new Date().getFullYear()} ${author}`
const prefix = `/*
  ${name} ${version} (${license})
  ${copyright}
*/`

function writeMetadataFile() {
  return fs.writeFile(
    'app/javascript/metadata.js',
    `// This file is auto-generated by bin/build.mjs
export default {
  author: '${author}',
  copyright: '${copyright}',
  description: '${description}',
  license: '${license}',
  repository: '${repository}',
  version: '${version}'
}
`,
    e => {
      if (e) console.error('Failed to write metadata file!', e)
    }
  )
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
    minify: false,
    outfile,
    sourcemap: false,
    target: ['chrome79', 'edge44', 'es2020', 'firefox71', 'opera65', 'safari13'],
    write: false
  })
} catch (error) {
  logError(error)
  process.exit(1)
}

try {
  await writeMetadataFile()
  const result = await context.rebuild()
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
