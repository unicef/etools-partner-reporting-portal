import {ReduxConnectedElement} from '../../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/app-route/app-route';
import '@polymer/iron-pages/iron-pages';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/polymer/lib/elements/dom-if';
import '../../../etools-prp-common/elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../../etools-prp-common/elements/etools-prp-ajax';
import Endpoints from '../../../endpoints';
import UtilsMixin from '../../../etools-prp-common/mixins/utils-mixin';
import SortingMixin from '../../../etools-prp-common/mixins/sorting-mixin';
import {GenericObject} from '../../../etools-prp-common/typings/globals.types';
import {currentProgrammeDocument} from '../../../etools-prp-common/redux/selectors/programmeDocuments';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import {pdFetch, pdSetCurrent} from '../../../redux/actions/pd';
import {getDomainByEnv} from '../../../etools-prp-common/config';
import './pd/pd-index';
import './pd/pd-router';
import {RootState} from '../../../typings/redux.types';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin SortingMixin
 * @appliesMixin UtilsMixin
 */
class PageIpReportingPd extends SortingMixin(UtilsMixin(ReduxConnectedElement)) {
  public static get template() {
    return html`
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

  @property({type: Object})
  query!: GenericObject;

  @property({type: Object})
  subroute!: GenericObject;

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: String, observer: '_pageChanged'})
  page!: string;

  @property({type: String, computed: '_computeProgrammeDocumentsUrl(locationId)'})
  programmeDocumentsUrl!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.location.id)'})
  locationId!: string;

  @property({type: Object, computed: '_currentProgrammeDocument(rootState)'})
  currentPD!: GenericObject;

  @property({type: Number})
  pdId!: number;

  fetchPdsDebouncer!: Debouncer | null;

  public static get observers() {
    return [
      '_handleInputChange(programmeDocumentsUrl, queryParams)',
      '_routePdIdChanged(routeData.pd_id)',
      '_routePathChanged(route.path)'
    ];
  }

  _currentProgrammeDocument(rootState: RootState) {
    return currentProgrammeDocument(rootState);
  }

  _routePdIdChanged(pd_id: number) {
    if (pd_id !== this.pdId) {
      this.reduxStore.dispatch(pdSetCurrent(pd_id));
    }

    this.page = pd_id ? 'pd-router' : 'pd-index';
  }

  _routePathChanged(path: string) {
    if (!path.length) {
      this.page = '';

      setTimeout(() => {
        this.set('route.path', '/');
      });
    }
  }

  async _pageChanged(page: string) {
    if (!page) {
      return;
    }

    const resolvedPageUrl = getDomainByEnv() + `/src/pages/app/ip-reporting/pd/${page}.js`;
    await import(resolvedPageUrl).catch((err: any) => {
      console.log(err);
      this._notFound();
    });
  }

  _computeProgrammeDocumentsUrl(locationId: string) {
    return locationId ? Endpoints.programmeDocuments(locationId) : '';
  }

  _handleInputChange(programmeDocumentsUrl: string) {
    if (!programmeDocumentsUrl) {
      return;
    }

    if (this.subroute.path) {
      // Don't refetch on child routes
      return;
    }

    this.fetchPdsDebouncer = Debouncer.debounce(this.fetchPdsDebouncer, timeOut.after(100), () => {
      const pdThunk = (this.$.programmeDocuments as EtoolsPrpAjaxEl).thunk();

      // Cancel the pending request, if any
      (this.$.programmeDocuments as EtoolsPrpAjaxEl).abort();

      this.reduxStore
        .dispatch(pdFetch(pdThunk))
        // @ts-ignore
        .catch((_err: GenericObject) => {
          // TODO: error handling
        });
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    if (this.fetchPdsDebouncer && this.fetchPdsDebouncer.isActive()) {
      this.fetchPdsDebouncer.cancel();
    }
  }
}

window.customElements.define('page-ip-reporting-pd', PageIpReportingPd);
