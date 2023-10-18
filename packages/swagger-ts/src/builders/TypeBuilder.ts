/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { combineCodes, nameSorter } from '@kubb/core'
import { createImportDeclaration, print } from '@kubb/parser'
import { ImportsGenerator, OasBuilder } from '@kubb/swagger'

import { TypeGenerator } from '../generators/TypeGenerator.ts'

import type { PluginContext } from '@kubb/core'
import type { FileResolver, Refs } from '@kubb/swagger'
import type ts from 'typescript'

type Generated = { import: { refs: Refs; name: string }; sources: ts.Node[] }
type Options = {
  resolveName: PluginContext['resolveName']
  fileResolver?: FileResolver
  withJSDocs?: boolean
  withImports?: boolean
  enumType: 'enum' | 'asConst' | 'asPascalConst'
  dateType: 'string' | 'date'
  optionalType: 'questionToken' | 'undefined' | 'questionTokenAndUndefined'
}

// TODO create another function that sort based on the refs(first the ones without refs)
function refsSorter(a: Generated, b: Generated) {
  if (Object.keys(a.import.refs)?.length < Object.keys(b.import.refs)?.length) {
    return -1
  }
  if (Object.keys(a.import.refs)?.length > Object.keys(b.import.refs)?.length) {
    return 1
  }
  return 0
}

export class TypeBuilder extends OasBuilder<Options, never> {
  configure(options?: Options) {
    if (options) {
      this.options = options
    }

    if (this.options.fileResolver) {
      this.options.withImports = true
    }

    return this
  }

  print(name?: string): string {
    const codes: string[] = []

    const generated = this.items
      .filter((operationSchema) => (name ? operationSchema.name === name : true))
      .sort(nameSorter)
      .map((operationSchema) => {
        const generator = new TypeGenerator({
          withJSDocs: this.options.withJSDocs,
          resolveName: this.options.resolveName,
          enumType: this.options.enumType,
          dateType: this.options.dateType,
          optionalType: this.options.optionalType,
        })
        const sources = generator.build({
          schema: operationSchema.schema,
          baseName: operationSchema.name,
          description: operationSchema.description,
          keysToOmit: operationSchema.keysToOmit,
        })

        return {
          import: {
            refs: generator.refs,
            name: operationSchema.name,
          },
          sources,
        }
      })
      .sort(refsSorter)

    generated.forEach((item) => {
      codes.push(print(item.sources))
    })

    if (this.options.withImports) {
      const importsGenerator = new ImportsGenerator({ fileResolver: this.options.fileResolver })
      const importMeta = importsGenerator.build(generated.map((item) => item.import))

      if (importMeta) {
        const nodes = importMeta.map((item) => {
          return createImportDeclaration({
            name: [{ propertyName: item.ref.propertyName }],
            path: item.path,
            isTypeOnly: true,
          })
        })

        codes.unshift(print(nodes))
      }
    }

    return combineCodes(codes)
  }
}
