var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '../dropdown-filter/dropdown-filter-multi';
import '../../etools-prp-ajax';
import Endpoints from '../../../endpoints';
/**
 * @polymer
 * @customElement
 */
class PartnerProjectFilterMulti extends ReduxConnectedElement {
    constructor() {
        super(...arguments);
        this.data = [];
    }
    static get template() {
        return html `
    <style>
      :host {
        display: block;
      }
    </style>

    <etools-prp-ajax
        id="partnerProjects"
        url="[[partnerProjectsUrl]]">
    </etools-prp-ajax>

    <dropdown-filter-multi
        label="Partner Projects"
        name="partner_projects"
        value="[[value]]"
        data="[[data]]">
    </dropdown-filter-multi>
  `;
    }
    _computePartnerProjectsUrl(responsePlanId) {
        if (!responsePlanId) {
            return;
        }
        return Endpoints.plannedActions(responsePlanId);
    }
    _fetchPartnerProjects() {
        if (!this.partnerProjectsUrl) {
            return;
        }
        const self = this;
        this.$.partnerProjects.abort();
        this.$.partnerProjects.thunk()()
            .then((res) => {
            self.set('data', res.data.results);
        })
            .catch((_err) => {
            // TODO: error handling
        });
    }
    disconnectedCallback() {
        super.connectedCallback();
        this.$.partnerProjects.abort();
    }
}
__decorate([
    property({ type: String, computed: '_computePartnerProjectsUrl(responsePlanId)', observer: '_fetchPartnerProjects' })
], PartnerProjectFilterMulti.prototype, "partnerProjectsUrl", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], PartnerProjectFilterMulti.prototype, "responsePlanId", void 0);
__decorate([
    property({ type: String })
], PartnerProjectFilterMulti.prototype, "value", void 0);
__decorate([
    property({ type: Array })
], PartnerProjectFilterMulti.prototype, "data", void 0);
window.customElements.define('partner-project-filter-multi', PartnerProjectFilterMulti);
