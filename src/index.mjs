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

function * genFrom (from) {
  while (from.length) yield from.shift()
}

async function renderTo (filePath, from, to) {
  info('renderTo')

  try {
    const fileData = await readFile(filePath, 'utf8')
    if (fileData.includes(from)) {
      log(filePath)

      return (
        await writeFile(filePath, fileData.replace(new RegExp(from, 'g'), to), 'utf8')
      )
    }
  } catch ({ message = 'No error message defined' }) {
    error(`Error matching "${filePath}". The message was "${message}"`)
  }
}

function getMatch (from, to) {
  info('getMatch')

  return async function match (filePath) {
    info('match')

    for (const f of genFrom([...from])) await renderTo(filePath, f, to)
  }
}

function handleError ({ message = 'No error message defined' } = {}) {
  error(`Error in watcher: "${message}"`)
}

log('`watch-match` is awake')

/**
 * Assuming that the file system path being watched is a directory,
 * and it contains text files (of whatever file type)
 *
 * Parameter `path` is the file system path to watch. It should be a
 * directory path
 *
 * Parameter `from` are the strings to match (or, since they will be applied to
 * a `RegExp` constructor, the regular expressions expressed as a string)
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
 * @param {string | string[]} from the string/strings to match
 * @param {string} to the string with which to replace the match
 * @returns {chokidar.FSWatcher}
 */
export default function watchMatch (path, from, to) {
  log('watchMatch')

  const watch = normalise(path)
  const match = (
    Array.isArray(from)
      ? getMatch([...from], to) // shallow
      : getMatch([from], to) // enarrayify
  )

  return (
    chokidar.watch(watch)
      .on('add', match)
      .on('change', match)
      .on('error', handleError)
  )
}
