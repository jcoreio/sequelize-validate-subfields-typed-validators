import type { Type, Validation } from 'typed-validators'
import type { FieldValidation } from 'sequelize-validate-subfields'

type ConvertOptions = {
  reduxFormStyle?: boolean
}

export function* convertValidationErrors(
  validation: Validation,
  options: ConvertOptions = {}
): Iterable<FieldValidation>

export function validateWithTypedValidators(
  type: Type<any> | ((value: any) => ?Validation),
  options: ConvertOptions = {}
): (value: any) => void
