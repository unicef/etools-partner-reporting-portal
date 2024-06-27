import {html} from 'lit';
import '@polymer/paper-styles/color';

export const appThemeIpStyles = html`
  <style>
    :host {
      --primary-color: #0099ff;
      --theme-primary-color: #0099ff;
      --theme-secondary-color-a: #ccebff;
      --theme-secondary-color-b: #2baaff;
      --theme-secondary-color-c: #233944;
      --theme-secondary-color-d: #3db2ff;

      --theme-primary-text-color-dark: #212121;
      --theme-primary-text-color-medium: #c0c0c0;
      --theme-primary-text-color-light: #fff;
      --theme-secondary-text-color: #5d6b75;

      --theme-table-bg-primary: #edf8ff;
      --theme-table-bg-secondary: #c4e3f7;

      --ecp-header-bg: var(--theme-primary-color);

      --paper-input-container-focus-color: var(--theme-primary-color);

      --theme-page-header-background-color: var(--theme-secondary-color-c);

      --theme-selected-item-background-color: var(--paper-grey-200);

      --paper-checkbox-checked-color: var(--theme-primary-color);
      --paper-checkbox-unchecked-ink-color: var(--theme-primary-color);
      --paper-checkbox-checked-ink-color: var(--theme-primary-color);

      --accent-color: #0099ff;

      --paper-tabs-selection-bar-color: var(--theme-primary-color);
      --paper-tab-ink: var(--theme-selected-item-background-color);

      --paper-progress-active-color: var(--theme-secondary-color-b);

      --paper-tab-content: {
        color: var(--theme-primary-color);
      }
      --paper-tab-content-unselected: {
        color: var(--theme-secondary-text-color);
      }

      --paper-radio-button-checked-color: var(--theme-primary-color);
    }
  </style>
`;
