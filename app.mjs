#!/usr/bin/env node

import debug from 'debug'

import {
  Command
} from 'commander'

import watchMatch from '#watch-match'

import PACKAGE from './package.json' with { type: 'json' }

const {
  env: {
    DEBUG = '@sequencemedia/watch-match*'
  }
} = process

if (DEBUG) debug.enable(DEBUG)

const log = debug('@sequencemedia/watch-match')

log('`watch-match` is awake')

function app () {
  const {
    name,
    version
  } = PACKAGE

  const {
    pid
  } = process

  log(`Starting application "${name} (${version})" in process ${pid}.`)

  const commander = new Command()

  try {
    const {
      argv
    } = process

    commander
      .version(version)
      .exitOverride()
      .requiredOption('-p, --path [path]', 'Path to watch')
      .requiredOption('-f, --from [froms...]', 'Change `from` value(s)')
      .requiredOption('-t, --to [to]', 'Change `to` value')
      .parse(argv)
  } catch (e) {
    const {
      code
    } = e

    const error = debug('@sequencemedia/watch-match:commander:error')

    if (code !== 'commander.missingMandatoryOptionValue') error(e)

    error(`Halting application "${name} (${version})" in process ${pid}.`)
    return
  }

  const {
    path,
    from,
    to
  } = commander.opts()

  log({
    path,
    from,
    to
  })

  try {
    watchMatch(path, from, to)
  } catch ({ message }) {
    const error = debug('@sequencemedia/watch-match:error')

    error(message)
  }
}

export default app()
