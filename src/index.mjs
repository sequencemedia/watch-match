/**
 *  @typedef {import('chokidar').FSWatcher} FSWatcher
 *  @typedef {import('node:fs').Stats} Stats
 */
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

const DEFAULT_ERROR_MESSAGE = 'No error message defined'
const CR = '\r'
const LF = '\n'

function handleRenderError (filePath, {
  message = DEFAULT_ERROR_MESSAGE
} = {}) {
  error(`Error rendering "${filePath}". The message was "${message}"`)
}

function handleWatchError ({
  message = DEFAULT_ERROR_MESSAGE
} = {}) {
  error(`Error in watcher. The message was "${message}"`)
}

function * genFrom (from) {
  while (from.length) yield from.shift()
}

function mapTransformFromTo (from, to) {
  info('mapTransformFromTo')

  return function transformFromTo (value) {
    info('transformFromTo')

    log(value)

    return value.replace(new RegExp(from, 'g'), to).trim()
  }
}

function transform (fileData, from, to) {
  info('transform')

  return (fileData.includes(CR) ? fileData.split(CR) : fileData.split(LF)).map(mapTransformFromTo(from, to)).join(LF).trim() + LF
}

async function renderTo (filePath, from, to) {
  info('renderTo')

  try {
    const fileData = await readFile(filePath, 'utf8')
    const hasMatch = fileData.includes(from)

    log(from, hasMatch, to)

    if (hasMatch) await writeFile(filePath, transform(fileData, from, to), 'utf8')
  } catch (e) {
    handleRenderError(filePath, e)
  }
}

function getMatch (from, to) {
  info('getMatch')

  return async function match (filePath) {
    info('match')

    const F = [...from].filter(Boolean)

    log(filePath)

    for (const f of genFrom(F)) await renderTo(filePath, f, to)
  }
}

log('`watch-match` is awake')

/**
 *  @param {string} [fileType]
 *  @returns {(filePath?: string, stats?: Stats) => boolean | () => false}
 */
function getIgnored (fileType) {
  if (fileType) {
    const extension = '.' + fileType

    return function ignored (filePath, stats) {
      if (filePath && stats) {
        /**
         *  "when `filePath` DOES NOT end with the extension type we are watching RETURN TRUE"
         */
        return (
          stats.isFile() &&
          !filePath.endsWith(extension)
        )
      }
      return false
    }
  }

  return function ignored () {
    return false
  }
}

/**
 *  The file system path being watched is a directory, and it should contain text
 *  files (of whatever file type)
 *
 *  Parameter `path` is the file system path to watch. It should be a
 *  directory path
 *
 *  Parameter `from` are the strings to match (or, since they will be applied to
 *  a `RegExp` constructor, the regular expressions expressed as a string)
 *
 *  Parameter `to` is the string with which to replace the match
 *
 *  In its simplest form:
 *
 *  ```javascript
 *     fileData.replace(new RegExp(from, 'g'), to)
 *  ```
 *
 *  Where `fileData` is the contents of a file contained in directory `path`
 *
 *  @param {string} path the file system path to watch
 *  @param {string | string[]} from the string/strings to match
 *  @param {string} to the string with which to replace the match
 *  @param {string} [type] the file type to watch
 *  @returns {FSWatcher}
 */
export default function watchMatch (path, from, to, type) {
  log('watchMatch')

  const watch = normalise(path)
  const match = (
    Array.isArray(from)
      ? getMatch([...from], to, type) // shallow
      : getMatch([from], to, type) // enarrayify
  )

  return (
    chokidar.watch(watch, { awaitWriteFinish: true, ignored: getIgnored(type) })
      .on('add', match)
      .on('change', match)
      .on('error', handleWatchError)
  )
}
