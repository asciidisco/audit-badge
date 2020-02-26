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

function determineColor (prodVulnerabilities, devVulnerabilities, production) {
  if (prodVulnerabilities > 0) return '#FF0000'
  if (!production && devVulnerabilities > 0) return '#FFFF00'
  return '#32CD32'
}

function writeBadgeFile (dest, sumVulnerabilities, cb, quiet, displayFunction, error, svg) {
  if (error) return !quiet ? cb(error, null) : ''
  try {
    !dest ? displayFunction(svg) : fs.writeFileSync(dest, svg)
    return !quiet ? cb(null, {dest, sumVulnerabilities, displayFunction}) : ''
  } catch (fsError) {
    return !quiet ? cb(fsError, null) : ''
  }
}

function reportToTerminal (err, report) {
  const displayFunction = report !== null && report.displayFunction ? report.displayFunction : nout
  if (err) return console.error(err)
  if (report !== null && report.dest) displayFunction(`Found ${report.sumVulnerabilities} vulnerabilities`)
  if (report !== null && report.dest) displayFunction(`Badge SVG written to: ${report.dest}`)
}

function parseArgs (cb) {
  const commandProgram = program
    .command('audit-badge')
    .version(require(path.join('../', 'package.json')).version, '-v, --version')
    .option('-c, --config <location>', 'Set path for package.json to be introspected, uses cwd as default')
    .option('-p, --production', 'Scan for production vulnerabilities only')
    .option('-q, --quiet', 'No reporting output')
    .option('-o, --output <file>', 'Pathname of the output file, will write to stdout if not given')
    .option('-t, --title <title>', 'The title for the badge', 'vulnerabilities')
    .parse(process.argv)
  cb(commandProgram)
}

async function main (program = {}, displayFunction) {
  try {
    displayFunction = displayFunction || nout
    const application = loadPackageInfo(program.config)
    const rawReport = await report({reporter: 'json'})
    const jsonReport = JSON.parse(rawReport.report)
    const depKeys = Object.keys(application.dependencies)
    const devDepKeys = Object.keys(application.devDependencies)
    const vulnerablePackages = [].concat(...jsonReport.actions.map(action => action.resolves.map(item => item.path.split('>')[0])))
    const vulnerabilitiesCounter = (deps, accumulator, item) => deps.includes(item) ? accumulator + 1 : accumulator
    const prodVulnerabilities = vulnerablePackages.reduce(vulnerabilitiesCounter.bind(null, depKeys), 0)
    const devVulnerabilities = vulnerablePackages.reduce(vulnerabilitiesCounter.bind(null, devDepKeys), 0)
    const sumVulnerabilities = program.production ? prodVulnerabilities : prodVulnerabilities + devVulnerabilities
    await badgeUp(program.title || 'vulnerabilities', String(sumVulnerabilities), determineColor(prodVulnerabilities, devVulnerabilities, program.production), writeBadgeFile.bind(null, program.output, sumVulnerabilities, reportToTerminal, program.quiet, displayFunction))
  } catch (error) {
    console.error(error)
  }
}

module.exports = {parseArgs, main}
