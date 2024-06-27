import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@polymer/app-route/app-route.js';
import '@polymer/iron-pages/iron-pages.js';
import '@polymer/iron-location/iron-location.js';
import '@polymer/iron-location/iron-query-params.js';
import '../../../etools-prp-common/elements/etools-prp-ajax.js';
import {EtoolsPrpAjaxEl} from '../../../etools-prp-common/elements/etools-prp-ajax.js';
import Endpoints from '../../../endpoints.js';
import UtilsMixin from '../../../etools-prp-common/mixins/utils-mixin.js';
import SortingMixin from '../../../etools-prp-common/mixins/sorting-mixin.js';
import {currentProgrammeDocument} from '../../../etools-prp-common/redux/selectors/programmeDocuments.js';
import {pdAdd, pdFetch, pdSetCount, pdSetCurrent} from '../../../redux/actions/pd.js';
import {getDomainByEnv} from '../../../etools-prp-common/config.js';
import './pd/pd-index.js';
import './pd/pd-router.js';
import {RootState} from '../../../typings/redux.types.js';
import {store} from '../../../redux/store.js';
import {debounce} from '@unicef-polymer/etools-utils/dist/debouncer.util.js';

@customElement('page-ip-reporting-pd')
class PageIpReportingPd extends SortingMixin(UtilsMixin(LitElement)) {
  static styles = css`
    :host {
      display: block;
    }
  `;

  @property({type: Object})
  query: any = {};

  @property({type: Object})
  subroute: any = {};

  @property({type: Object})
  queryParams: any = {};

  @property({type: String})
  page = '';

  @property({type: String})
  programmeDocumentsUrl = '';

  @property({type: String})
  locationId = '';

  @property({type: Object})
  currentPD: any = {};

  @property({type: Number})
  pdId!: any;

  @property({type: String})
  programmeDocumentDetailUrl = '';

  render() {
    return html`
      <etools-prp-ajax id="programmeDocumentDetail" .url="${this.programmeDocumentDetailUrl}"></etools-prp-ajax>
      <etools-prp-ajax
        id="programmeDocuments"
        .url="${this.programmeDocumentsUrl}"
        .params="${this.queryParams}"
      ></etools-prp-ajax>
      <iron-location .query="${this.query}" @query-changed="${this._onQueryChanged}"></iron-location>
      <iron-query-params
        .paramsString="${this.query}"
        .paramsObject="${this.queryParams}"
        @params-object-changed="${this._onParamsObjectChanged}"
      ></iron-query-params>
      <app-route
        .route="${this.route}"
        pattern="/:pd_id"
        .data="${this.routeData}"
        .tail="${this.subroute}"
        @data-changed="${this._onRouteDataChanged}"
      ></app-route>
      <iron-pages .selected="${this.page}" attr-for-selected="name">
        ${this.page === 'pd-index'
          ? html` <page-ip-reporting-pd-index name="pd-index" .route="${this.subroute}"></page-ip-reporting-pd-index> `
          : ''}
        ${this.page === 'pd-router'
          ? html`
              <page-ip-reporting-pd-router name="pd-router" .route="${this.subroute}"></page-ip-reporting-pd-router>
            `
          : ''}
      </iron-pages>
    `;
  }

  updated(changedProperties) {
    if (changedProperties.has('locationId')) {
      this.programmeDocumentsUrl = this._computeProgrammeDocumentsUrl(this.locationId);
    }

    if (changedProperties.has('locationId') || changedProperties.has('pdId')) {
      this.programmeDocumentDetailUrl = this._computePdDetailsUrl(this.locationId, this.pdId);
    }

    if (changedProperties.has('programmeDocumentsUrl') || changedProperties.has('queryParams')) {
      this._handleInputChange(this.programmeDocumentsUrl);
    }

    if (changedProperties.has('routeData')) {
      this._routePdIdChanged(this.routeData.pd_id);
    }

    if (changedProperties.has('route')) {
      this._routePathChanged(this.route.path);
    }

    if (changedProperties.has('programmeDocumentDetailUrl')) {
      this._getPdRecord();
    }

    if (changedProperties.has('page')) {
      this._pageChanged(this.page);
    }
  }

  stateChanged(state: RootState) {
    if (this.currentPD !== currentProgrammeDocument(state)) {
      this.currentPD = currentProgrammeDocument(state);
    }

    if (this.locationId !== state.location.id) {
      this.locationId = state.location.id;
    }
  }

  _computeProgrammeDocumentsUrl(locationId) {
    return locationId ? Endpoints.programmeDocuments(locationId) : '';
  }

  _computePdDetailsUrl(locationId: string, pdId: string) {
    return locationId && pdId ? Endpoints.programmeDocumentDetail(locationId, pdId) : '';
  }

  _onQueryChanged(event) {
    this.query = event.detail.value;
  }

  _onParamsObjectChanged(event) {
    this.queryParams = event.detail.value;
  }

  _onRouteDataChanged(event) {
    this.routeData = event.detail.value;
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

  _handleInputChange(programmeDocumentsUrl: string) {
    if (!programmeDocumentsUrl) {
      return;
    }

    if (this.subroute.path) {
      return;
    }

    debounce(() => {
      const elem = this.shadowRoot!.getElementById('programmeDocuments') as EtoolsPrpAjaxEl;
      elem.abort();
      store.dispatch(pdFetch(elem.thunk()));
    }, 100);
  }

  _routePdIdChanged(pd_id) {
    if (pd_id && pd_id !== this.pdId) {
      this.pdId = pd_id;
      store.dispatch(pdSetCurrent(pd_id));
    }

    this.page = pd_id ? 'pd-router' : 'pd-index';
  }

  _routePathChanged(path) {
    if (!path.length) {
      this.page = '';
      setTimeout(() => {
        this.route.path = '/';
      });
    }
  }

  _getPdRecord() {
    if (!this.programmeDocumentDetailUrl) {
      return;
    }

    const pdDataIsLoaded = this.rootState.programmeDocuments.all.find((x) => String(x.id) === String(this.pdId));
    if (pdDataIsLoaded) {
      return;
    }

    debounce(() => {
      const elem = this.shadowRoot!.getElementById('programmeDocumentDetail') as EtoolsPrpAjaxEl;
      elem.abort();

      elem
        .thunk()()
        .then((res) => {
          store.dispatch(pdAdd(res.data));
          store.dispatch(pdSetCount(++this.rootState.programmeDocuments.all.length));
        })
        .catch((err) => {
          console.log(err);
        });
    }, 10);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }
}

export {PageIpReportingPd as PageIpReportingPdEl};
