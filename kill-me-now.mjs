#!/usr/bin/env node

import killMeNow from 'kill-me-now'

import debug from '#debug'

import hereIAm from '#where-am-i'

const {
  pid
} = process

const log = debug('@sequencemedia/watch-match:kill-me-now')

log('`watch-match` is awake')

export default killMeNow(hereIAm, pid, 'node')
