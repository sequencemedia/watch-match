import debug from 'debug'

import chokidar from 'chokidar'

import {
  readFile,
  writeFile
} from 'node:fs/promises'

import normalise from './normalise.mjs'

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

          const timeout = map.get(filePath)

          clearTimeout(timeout)
        }

        log(`Queueing "${filePath}" ...`)

        const timeout = setTimeout(async function write () {
          info('write')

          try {
            log(`Writing "${filePath}"`)

            map.delete(filePath)

            return (
              await writeFile(filePath, fileData.replace(pattern, to), 'utf8')
            )
          } catch ({ message = 'No error message defined' }) {
            error(`Error writing "${filePath}". The message was "${message}"`)
          }
        }, delay)

        map.set(filePath, timeout)
      } else {
        log(`... Ignoring "${filePath}"`)

        map.delete(filePath)
      }
    } catch ({ message = 'No error message defined' }) {
      error(`Error matching "${filePath}". The message was "${message}"`)
    }
  }
}

function handleError ({ message = 'No error message defined' } = {}) {
  error(`Error in watcher: "${message}"`)
}

/**
 * Assuming that the file system path being watched is a directory,
 * and it contains text files (of whatever file type)
 *
 * Parameter `path` is the file system path to watch. It should be a
 * directory path
 *
 * Parameter `from` is the string to match (or, since it will be applied to
 * a `RegExp` constructor, a regular expression expressed as a string)
 *
 * Parameter `to` is the string with which to replace the match
 *
 * In its simplest form:
 *
 *    fileData.replace(new RegExp(from, 'g'), to)
 *
 * Where `fileData` is the contents of a file contained in directory `path`
 *
 * @param {string} path the file system path to watch
 * @param {string} from the string to match
 * @param {string} to the string with which to replace the match
 * @param {number} delay a millisecond timeout for the file system write
 * @returns {chokidar.FSWatcher}
 */
export default function watchMatch (from, to, path, delay = DELAY) {
  log('watchMatch')

  const watch = normalise(path)
  const match = getMatch(from, to, delay)

  return (
    chokidar.watch(watch)
      .on('add', match)
      .on('change', match)
      .on('error', handleError)
  )
}
