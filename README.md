# sequelize-validate-subfields-typed-validators

[![CircleCI](https://circleci.com/gh/jcoreio/sequelize-validate-subfields-typed-validators.svg?style=svg)](https://circleci.com/gh/jcoreio/sequelize-validate-subfields-typed-validators)
[![Coverage Status](https://codecov.io/gh/jcoreio/sequelize-validate-subfields-typed-validators/branch/master/graph/badge.svg)](https://codecov.io/gh/jcoreio/sequelize-validate-subfields-typed-validators)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![npm version](https://badge.fury.io/js/sequelize-validate-subfields-typed-validators.svg)](https://badge.fury.io/js/sequelize-validate-subfields-typed-validators)

use typed-validators to validate JSON attributes of Sequelize models

# Installation

```sh
npm install --save typed-validators sequelize-validate-subfields-typed-validators
```

# Example

```js
import Sequelize from 'sequelize'
import * as t from 'typed-validators'
import { validateWithTypedValidators } from 'sequelize-validate-subfields-typed-validators'
import { flattenValidationErrors } from 'sequelize-validate-subfields'

import sequelize from './sequelize'

const UserInfoType = t.alias(
  'User',
  t.object({
    phone: t.string(),
    address: t.object({
      required: {
        line1: t.string(),
        postalCode: t.number(),
        state: t.string(),
      },
      optional: {
        line2: t.string(),
      },
    }),
  })
)

const User = Sequelize.define('User', {
  username: {
    type: Sequelize.STRING,
    validate: {
      notEmpty: {
        msg: 'required',
      },
    },
  },
  info: {
    type: Sequelize.JSON,
    validate: validateWithTypedValidators(UserInfoType),
  },
})

try {
  User.create({
    username: '',
    address: {
      line2: 2,
      postalCode: '76034',
      state: 'TX',
    },
  })
} catch (error) {
  if (error instanceof Sequelize.ValidationError) {
    console.error(flattenValidationErrors(error))
  } else {
    console.error(error)
  }
}
```

Output:

```
[
  {path: ['username'], message: 'required'},
  {path: ['address', 'line1'], message: 'must be a string'},
  {path: ['address', 'line2'], message: 'must be a string'},
  {path: ['address', 'postalCode'], message: 'must be a number'},
]
```

# API

## `convertValidationErrors(validation, [options])`

### Arguments

#### `validation: Validation`

A `typed-validators` `Validation` object containing an `errors` array of `[path, message, type]` tuples.

#### `options?: {reduxFormStyle?: boolean}`

If `reduxFormStyle` is true, validation errors on object/array fields will be yielded for the `_error` subpath
under that field.

### Returns: `Iterable<FieldValidation>`

Yields `{path: Array<string | number>, message: string}` objects about validation errors, the format defined by
`sequelize-validate-subfields`.

## `validateWithTypedValidators(typeOrValidator, [options])`

### Arguments

#### `typeOrValidator: Type<any> | ((value: any) => ?Validation)

A `typed-validators` `Type`, or a function taking an attribute value and returning a `typed-validators` `Validation`
object or `null`. Errors from applying the given function or validating against the given type will be yielded in
`sequelize-validate-subfields` format.

#### `options?: {reduxFormStyle?: boolean}`

If `reduxFormStyle` is true, validation errors on object/array fields will be yielded for the `_error` subpath
under that field.

### Returns: `(value: any) => void`

A Sequelize custom attribute validation function that uses the given `typeOrValidator` to validate attribute values.
