var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from '@polymer/polymer';
import { ReduxConnectedElement } from '../../../ReduxConnectedElement';
import { property } from '@polymer/decorators/lib/decorators';
import '@polymer/paper-card/paper-card';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import { dashboardWidgetStyles } from '../../../styles/dashboard-widget-styles';
import LocalizeMixin from '../../../mixins/localize-mixin';
import RoutingMixin from '../../../mixins/routing-mixin';
import '../../etools-prp-number';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 * @appliesMixin RoutingMixin
 */
class NumberOfPartners extends LocalizeMixin(RoutingMixin(ReduxConnectedElement)) {
    constructor() {
        super(...arguments);
        this.numberOfPartners = null;
    }
    static get template() {
        return html `
    ${dashboardWidgetStyles}
    <style include="iron-flex">
      :host {
        display: block;
      }
    </style>

    <paper-card class="widget-container layout vertical">
      <h3 class="widget-heading flex">[[localize('number_of_contributing_partners')]]</h3>

      <div class="widget-figure flex">
        <etools-prp-number value="[[numberOfPartners]]"></etools-prp-number>
      </div>
      <etools-loading active="[[loading]]"></etools-loading>
    </paper-card>
    `;
    }
    _computePartnersUrl(baseUrl) {
        return this.buildUrl(baseUrl, '/response-parameters/partners');
    }
}
__decorate([
    property({ type: Number, computed: 'getReduxStateValue(rootState.clusterDashboardData.data.num_of_partners)' })
], NumberOfPartners.prototype, "numberOfPartners", void 0);
__decorate([
    property({ type: String, computed: '_computePartnersUrl(_baseUrlCluster)' })
], NumberOfPartners.prototype, "partnersUrl", void 0);
__decorate([
    property({ type: Boolean, computed: 'getReduxStateValue(rootState.clusterDashboardData.loading)' })
], NumberOfPartners.prototype, "loading", void 0);
window.customElements.define('number-of-partners', NumberOfPartners);
export { NumberOfPartners as NumberOfPartnersEl };
