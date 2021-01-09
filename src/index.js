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
  for (let [path, message, type] of validation.errors) {
    if (options.reduxFormStyle && type.acceptsSomeCompositeTypes) {
      yield { path: [...checkPath(path), '_error'], message }
    } else yield { path: checkPath(path), message }
  }
}

export function validateWithTypedValidators(
  type: Type<any> | ((value: any) => ?Validation),
  options: ConvertOptions = {}
): (value: any) => void {
  return validateSubfields(function* (value: any): Iterable<FieldValidation> {
    const validation =
      typeof type === 'function' ? type(value) : type.validate(value)
    if (validation) {
      yield* convertValidationErrors(validation, options)
    }
  })
}
