var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import UtilsMixin from '../../../../../mixins/utils-mixin';
import RoutingMixin from '../../../../../mixins/routing-mixin';
import '../../../../../elements/cluster-reporting/response-parameters/partners/contacts/filters';
import '../../../../../elements/cluster-reporting/contacts-table';
import { sharedStyles } from '../../../../../styles/shared-styles';
import '../../../../../elements/etools-prp-ajax';
// import {EtoolsPrpAjaxEl} from '../../../../../elements/etools-prp-ajax';
// import Endpoints from '../../../../../endpoints';
// import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
// import {timeOut} from '@polymer/polymer/lib/utils/async';
// import {fetchPartnerActivitiesList} from '../../../../../redux/actions/partnerActivities';
/**
* @polymer
* @customElement
* @appliesMixin UtilsMixin
* @appliesMixin RoutingMixin
*/
class Contacts extends RoutingMixin(UtilsMixin(ReduxConnectedElement)) {
    static get template() {
        return html `
    ${sharedStyles}
    <style>
        :host {
          display: block;
        }
      </style>

    <iron-location query="{{query}}"></iron-location>

    <iron-query-params
        params-string="{{query}}"
        params-object="{{queryParams}}">
    </iron-query-params>

<!--     <etools-prp-ajax
        id="partnerContacts"
        url="[[url]]"
        params="[[queryParams]]">
    </etools-prp-ajax> -->

    <page-body>

      <partner-contacts-filters></partner-contacts-filters>

      <contacts-table></contacts-table>

    </page-body>
    `;
    }
}
__decorate([
    property({ type: String })
], Contacts.prototype, "query", void 0);
__decorate([
    property({ type: Object })
], Contacts.prototype, "queryParams", void 0);
window.customElements.define('rp-partners-contacts', Contacts);
export { Contacts as RpPartnersContactsDetailEl };
