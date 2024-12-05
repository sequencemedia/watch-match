import merge from '@sequencemedia/eslint-config-standard/merge'
import globals from 'globals'

export default (
  merge({
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  })
)
