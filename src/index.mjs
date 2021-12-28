import debug from 'debug'

import chokidar from 'chokidar'

import {
  readFile,
  writeFile
} from 'fs/promises'

import normalise from '#watch-match/normalise'

const log = debug('@sequencemedia/watch-match')
const error = debug('@sequencemedia/watch-match:error')
const info = debug('@sequencemedia/watch-match:info')

const DELAY = (3 * (60 * 1000))

function getMatch (from, to, delay) {
  info('getMatch')

  const pattern = new RegExp(from, 'g')
  const map = new Map()

  return async function match (filePath) {
    info('match')

    try {
      log(`Reading "${filePath}"`)

      const fileData = await readFile(filePath, 'utf8')

      if (fileData.includes(from)) {
        if (map.has(filePath)) {
          log(`Clearing "${filePath}" ...`)

          clearTimeout(map.get(filePath))
        }

        log(`Queueing "${filePath}" ...`)

        map.set(filePath, setTimeout(async function write () {
          info('write')

          try {
            map.delete(filePath)

            log(`Writing "${filePath}"`)

            return (
              await writeFile(filePath, fileData.replace(pattern, to).replace(/\r\n/g, '\n'), 'utf8')
            )
          } catch ({ message }) {
            error(`Error writing "${filePath}". The message was "${message}"`)
          }
        }, delay))
      } else {
        map.delete(filePath)

        log(`... Ignoring "${filePath}"`)
      }
    } catch ({ message }) {
      error(`Error matching "${filePath}". The message was "${message}"`)
    }
  }
}

function handleError ({ message }) {
  error(`Error in watcher: "${message}"`)
}

export default function watchMatch (from, to, path, delay = DELAY) {
  log('watchMatch')

  const match = getMatch(from, to, delay)

  return (
    chokidar.watch(normalise(path))
      .on('add', match)
      .on('change', match)
      .on('error', handleError)
  )
}
