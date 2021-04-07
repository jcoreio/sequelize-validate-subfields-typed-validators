// @flow

import type { Type, Validation } from 'typed-validators'
import { validateSubfields } from 'sequelize-validate-subfields'
import type { FieldValidation } from 'sequelize-validate-subfields'

type ConvertOptions = {
  reduxFormStyle?: boolean,
}

function checkPath(path: Array<any>): Array<string | number> {
  for (const elem of path) {
    if (typeof elem !== 'string' && typeof elem !== 'symbol') {
      throw new Error(
        `invalid error path element: ${typeof elem}, ${String(elem)}`
      )
    }
  }
  return path
}

export function* convertValidationErrors(
  validation: Validation,
  options: ConvertOptions = {}
): Iterable<FieldValidation> {
  for (let error of validation.errors) {
    if (
      options.reduxFormStyle &&
      error.expectedTypeAtPath.acceptsSomeCompositeTypes
    ) {
      yield {
        path: [...checkPath(error.path), '_error'],
        message: error.messageAtPath(),
      }
    } else yield { path: checkPath(error.path), message: error.messageAtPath() }
  }
}

export function validateWithTypedValidators(
  type: Type<any> | ((value: any) => ?Validation),
  options: ConvertOptions = {}
): (value: any) => void {
  return validateSubfields(function* (value: any): Iterable<FieldValidation> {
    const validation =
      typeof type === 'function'
        ? type(value)
        : type.validate(value, undefined, [])
    if (validation) {
      yield* convertValidationErrors(validation, options)
    }
  })
}
