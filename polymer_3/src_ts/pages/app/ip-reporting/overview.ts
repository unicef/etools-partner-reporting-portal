import {ReduxConnectedElement} from '../../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import '../../../elements/page-header';
import '../../../etools-prp-common/elements/page-body';
import '../../../elements/ip-reporting/partner-details';
import '../../../elements/ip-reporting/risk-rating';
import LocalizeMixin from '../../../etools-prp-common/mixins/localize-mixin';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 */
class PageIpReportingOverview extends LocalizeMixin(ReduxConnectedElement) {
  public static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>

      <page-header title="[[localize('overview')]]"></page-header>

      <page-body>
        <partner-details></partner-details>
        <risk-rating></risk-rating>
      </page-body>
    `;
  }
}
window.customElements.define('page-ip-reporting-overview', PageIpReportingOverview);
