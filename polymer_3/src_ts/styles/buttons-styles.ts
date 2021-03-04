import {html} from '@polymer/polymer';

export const buttonsStyles = html`
  <style>
    paper-button[raised].btn-primary {
      color: white;
      background: var(--theme-primary-color);
    }

    paper-button:not([raised]).btn-primary {
      color: var(--theme-primary-color);
    }

    paper-button[disabled].btn-primary {
      opacity: 0.5;
    }

    .btn-cancel {
      color: var(--theme-primary-text-color-dark);
    }
  </style>
`;
