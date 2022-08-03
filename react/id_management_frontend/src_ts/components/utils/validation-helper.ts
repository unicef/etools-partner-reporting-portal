import {LitElement} from 'lit-element';
import {PolymerElement} from '@polymer/polymer';
import {AnyObject} from '@unicef-polymer/etools-types';

type ValidatableElement = (LitElement | PolymerElement) & {validate(): boolean};

export const validateRequiredFields = (element: LitElement | PolymerElement) => {
  let isValid = true;
  element!.shadowRoot!.querySelectorAll<ValidatableElement>('[required]').forEach((el) => {
    if (el && el.validate && !el.validate()) {
      isValid = false;
    }
  });
  return isValid;
};

export const resetRequiredFields = (element: LitElement | PolymerElement) => {
  element!.shadowRoot!.querySelectorAll<ValidatableElement>('[required]').forEach((el: AnyObject) => {
    if (el) {
      el.invalid = false;
    }
  });
};

export const fieldValidationReset = (element: LitElement | PolymerElement, selector: string, useValidate?: boolean) => {
  if (!useValidate) {
    useValidate = false;
  }
  const field = element.shadowRoot!.querySelector(selector) as LitElement & {validate(): boolean};
  if (field) {
    if (useValidate) {
      field.validate();
    } else {
      // TODO: check if sets to false
      field.setAttribute('invalid', 'false');
    }
  }
  return field;
};
