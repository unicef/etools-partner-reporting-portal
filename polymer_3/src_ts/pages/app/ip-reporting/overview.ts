
import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';


import '@polymer/app-localize-behavior/app-localize-behavior.js';
import '../../../elements/page-header';
import '../../../elements/page-body';
import '../../../elements/ip-reporting/partner-details';
import '../../../elements/ip-reporting/risk-rating';
import LocalizeMixin from '../../../mixins/localize-mixin';

//(dci)
// behaviors: [
// App.Behaviors.ReduxBehavior,
// App.Behaviors.LocalizeBehavior,
// Polymer.AppLocalizeBehavior,

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
