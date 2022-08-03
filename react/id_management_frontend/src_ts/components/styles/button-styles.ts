import {css} from 'lit-element';

// language=HTML
export const buttonsStyles = css`
  paper-button.default,
  paper-button.primary,
  paper-button.info,
  paper-button.success,
  paper-button.error {
    padding: 6px 8px;
    font-weight: 500;
    letter-spacing: 0.5px;
  }

  paper-button.default.left-icon,
  paper-button.primary.left-icon,
  paper-button.info.left-icon,
  paper-button.success.left-icon,
  paper-button.error.left-icon {
    padding-right: 12px;
  }

  paper-button.default.right-icon,
  paper-button.primary.right-icon,
  paper-button.info.right-icon,
  paper-button.success.right-icon,
  paper-button.error.right-icon {
    padding-left: 12px;
  }

  paper-button.default.left-icon iron-icon,
  paper-button.primary.left-icon iron-icon,
  paper-button.success.left-icon iron-icon,
  paper-button.error.left-icon iron-icon {
    margin-right: 10px;
  }

  paper-button.info.left-icon iron-icon {
    margin-right: 4px;
  }

  paper-button.default.right-icon iron-icon,
  paper-button.primary.right-icon iron-icon,
  paper-button.info.right-icon iron-icon,
  paper-button.success.right-icon iron-icon,
  paper-button.error.right-icon iron-icon {
    margin-left: 10px;
  }

  paper-button.default {
    color: var(--default-btn-color, #ffffff);
    background-color: var(--default-btn-bg-color, rgba(0, 0, 0, 0.45));
  }

  paper-button.primary {
    color: var(--primary-btn-color, #ffffff);
    background-color: var(--primary-btn-bg-color, var(--primary-color));
  }

  paper-button.info {
    color: var(--primary-color, #0099ff);
    align-self: center;
  }

  paper-button.success {
    color: var(--success-btn-color, #ffffff);
    background-color: var(--success-btn-bg-color, var(--success-color));
  }

  paper-button.error {
    color: var(--error-btn-color, #ffffff);
    background-color: var(--error-btn-bg-color, var(--error-color));
  }
`;
