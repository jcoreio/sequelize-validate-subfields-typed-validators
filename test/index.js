// @flow

import { validateWithTypedValidators } from '../src'
import { expect } from 'chai'

import * as t from 'typed-validators'

type PostalCode = string
const PostalCodeType: t.TypeAlias<PostalCode> = t.alias(
  'PostalCode',
  t.string()
)
PostalCodeType.addConstraint((postalCode: string): ?string => {
  if (!/^\d{4,5}$/.test(postalCode)) return 'must be a 4 or 5-digit postal code'
})

type NonEmptyString = string
const NonEmptyStringType: t.TypeAlias<NonEmptyString> = t.alias(
  'NonEmptyString',
  t.string()
)
NonEmptyStringType.addConstraint((value: string): ?string => {
  if (value === '') return 'must not be empty'
})

type Address = {|
  line1: NonEmptyString,
  line2?: NonEmptyString,
  postalCode: PostalCode,
  state: NonEmptyString,
|}

const AddressType: t.TypeAlias<Address> = t.alias(
  'Address',
  t.object({
    required: {
      line1: t.ref(() => NonEmptyStringType),
      postalCode: t.ref(() => PostalCodeType),
      state: t.ref(() => NonEmptyStringType),
    },

    optional: {
      line2: t.ref(() => NonEmptyStringType),
    },
  })
)

type User = {|
  username: NonEmptyString,
  address: Address,
|}

const UserType: t.TypeAlias<User> = t.alias(
  'User',
  t.object({
    username: t.ref(() => NonEmptyStringType),
    address: t.ref(() => AddressType),
  })
)

describe('validateWithTypedValidators', () => {
  it('works for non-reduxFormStyle', () => {
    const validator = validateWithTypedValidators(UserType)

    try {
      validator({
        username: '',
        address: {
          line1: '',
          postalCode: '123',
        },
      })
      throw new Error('expected an error to be thrown')
    } catch (error) {
      expect(error.validation).to.deep.equal({
        errors: [
          { path: ['username'], message: 'must not be empty' },
          { path: ['address', 'line1'], message: 'must not be empty' },
          {
            path: ['address', 'postalCode'],
            message: 'must be a 4 or 5-digit postal code',
          },
          { path: ['address'], message: 'must have property: state' },
        ],
      })
    }

    try {
      validator({
        username: 'andy',
        address: null,
      })
      throw new Error('expected an error to be thrown')
    } catch (error) {
      expect(error.validation).to.deep.equal({
        errors: [{ path: ['address'], message: 'must be an object' }],
      })
    }
  })
  it('works for reduxFormStyle', () => {
    const validator = validateWithTypedValidators(UserType, {
      reduxFormStyle: true,
    })

    try {
      validator({
        username: '',
        address: {
          line1: '',
          postalCode: '123',
        },
      })
      throw new Error('expected an error to be thrown')
    } catch (error) {
      expect(error.validation).to.deep.equal({
        errors: [
          { path: ['username'], message: 'must not be empty' },
          { path: ['address', 'line1'], message: 'must not be empty' },
          {
            path: ['address', 'postalCode'],
            message: 'must be a 4 or 5-digit postal code',
          },
          { path: ['address', '_error'], message: 'must have property: state' },
        ],
      })
    }

    try {
      validator({
        username: 'andy',
        address: null,
      })
      throw new Error('expected an error to be thrown')
    } catch (error) {
      expect(error.validation).to.deep.equal({
        errors: [{ path: ['address', '_error'], message: 'must be an object' }],
      })
    }
  })
  it('works for validation function', () => {
    const validator = validateWithTypedValidators((user) =>
      UserType.validate(user)
    )

    try {
      validator({
        username: '',
        address: {
          line1: '',
          postalCode: '123',
        },
      })
      throw new Error('expected an error to be thrown')
    } catch (error) {
      expect(error.validation).to.deep.equal({
        errors: [
          { path: ['username'], message: 'must not be empty' },
          { path: ['address', 'line1'], message: 'must not be empty' },
          {
            path: ['address', 'postalCode'],
            message: 'must be a 4 or 5-digit postal code',
          },
          { path: ['address'], message: 'must have property: state' },
        ],
      })
    }

    try {
      validator({
        username: 'andy',
        address: null,
      })
      throw new Error('expected an error to be thrown')
    } catch (error) {
      expect(error.validation).to.deep.equal({
        errors: [{ path: ['address'], message: 'must be an object' }],
      })
    }
  })
  it('works for function returning null', () => {
    const validator = validateWithTypedValidators((user) => null)
    validator({
      username: '',
      address: {
        line1: '',
        postalCode: '123',
      },
    })
  })
})
