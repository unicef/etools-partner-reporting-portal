import {PolymerElement, html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/iron-pages/iron-pages';
import './pd-report-hr-qpr/reporting';
import './pd-report-hr-qpr/info';
import UtilsMixin from '../../../../mixins/utils-mixin';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
class PagePdReportQpr extends UtilsMixin(PolymerElement) {
  public static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>

      <iron-pages attr-for-selected="name" selected="{{selectedTab}}">
        <template is="dom-if" if="[[_equals(selectedTab, 'reporting')]]" restamp="true">
          <page-pd-report-reporting name="reporting"> </page-pd-report-reporting>
        </template>

        <template is="dom-if" if="[[_equals(selectedTab, 'info')]]" restamp="true">
          <page-pd-report-info name="info"> </page-pd-report-info>
        </template>
      </iron-pages>
    `;
  }

  @property({type: String, notify: true})
  selectedTab!: string;
}

window.customElements.define('page-pd-report-qpr', PagePdReportQpr);
