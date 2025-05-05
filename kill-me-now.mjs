#!/usr/bin/env node

import debug from 'debug'

import {
  getLsofArray
} from '@sequencemedia/lsof'

import hereIAm from '#where-am-i'

const {
  env: {
    DEBUG = '@sequencemedia/watch-match*'
  }
} = process

if (DEBUG) debug.enable(DEBUG)

const log = debug('@sequencemedia/watch-match')

log('`watch-match` is awake')

function getHasPath (alpha) {
  return function hasPath ({ 'FILE PATH': omega }) {
    return (
      omega.startsWith(alpha)
    )
  }
}

function getHas (path) {
  const hasPath = getHasPath(path)

  return function has (files) {
    return (
      files.some(hasPath)
    )
  }
}

function getReduce (path) {
  const hasPath = getHasPath(path)

  return function reduce (accumulator, files) {
    return (
      files.some(hasPath)
        ? accumulator.concat(files.filter(hasPath))
        : accumulator
    )
  }
}

function filterForCommand ({ COMMAND }) {
  return COMMAND === 'node'
}

function getFilterForProcess (pid) {
  return function filterForProcess ({ PROCESS }) {
    return PROCESS !== pid
  }
}

function forEach ({ PROCESS: pid }) {
  try {
    process.kill(pid)

    log(`Killing application in process ${pid} succeeded.`)
  } catch (e) {
    const {
      code
    } = e

    const error = debug('@sequencemedia/watch-match:error')

    if (code !== 'ESRCH') error(e)

    error(`Killing application in process ${pid} failed.`)
  }
}

async function killMeNow () {
  const array = await getLsofArray()

  if (array.some(getHas(hereIAm))) {
    const {
      pid
    } = process

    const reduce = getReduce(hereIAm)
    const filterForProcess = getFilterForProcess(pid)

    array
      .reduce(reduce, [])
      .filter(filterForCommand)
      .filter(filterForProcess)
      .forEach(forEach)
  }
}

export default killMeNow()
