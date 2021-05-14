import {html} from '@polymer/polymer';
import '@polymer/iron-flex-layout/iron-flex-layout';
import {sharedStyles} from './shared-styles';

export const tableStyles = html`
  ${sharedStyles}
  <style>
    :host {
      --data-table-header: {
        box-sizing: border-box;
        width: 100%;
      }
    }

    etools-data-table-column {
      min-width: 0;
    }

    etools-data-table-column:last-of-type {
      padding: 0;
    }

    etools-data-table-row {
      display: block;
      --list-divider-color: var(--paper-grey-300);
      --list-icon-color: var(--paper-grey-500);
    }

    etools-data-table-column,
    .table-cell {
      @apply --layout-flex;
    }

    etools-data-table-column[flex-2],
    .table-cell[flex-2] {
      @apply --layout-flex-2;
    }

    etools-data-table-column[flex-3],
    .table-cell[flex-3] {
      @apply --layout-flex-3;
    }

    .table-cell--text {
      @apply --truncate;

      width: 100%;
    }

    .table-cell:not(:last-of-type) {
      padding-right: 15px;
    }

    etools-data-table-footer {
      --list-icon-color: var(--paper-grey-500);
    }

    .row-details-expanded-wrapper {
      padding: 15px 24px 15px 72px;
      background-color: var(--paper-grey-100);
      border-top: 1px solid var(--list-divider-color, #9d9d9d);
    }

    etools-data-table-header {
      --list-header-column-height: auto;
      --list-header-wrapper-height: auto;
      --list-header-wrapper-column-height: auto;
    }
  </style>
`;
