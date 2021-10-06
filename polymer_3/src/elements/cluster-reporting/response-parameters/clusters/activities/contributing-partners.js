var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '../../../../page-body';
import Endpoints from '../../../../../endpoints';
import './contributing-partners-filters';
import './contributing-partners-list';
import UtilsMixin from '../../../../../mixins/utils-mixin';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';
import { ReduxConnectedElement } from '../../../../../ReduxConnectedElement';
import { clusterActivitiesPartnersFetch } from '../../../../../redux/actions/clusterActivities';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
class ContributingPartners extends UtilsMixin(ReduxConnectedElement) {
    static get template() {
        // language=HTML
        return html `
    <style>
      :host {
        display: block;
      }
    </style>

    <iron-location
        query="{{query}}">
    </iron-location>

    <iron-query-params
        params-string="{{query}}"
        params-object="{{queryParams}}">
    </iron-query-params>

    <etools-prp-ajax
        id="partners"
        url="[[partnersUrl]]"
        params="[[queryParams]]">
    </etools-prp-ajax>

    <page-body>
      <cluster-activities-contributing-partners-filters>
      </cluster-activities-contributing-partners-filters>

      <contributing-partners-list
        activity-id=[[activityId]]>
      </contributing-partners-list>
    </page-body>
    `;
    }
    _computePartnersUrl(activityId) {
        return Endpoints.partnersByClusterActivityId(activityId);
    }
    _fetchPartners() {
        this._fetchPartnersDebouncer = Debouncer.debounce(this._fetchPartnersDebouncer, timeOut.after(300), () => {
            const thunk = this.$.partners.thunk();
            this.$.partners.abort();
            this.reduxStore.dispatch(clusterActivitiesPartnersFetch(thunk, this.activityId))
                // @ts-ignore
                .catch((_err) => {
                // TODO: error handling.
            });
        });
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.$.partners.abort();
        if (this._fetchPartnersDebouncer && this._fetchPartnersDebouncer.isActive()) {
            this._fetchPartnersDebouncer.cancel();
        }
    }
}
__decorate([
    property({ type: String })
], ContributingPartners.prototype, "activityId", void 0);
__decorate([
    property({ type: Object, observer: '_fetchPartners' })
], ContributingPartners.prototype, "allPartners", void 0);
__decorate([
    property({ type: String, computed: '_computePartnersUrl(activityId)' })
], ContributingPartners.prototype, "partnersUrl", void 0);
window.customElements.define('rp-clusters-activity-contributing-partners', ContributingPartners);
export { ContributingPartners as RpClustersActivityContributingPartnersEl };
