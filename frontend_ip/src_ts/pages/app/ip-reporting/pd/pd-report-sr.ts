import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import UtilsMixin from '../../../../etools-prp-common/mixins/utils-mixin.js';
import '@polymer/iron-pages/iron-pages.js';
import './pd-report-sr/reporting.js'; // Assuming this is the correct path to your component

@customElement('page-pd-report-sr')
export class PagePdReportSr extends UtilsMixin(LitElement) {
  @property({type: String, attribute: true, reflect: true})
  selectedTab = 'reporting';

  static styles = css`
    :host {
      display: block;
    }
  `;

  render() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>

      <iron-pages attr-for-selected="name" .selected="${this.selectedTab}">
        <div name="reporting">
          <page-pd-report-sr-reporting></page-pd-report-sr-reporting>
        </div>
      </iron-pages>
    `;
  }
}
