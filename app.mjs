#!/usr/bin/env node

import 'dotenv/config'

import debug from 'debug'

import {
  readFile
} from 'fs/promises'

import psList from 'ps-list'

import commander from 'commander'

import watchMatch from '#watch-match'

const log = debug('@sequencemedia/watch-match')

log('`watch-match` is awake')

const NAME = 'wm.App'
process.title = NAME

async function app () {
  const PACKAGE = JSON.parse(await readFile('./package.json'))

  const {
    name
  } = PACKAGE

  /**
   *  Permit only one instance of the application
   */
  try {
    const a = (await psList())
      .filter(({ name }) => name === NAME)

    if (a.length > 1) {
      const {
        pid: PID
      } = process

      const {
        pid
      } = a.find(({ pid }) => pid !== PID)

      const log = debug('@sequencemedia/watch-match:process')

      log(`Killing application "${name}" in process ${pid}.`)

      process.kill(pid)
    }
  } catch ({ message }) {
    const error = debug('@sequencemedia/watch-match:process:error')

    error(message)
    return
  }

  const {
    pid,
    argv,
    env: {
      FROM,
      TO,
      PATH
    }
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
    from = FROM,
    to = TO,
    path = PATH
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
