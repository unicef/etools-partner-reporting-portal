import {html} from '@polymer/polymer';
import '@polymer/paper-styles/color';

export const appThemeClusterStyles = html`
  <style>
    :host {
      --theme-primary-color: #009d55;
      --theme-secondary-color-a: #ceffcc;
      --theme-secondary-color-b: #88c245;
      --theme-secondary-color-c: #233944;
      --theme-secondary-color-d: #0bad62;

      --theme-primary-text-color-dark: #212121;
      --theme-primary-text-color-medium: #c0c0c0;
      --theme-primary-text-color-light: #fff;
      --theme-secondary-text-color: #5d6b75;

      --theme-table-bg-primary: #f7fbf9;
      --theme-table-bg-secondary: #e5f4ed;

      --ecp-header-bg: var(--theme-primary-color);

      --paper-input-container-focus-color: var(--theme-primary-color);

      --theme-page-header-background-color: var(--theme-secondary-color-c);

      --theme-selected-item-background-color: var(--paper-grey-200);

      --paper-checkbox-checked-color: var(--theme-primary-color);
      --paper-checkbox-unchecked-ink-color: var(--theme-primary-color);
      --paper-checkbox-checked-ink-color: var(--theme-primary-color);

      --accent-color: #009d55;

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
