import {PolymerElement, html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/iron-pages/iron-pages';
import './pd-report-hr-qpr/reporting';
import UtilsMixin from '../../../../etools-prp-common/mixins/utils-mixin';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
class PagePdReportHr extends UtilsMixin(PolymerElement) {
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
      </iron-pages>
    `;
  }

  @property({type: String, notify: true})
  selectedTab!: string;
}

window.customElements.define('page-pd-report-hr', PagePdReportHr);
