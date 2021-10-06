var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import './dropdown-form-input';
import '../etools-prp-ajax';
import Endpoints from '../../endpoints';
import '../etools-prp-permissions';
/**
 * @polymer
 * @customElement
 */
class PartnerDropdownContent extends ReduxConnectedElement {
    constructor() {
        super(...arguments);
        this.partners = [];
    }
    static get template() {
        return html `
    <style>
      :host {
        display: block;
      }
    </style>

    <etools-prp-ajax
        id="partnerNames"
        url="[[partnerNamesUrl]]"
        params="[[params]]">
    </etools-prp-ajax>

    <etools-prp-permissions
      permissions="{{permissions}}">
    </etools-prp-permissions>
`;
    }
    static get observers() {
        return [
            '_fetchPartnerNames(partnerNamesUrl, params)'
        ];
    }
    _computePartnerNamesUrl(responsePlanID) {
        if (!responsePlanID) {
            return;
        }
        return Endpoints.clusterPartnerNames(responsePlanID);
    }
    _computeParams(clusters) {
        if (clusters) {
            return { clusters: clusters.join(',') };
        }
        return {};
    }
    _fetchPartnerNames() {
        if (!this.partnerNamesUrl) {
            return;
        }
        const self = this;
        this.$.partnerNames.abort();
        this.$.partnerNames.thunk()()
            .then((res) => {
            self.set('partners', res.data);
        })
            // @ts-ignore
            .catch((_err) => {
            // TODO: error handling
        });
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.$.partnerNames.abort();
    }
}
__decorate([
    property({ type: String, computed: '_computePartnerNamesUrl(responsePlanID)', observer: '_fetchPartnerNames' })
], PartnerDropdownContent.prototype, "partnerNamesUrl", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], PartnerDropdownContent.prototype, "responsePlanID", void 0);
__decorate([
    property({ type: Array, notify: true })
], PartnerDropdownContent.prototype, "partners", void 0);
__decorate([
    property({ type: Object, computed: '_computeParams(clusters)' })
], PartnerDropdownContent.prototype, "params", void 0);
window.customElements.define('partner-dropdown-content', PartnerDropdownContent);
export { PartnerDropdownContent as PartnerDropdownContentEl };
