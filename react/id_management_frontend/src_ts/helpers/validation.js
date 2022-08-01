import {isEmpty, isNil} from 'ramda';

export const required = value => ((value === undefined || value === null || isEmpty(value)) ? 'Required' : undefined);

export const warning = value => (isEmpty(value) || isNil(value) || (Array.isArray(value) && isNil(value[0])) ? 'Required' : undefined);

export const email = (value) => {
  if (value && value.length > 0) {
    return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
      ? undefined
      : 'Invalid email address';
  }

  return undefined;
};

export const isNotUnicefEmail = (value) => {
  if (value && value.length > 0) {
    return value.includes('@unicef.org') ? 'Invalid email address' : undefined;
  }
  return undefined;
};

export const phoneNumber = (value) => {
  if (value && !/^\+?[0-9]\d{1,14}$/.test(value.trim())) {
    return 'Invalid phone number';
  }
};
