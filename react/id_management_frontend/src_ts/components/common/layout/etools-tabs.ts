import {LitElement, html, property, customElement} from 'lit-element';
import '@polymer/paper-tabs/paper-tabs';
import '@polymer/paper-tabs/paper-tab';
import {AnyObject} from '../../../types/globals';

/**
 * @LitElement
 * @customElement
 */

@customElement('etools-tabs')
export class EtoolsTabs extends LitElement {
  public render() {
    // main template
    // language=HTML
    return html`
      <style>
        *[hidden] {
          display: none !important;
        }

        paper-tab[disabled] {
          opacity: 0.3;
        }

        *[disabled] {
          cursor: not-allowed !important;
          pointer-events: auto !important;
        }

        :host {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
        }

        :host([border-bottom]) {
          border-bottom: 1px solid var(--dark-divider-color);
        }

        paper-tabs {
          --paper-tabs-selection-bar-color: var(--primary-color);
        }

        paper-tab[link],
        paper-tab {
          --paper-tab-ink: var(--primary-color);
          padding: 0 24px;
        }

        paper-tab .tab-content {
          color: var(--secondary-text-color);
          text-transform: uppercase;
        }

        paper-tab.iron-selected .tab-content {
          color: var(--primary-color);
        }

        @media print {
          :host {
            display: none;
          }
        }
      </style>

      <paper-tabs id="tabs" selected="${this.activeTab}" attr-for-selected="name" noink>
        ${this.tabs.map((item) => this.getTabHtml(item))}
      </paper-tabs>
    `;
  }

  @property({type: String})
  activeTab = '';

  @property({type: Array})
  tabs!: AnyObject[];

  getTabHtml(item: any) {
    return html`
      <paper-tab name="${item.tab}" link ?hidden="${item.hidden}" ?disabled="${item.disabled}">
        <span class="tab-content">
          ${item.tabLabel} ${item.showTabCounter ? html`(item.counter)` : ''}
        </span>
      </paper-tab>
    `;
  }
}
