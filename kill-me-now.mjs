#!/usr/bin/env node

import debug from 'debug'

import killMeNow from 'kill-me-now'

import hereIAm from '#where-am-i'

const {
  env: {
    DEBUG = '@sequencemedia/watch-match*'
  }
} = process

if (DEBUG) debug.enable(DEBUG)

const {
  pid
} = process

const log = debug('@sequencemedia/watch-match:kill-me-now')

log('`watch-match` is awake')

export default killMeNow(hereIAm, pid, 'node')
