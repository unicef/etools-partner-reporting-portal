import { isEmpty, isNil } from 'ramda';

export const required = value => ((value === undefined || value === null || isEmpty(value)) ? 'Required' : undefined);
export const warning = value => (isEmpty(value) || isNil(value) || (Array.isArray(value) && isNil(value[0])) ? 'Required' : undefined);
