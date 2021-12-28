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

function getMatch (from, to) {
  info('getMatch')

  const pattern = new RegExp(from, 'g')

  return async function match (filePath) {
    info('match')

    const fileData = await readFile(filePath, 'utf8')

    if (pattern.test(fileData)) {
      log(`Writing "${filePath}"`)

      return (
        await writeFile(filePath, fileData.replace(pattern, to), 'utf8')
      )
    }
  }
}

function handleError ({ message }) {
  error(`Error in watcher: "${message}"`)
}

export default function watchMatch (from, to, path) {
  log('watchMatch')

  const match = getMatch(from, to)

  return (
    chokidar.watch(normalise(path))
      .on('add', match)
      .on('change', match)
      .on('error', handleError)
  )
}
