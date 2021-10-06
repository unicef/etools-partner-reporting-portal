import { html } from '@polymer/polymer';
export const modalStyles = html `
  <style>
    .header {
      height: 48px;
      padding: 0 24px;
      margin: 0;
      color: white;
      background: var(--theme-primary-color);
    }

    .header h2 {
      @apply --paper-font-title;
      margin: 0;
      line-height: 48px;
    }

    .header paper-icon-button {
      margin: 0 -13px 0 20px;
      color: white;
    }

    .buttons {
      padding: 24px;
      justify-content: flex-start;
    }

     .item.full-width {
       @apply --app-grid-expandible-item;
     }

     .item {
      padding-right: 20px;
      margin-bottom: 20px !important;
    }

    datepicker-lite {
      position: relative;
    }


    // .full-width {
    //   @apply --app-grid-expandible-item;
    // }
  </style>`;
