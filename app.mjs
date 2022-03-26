#!/usr/bin/env node

import debug from 'debug'

import {
  readFile
} from 'fs/promises'

import {
  Command
} from 'commander'

import watchMatch from '#watch-match'

const log = debug('@sequencemedia/watch-match')

log('`watch-match` is awake')

const commander = new Command()

async function app () {
  const PACKAGE = JSON.parse(await readFile('./package.json'))

  const {
    name
  } = PACKAGE

  const {
    pid,
    argv
  } = process

  log(`Starting application "${name}" in process ${pid}.`)

  const {
    version
  } = PACKAGE

  try {
    commander
      .version(version)
      .exitOverride()
      .requiredOption('-f, --from [from]', 'Change from value')
      .requiredOption('-t, --to [to]', 'Change to value')
      .requiredOption('-p, --path [path]', 'Path to watch')
      .parse(argv)
  } catch (e) {
    const {
      code
    } = e

    const error = debug('@sequencemedia/watch-match:commander:error')

    if (code !== 'commander.missingMandatoryOptionValue') error(e)

    error(`Halting application "${name}" in process ${pid}.`)
    return
  }

  const {
    from,
    to,
    path
  } = commander.opts()

  log({
    from,
    to,
    path
  })

  try {
    await watchMatch(from, to, path)
  } catch ({ message }) {
    const error = debug('@sequencemedia/watch-match:error')

    error(message)
  }
}

export default app()
