import {html} from 'lit-element';

export const SharedStylesLit = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
      font-size: 16px;
    }

    *[hidden] {
      display: none !important;
    }

    h1,
    h2 {
      color: var(--primary-text-color);
      margin: 0;
      font-weight: normal;
    }

    h1 {
      text-transform: capitalize;
      font-size: 24px;
    }

    h2 {
      font-size: 20px;
    }

    a {
      color: var(--primary-color);
      text-decoration: none;
    }

    .error {
      color: var(--error-color);
      font-size: 12px;
      align-self: center;
    }

    paper-input-container {
      margin: 0 12px;
      --paper-input-container-focus-color: var(--module-primary);
      --paper-input-container: {
        color: var(--gray-50) !important;
        font-size: 13px;
        opacity: 1 !important;
      }
      --paper-input-container-underline: {
        display: none !important;
      }
      --paper-input-container-underline-focus: {
        display: none;
      }
      --paper-input-container-underline-disabled: {
        display: block !important;
        border-bottom: 1px dashed var(--gray-20) !important;
      }
    }

    etools-dropdown[readonly],
    etools-dropdown-multi[readonly],
    datepicker-lite[readonly],
    paper-input[readonly],
    paper-textarea[readonly] {
      --paper-input-container-underline: {
        display: none;
      }
      --paper-input-container-input-focus: {
        pointer-events: none;
      }
      --paper-input-container-label-focus: {
        pointer-events: none;
        color: var(--secondary-text-color);
      }
      --paper-input-container-underline-focus: {
        display: none;
      }
      --paper-input-container: {
        pointer-events: none;
        cusrsor: text;
      }
      --paper-input-container-label: {
        pointer-events: none;
        color: var(--secondary-text-color, #737373);
        cusrsor: text;
      }
      --esmm-select-cursor: text;
      --esmm-external-wrapper: {
        width: 100%;
        margin: 0;
      }
    }

    paper-input {
      width: 100%;
    }

    paper-textarea {
      width: 100%;
    }

    datepicker-lite {
      min-width: 200px;
    }

    etools-content-panel::part(ecp-header) {
      background-color: var(--primary-background-color);
      border-bottom: 1px groove var(--dark-divider-color);
    }

    etools-content-panel::part(ecp-header-title) {
      padding: 0 24px 0 0;
      text-align: start;
      font-size: 18px;
      font-weight: 500;
    }

    etools-content-panel::part(ecp-content) {
      padding: 0;
    }

    etools-dialog {
      --esmm-dropdown-menu-position: fixed !important;
    }

    etools-dialog::part(ed-title) {
      border-bottom: solid 1px var(--dark-divider-color);
    }

    etools-dialog paper-textarea {
      --iron-autogrow-textarea: {
        overflow: auto;
        padding: 0;
        max-height: 96px;
      }
    }

    paper-textarea {
      flex: auto;
      --paper-input-container-input: {
        display: block;
      }
    }

    etools-dialog::part(ed-scrollable) {
      margin-top: 0 !important;
      padding-top: 12px;
      padding-bottom: 16px;
    }

    etools-dialog::part(ed-button-styles) {
      margin-top: 0;
    }

    etools-dropdown,
    etools-dropdown-multi {
      --esmm-external-wrapper: {
        width: 100%;
        margin: 0;
      }
    }

    :host > * {
      --required-star-style: {
        background: url('./images/required.svg') no-repeat 99% 20%/8px;
        width: auto !important;
        max-width: 100%;
        right: auto;
        padding-right: 15px;
      }
    }

    paper-input,
    paper-textarea,
    paper-input-container,
    datepicker-lite,
    etools-dropdown,
    etools-dropdown-multi,
    etools-upload,
    etools-currency-amount-input {
      --paper-input-container-label: {
        color: var(--secondary-text-color, #737373);
      }
      --paper-input-container-label-floating: {
        color: var(--secondary-text-color, #737373);
      }
    }

    paper-input[required][label],
    paper-textarea[required][label],
    paper-input-container[required],
    datepicker-lite[required],
    etools-dropdown[required],
    etools-dropdown-multi[required],
    etools-upload[required],
    etools-currency-amount-input[required] {
      --paper-input-container-label: {
        @apply --required-star-style;
        color: var(--secondary-text-color, #737373);
      }
      --paper-input-container-label-floating: {
        @apply --required-star-style;
        color: var(--secondary-text-color, #737373);
      }
    }

    paper-textarea {
      --paper-input-container-input: {
        display: block;
      }
    }

    label[required] {
      @apply --required-star-style;
      background: url('./images/required.svg') no-repeat 87% 40%/6px;
    }

    .readonly {
      pointer-events: none;
    }
    .font-bold {
      font-weight: bold;
    }
    .p-relative {
      position: relative;
    }

    section > *::not(etools-loading) {
      background-color: var(--primary-background-color);
    }

    .editable-row > .hover-block {
      opacity: 0;
      display: flex;
      align-items: center;
      cursor: pointer;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      line-height: 48px;
      background-color: #eeeeee;
      z-index: 100;
    }

    .editable-row .hover-block paper-icon-button {
      color: rgba(0, 0, 0, 0.54);
      padding-left: 5px;
    }

    .editable-row:hover > .hover-block {
      opacity: 1;
    }

    .editable-row:focus-within .hover-block {
      opacity: 1;
    }
  </style>
`;
