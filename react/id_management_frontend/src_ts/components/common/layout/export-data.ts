import {customElement, html, LitElement, property, css} from 'lit-element';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-menu-button/paper-menu-button';
import '@polymer/iron-icon/iron-icon';
import '@polymer/paper-listbox/paper-listbox';
import {AnyObject} from '@unicef-polymer/etools-types';
import {elevation2} from '../../styles/lit-styles/elevation-styles';
import {fireEvent} from '../../utils/fire-custom-event';

/**
 * @customElement
 * @LitElement
 */
@customElement('export-data')
export class ExportData extends LitElement {
  static get styles() {
    return [
      css`
        paper-menu-button {
          padding: 0px 24px;
        }
        paper-button {
          height: 40px;
          padding: 0px 5px;
          margin-left: 10px;
          font-weight: bold;
          color: var(--secondary-text-color);
        }

        paper-button iron-icon {
          margin-right: 10px;
          color: var(--secondary-text-color);
        }

        paper-button:focus {
          ${elevation2}
        }

        paper-item:hover {
          cursor: pointer;
        }
      `
    ];
  }
  public render() {
    return html`
      <style>
        #pdExportMenuBtn {
          /* Prevent first item highlighted by default */
          --paper-item-focused-before: {
            background: none;
            opacity: 0;
          }
          --paper-item-focused-after: {
            background: none;
            opacity: 0;
          }
        }
      </style>
      <paper-menu-button id="pdExportMenuBtn" close-on-activate horizontal-align="right">
        <paper-button slot="dropdown-trigger" class="dropdown-trigger">
          <iron-icon icon="file-download"></iron-icon>
          Export
        </paper-button>
        <paper-listbox slot="dropdown-content">
          ${this.exportLinks.map(
      (item) => html` <paper-item @tap="${() => this.export(item.type)}">${item.name}</paper-item>`
    )}
        </paper-listbox>
      </paper-menu-button>
    `;
  }

  @property({type: Array})
  exportLinks: AnyObject[] = [
    {
      name: 'Export Excel',
      type: 'xlsx'
    },
    {
      name: 'Export CSV',
      type: 'csv'
    }
  ];

  @property({type: String})
  params = '';

  @property({type: String})
  endpoint = '';

  export(_type: string) {
    // const url = this.endpoint + `export/${type}/` + (this.params ? `?${this.params}` : '');
    // Export not implemented yet
    // window.open(url, '_blank');
    fireEvent(this, 'toast', {text: 'Export not implemented...'});
  }
}
