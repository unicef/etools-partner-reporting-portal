import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import '../../../elements/page-header';
import '../../../elements/page-body';
import '../../../elements/ip-reporting/partner-details';
import '../../../elements/ip-reporting/risk-rating';
import LocalizeMixin from '../../../mixins/localize-mixin';

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
