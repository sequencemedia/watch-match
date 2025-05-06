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

export default killMeNow(hereIAm, pid)
