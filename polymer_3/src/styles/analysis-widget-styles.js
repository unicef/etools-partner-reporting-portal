import { html } from '@polymer/polymer';
import '@polymer/paper-styles/color';
export const analysisWidgetStyles = html `

  <style>
  
    :host {
      display: block;
    }

    .analysis-widget {
      position: relative;
    }

    .analysis-widget__header {
      padding-left: .5em;
      margin: 0 0 1em;
      border-left: 4px solid var(--theme-primary-color);
      font-size: 18px;
      font-weight: normal;
      color: var(--theme-primary-text-color-dark);
    }

    .analysis-widget__body {
      min-height: 100px;
      position: relative;
    }

    etools-loading {
      margin: -8px;
    }
      
  </style>

`;
