import merge from '@sequencemedia/eslint-config-standard/merge'
import parser from '@babel/eslint-parser'
import globals from 'globals'

export default (
  merge({
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        ...globals.node
      }
    }
  })
)
