import { html } from '@polymer/polymer';
import '@polymer/paper-styles/typography';
export const dashboardWidgetStyles = html `

  <style>

    :host {
      height: 100%;
    }

    .widget-container {
      width: 100%;
      height: 100%;
      padding: 32px;
    }

    .widget-heading {
      margin: 0;

      @apply --paper-font-body1;
    }

    .widget-heading:only-child {
      margin: 0;
    }

    .widget-figure {
      @apply --paper-font-display1;

      margin: .25em 0;
      text-align: right;
    }

    .widget-figure:only-child {
      margin: 0;
    }

    .widget-actions {
      text-align: right;
    }

    .widget-actions a {
      text-transform: uppercase;
      text-decoration: none;
      color: var(--theme-primary-color);
    }

  </style>

`;
