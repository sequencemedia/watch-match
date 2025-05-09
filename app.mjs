#!/usr/bin/env node

import {
  Command
} from 'commander'

import debug from '#debug'

import watchMatch from '#watch-match'

import PACKAGE from './package.json' with { type: 'json' }

const log = debug('@sequencemedia/watch-match')

log('`watch-match` is awake')

async function app () {
  const {
    pid
  } = process

  const {
    name,
    version
  } = PACKAGE

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
      .option('--type [type]', 'File type to watch')
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
    to,
    type
  } = commander.opts()

  log({
    path,
    from,
    to,
    type
  })

  try {
    watchMatch(path, from, to, type)
  } catch ({ message }) {
    const error = debug('@sequencemedia/watch-match:error')

    error(message)
  }
}

export default app()
