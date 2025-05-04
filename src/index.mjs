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
  return function transformFromTo (value) {
    return value.replace(new RegExp(from, 'g'), to).trim()
  }
}

function transform (fileData, from, to) {
  return fileData.split(CR).map(mapTransformFromTo(from, to)).join(CR)
}

async function renderTo (filePath, from, to) {
  info('renderTo')

  try {
    const fileData = await readFile(filePath, 'utf8')
    const hasMatch = fileData.includes(from)

    log(hasMatch)

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

function ignored (filePath = '.', stat) {
  if (filePath && stat) return stat.isFile() && !filePath.endsWith('.m3u8')
  return false
}

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
    chokidar.watch(watch, { awaitWriteFinish: true, ignored })
      .on('add', match)
      .on('change', match)
      .on('error', handleWatchError)
  )
}
