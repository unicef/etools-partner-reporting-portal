import {html} from '@polymer/polymer/polymer-element';

export const printStyles = html`

  <style>
    :host {
      -webkit-print-color-adjust: exact;
      color-adjust: exact;
    }
  </style>

`;
