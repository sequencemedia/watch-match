#!/usr/bin/env node

import 'dotenv/config'

import debug from 'debug'

import {
  readFile
} from 'fs/promises'

import psList from 'ps-list'

import commander from 'commander'

import watchMatch from '#watch-match'

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

      const log = debug('@sequencemedia/watch-match:process:log')

      log(`Killing application "${name}" in process ${pid}.`)

      process.kill(pid)
    }
  } catch ({ message }) {
    const error = debug('@sequencemedia/watch-match:process:error')

    error(message)
    return
  }

  const log = debug('@sequencemedia/watch-match')
  const info = debug('@sequencemedia/watch-match:info')

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

  commander
    .version(version)
    .option('-f, --from [from]', 'Change from value')
    .option('-t, --to [to]', 'Change to value')
    .option('-p, --path [path]', 'Path to watch')
    .parse(argv)

  const {
    from = FROM,
    to = TO,
    path = PATH
  } = commander.opts()

  if (from && to && path) {
    log(`Application "${name}" in process ${pid} watching "${path}"`)

    info({ from, to, path })

    return (
      watchMatch(from, to, path)
    )
  }
}

export default app()
