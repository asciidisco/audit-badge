const fs = require('fs')
const path = require('path')
const program = require('commander')
const badgeUp = require('badge-up')
const report = require('npm-auditor')

const nout = function (chunk, cb) {
  return process.stdout.write(chunk, 'utf8', cb)
}

function loadPackageInfo (location = null) {
  if (!location) return require(path.join(process.cwd(), 'package.json'))
  return require(path.join(location.replace('package.json', ''), 'package.json'))
}

function determineColor (prodVulnarabilities, devVulnarabilities, production) {
  if (prodVulnarabilities > 0) return '#FF0000'
  if (!production && devVulnarabilities > 0) return '#FFFF00'
  return '#32CD32'
}

function writeBadgeFile (dest, sumVulnarabilities, cb, quiet, displayFunction, error, svg) {
  if (error) return !quiet ? cb(error, null) : ''
  try {
    !dest ? displayFunction(svg) : fs.writeFileSync(dest, svg)
    return !quiet ? cb(null, {dest, sumVulnarabilities, displayFunction}) : ''
  } catch (fsError) {
    return !quiet ? cb(fsError, null) : ''
  }
}

function reportToTerminal (err, report) {
  const displayFunction = report !== null && report.displayFunction ? report.displayFunction : nout
  if (err) return console.error(err)
  if (report !== null && report.dest) displayFunction(`Found ${report.sumVulnarabilities} vulnarabilities`)
  if (report !== null && report.dest) displayFunction(`Badge SVG written to: ${report.dest}`)
}

function parseArgs (cb) {
  program
    .command('audit-badge')
    .version(require(path.join('../', 'package.json')).version, '-v, --version')
    .option('-c, --config <location>', 'Set path for package.json to be introspected, uses cwd as default')
    .option('-p, --production', 'Scan for production vulnarabilities only')
    .option('-q, --quiet', 'No reporting output')
    .option('-o, --output <file>', 'Pathname of the output file, will write to stdout if not given')
    .parse(process.argv)
  cb(program)
}

async function main (program = {}, displayFunction) {
  displayFunction = displayFunction || nout
  const application = loadPackageInfo(program.config)
  const rawReport = await report({reporter: 'json'})
  const jsonReport = JSON.parse(rawReport.report)
  const depKeys = Object.keys(application.dependencies)
  const devDepKeys = Object.keys(application.devDependencies)
  const vulnarablePackages = [].concat(...jsonReport.actions.map(action => action.resolves.map(item => item.path.split('>')[0])))
  const vulnarabilitiesCounter = (deps, accumulator, item) => deps.includes(item) ? accumulator + 1 : accumulator
  const prodVulnarabilities = vulnarablePackages.reduce(vulnarabilitiesCounter.bind(null, depKeys), 0)
  const devVulnarabilities = vulnarablePackages.reduce(vulnarabilitiesCounter.bind(null, devDepKeys), 0)
  const sumVulnarabilities = program.production ? prodVulnarabilities : prodVulnarabilities + devVulnarabilities
  badgeUp('vulnarabilities', String(sumVulnarabilities), determineColor(prodVulnarabilities, devVulnarabilities, program.production), writeBadgeFile.bind(null, program.output, sumVulnarabilities, reportToTerminal, program.quiet, displayFunction))
}

module.exports = {parseArgs, main}
