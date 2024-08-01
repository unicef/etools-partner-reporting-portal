import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import Endpoints from '../../../endpoints.js';
import UtilsMixin from '../../../etools-prp-common/mixins/utils-mixin.js';
import SortingMixin from '../../../etools-prp-common/mixins/sorting-mixin.js';
import {currentProgrammeDocument} from '../../../etools-prp-common/redux/selectors/programmeDocuments.js';
import {pdAdd, pdFetch, pdSetCount, pdSetCurrent} from '../../../redux/actions/pd.js';
import './pd/pd-index.js';
import './pd/pd-router.js';
import {RootState} from '../../../typings/redux.types.js';
import {store} from '../../../redux/store.js';
import {debounce} from '@unicef-polymer/etools-utils/dist/debouncer.util.js';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util.js';
import {connect} from 'pwa-helpers';
import {EtoolsRouteDetails} from '@unicef-polymer/etools-utils/dist/interfaces/router.interfaces.js';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request.js';

@customElement('page-ip-reporting-pd')
class PageIpReportingPd extends SortingMixin(UtilsMixin(connect(store)(LitElement))) {
  static styles = css`
    :host {
      display: block;
    }
  `;

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

  @property({type: Object})
  routeDetails!: EtoolsRouteDetails;

  @property({type: Number})
  pdId!: any;

  @property({type: String})
  programmeDocumentDetailUrl = '';

  connectedCallback(): void {
    super.connectedCallback();
    this._handleInputChange = debounce(this._handleInputChange.bind(this), 100) as any;
    this._getPdRecord = debounce(this._getPdRecord.bind(this), 100) as any;
  }

  render() {
    return html`
      ${this.page === 'pd-index'
        ? html` <page-ip-reporting-pd-index name="pd-index" .route="${this.subroute}"></page-ip-reporting-pd-index> `
        : ''}
      ${this.page === 'pd-router'
        ? html` <page-ip-reporting-pd-router name="pd-router" .route="${this.subroute}"></page-ip-reporting-pd-router> `
        : ''}
    `;
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('locationId')) {
      this.programmeDocumentsUrl = this._computeProgrammeDocumentsUrl(this.locationId);
    }

    if (changedProperties.has('locationId') || changedProperties.has('pdId')) {
      this.programmeDocumentDetailUrl = this._computePdDetailsUrl(this.locationId, this.pdId);
    }

    if (changedProperties.has('programmeDocumentsUrl') || changedProperties.has('queryParams')) {
      this._handleInputChange(this.programmeDocumentsUrl);
    }

    if (changedProperties.has('programmeDocumentDetailUrl')) {
      this._getPdRecord();
    }
  }

  stateChanged(state: RootState) {
    if (
      state.app?.routeDetails?.queryParams &&
      !isJsonStrMatch(this.routeDetails, state.app.routeDetails.queryParams)
    ) {
      this.queryParams = state.app?.routeDetails.queryParams;
    }

    if (this.currentPD !== currentProgrammeDocument(state)) {
      this.currentPD = currentProgrammeDocument(state);
    }

    if (this.locationId !== state.location.id) {
      this.locationId = state.location.id;
    }

    if (state.app.routeDetails && !isJsonStrMatch(this.routeDetails, state.app.routeDetails)) {
      this.routeDetails = state.app.routeDetails;
      this._routePdIdChanged(state.app.routeDetails.params?.pdID);
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

  _handleInputChange(programmeDocumentsUrl: string) {
    if (!programmeDocumentsUrl) {
      return;
    }

    // @dci need this to avoid re-getting data when not necessary ???
    // if (this.routeDetails?.subRouteName) {
    //   return;
    // }
    store.dispatch(
      pdFetch(
        sendRequest({
          method: 'GET',
          endpoint: {url: this.programmeDocumentsUrl},
          params: {
            page: 1,
            page_size: 10,
            ...this.queryParams
          }
        })
      )
    );
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

    const rootState = store.getState();
    const pdDataIsLoaded = rootState.programmeDocuments.all.find((x) => String(x.id) === String(this.pdId));
    if (pdDataIsLoaded) {
      return;
    }

    sendRequest({
      method: 'GET',
      endpoint: {url: this.programmeDocumentsUrl}
    })
      .then((res) => {
        store.dispatch(pdAdd(res));
        store.dispatch(pdSetCount(++rootState.programmeDocuments.all.length));
      })
      .catch((err) => {
        console.log(err);
      });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }
}

export {PageIpReportingPd as PageIpReportingPdEl};
