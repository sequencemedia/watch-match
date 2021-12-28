import {
  homedir
} from 'os'

import {
  resolve
} from 'path'

const normalise = (p) => resolve(p.trim().replace(/^~/, homedir()))

export default normalise
