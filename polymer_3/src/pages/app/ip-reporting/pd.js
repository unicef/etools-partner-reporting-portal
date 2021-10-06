var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../etools-prp-common/ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/app-route/app-route';
import '@polymer/iron-pages/iron-pages';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/polymer/lib/elements/dom-if';
import '../../../etools-prp-common/elements/etools-prp-ajax';
import Endpoints from '../../../endpoints';
import UtilsMixin from '../../../etools-prp-common/mixins/utils-mixin';
import SortingMixin from '../../../etools-prp-common/mixins/sorting-mixin';
import { currentProgrammeDocument } from '../../../etools-prp-common/redux/selectors/programmeDocuments';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';
import { pdFetch, pdSetCurrent } from '../../../redux/actions/pd';
import { getDomainByEnv } from '../../../etools-prp-common/config';
import './pd/pd-index';
import './pd/pd-router';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin SortingMixin
 * @appliesMixin UtilsMixin
 */
class PageIpReportingPd extends SortingMixin(UtilsMixin(ReduxConnectedElement)) {
    static get template() {
        return html `
      <style>
        :host {
          display: block;
        }
      </style>

      <etools-prp-ajax id="programmeDocuments" url="[[programmeDocumentsUrl]]" params="[[queryParams]]">
      </etools-prp-ajax>

      <iron-location query="{{query}}"> </iron-location>

      <iron-query-params params-string="{{query}}" params-object="{{queryParams}}"> </iron-query-params>

      <app-route route="{{route}}" pattern="/:pd_id" data="{{routeData}}" tail="{{subroute}}"> </app-route>

      <iron-pages selected="[[page]]" attr-for-selected="name">
        <template is="dom-if" if="[[_equals(page, 'pd-index')]]" restamp="true">
          <page-ip-reporting-pd-index name="pd-index" route="{{subroute}}"> </page-ip-reporting-pd-index>
        </template>

        <template is="dom-if" if="[[_equals(page, 'pd-router')]]" restamp="true">
          <page-ip-reporting-pd-router name="pd-router" route="{{subroute}}"> </page-ip-reporting-pd-router>
        </template>
      </iron-pages>
    `;
    }
    static get observers() {
        return [
            '_handleInputChange(programmeDocumentsUrl, queryParams)',
            '_routePdIdChanged(routeData.pd_id)',
            '_routePathChanged(route.path)'
        ];
    }
    _currentProgrammeDocument(rootState) {
        return currentProgrammeDocument(rootState);
    }
    _routePdIdChanged(pd_id) {
        if (pd_id !== this.pdId) {
            this.reduxStore.dispatch(pdSetCurrent(pd_id));
        }
        this.page = pd_id ? 'pd-router' : 'pd-index';
    }
    _routePathChanged(path) {
        if (!path.length) {
            this.page = '';
            setTimeout(() => {
                this.set('route.path', '/');
            });
        }
    }
    async _pageChanged(page) {
        if (!page) {
            return;
        }
        const resolvedPageUrl = getDomainByEnv() + `/src/pages/app/ip-reporting/pd/${page}.js`;
        await import(resolvedPageUrl).catch((err) => {
            console.log(err);
            this._notFound();
        });
    }
    _computeProgrammeDocumentsUrl(locationId) {
        return locationId ? Endpoints.programmeDocuments(locationId) : '';
    }
    _handleInputChange(programmeDocumentsUrl) {
        if (!programmeDocumentsUrl) {
            return;
        }
        if (this.subroute.path && this.currentPD && typeof this.currentPD.id !== 'undefined') {
            // Don't refetch on child routes, unless navigated to directly.
            return;
        }
        this.fetchPdsDebouncer = Debouncer.debounce(this.fetchPdsDebouncer, timeOut.after(100), () => {
            const pdThunk = this.$.programmeDocuments.thunk();
            // Cancel the pending request, if any
            this.$.programmeDocuments.abort();
            this.reduxStore
                .dispatch(pdFetch(pdThunk))
                // @ts-ignore
                .catch((_err) => {
                // TODO: error handling
            });
        });
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.fetchPdsDebouncer && this.fetchPdsDebouncer.isActive) {
            this.fetchPdsDebouncer.cancel();
        }
    }
}
__decorate([
    property({ type: Object })
], PageIpReportingPd.prototype, "query", void 0);
__decorate([
    property({ type: Object })
], PageIpReportingPd.prototype, "subroute", void 0);
__decorate([
    property({ type: Object })
], PageIpReportingPd.prototype, "queryParams", void 0);
__decorate([
    property({ type: String, observer: '_pageChanged' })
], PageIpReportingPd.prototype, "page", void 0);
__decorate([
    property({ type: String, computed: '_computeProgrammeDocumentsUrl(locationId)' })
], PageIpReportingPd.prototype, "programmeDocumentsUrl", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.location.id)' })
], PageIpReportingPd.prototype, "locationId", void 0);
__decorate([
    property({ type: Object, computed: '_currentProgrammeDocument(rootState)' })
], PageIpReportingPd.prototype, "currentPD", void 0);
__decorate([
    property({ type: Number })
], PageIpReportingPd.prototype, "pdId", void 0);
window.customElements.define('page-ip-reporting-pd', PageIpReportingPd);
