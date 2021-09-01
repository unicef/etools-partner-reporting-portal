import {ReduxConnectedElement} from '../../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
// import '@polymer/paper-material/paper-material';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';

import '../../../etools-prp-common/elements/page-header';
import '../../../etools-prp-common/elements/page-body';
import '../../../etools-prp-common/elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../../etools-prp-common/elements/etools-prp-ajax';
import '../../../elements/ip-reporting/indicators-filters';
import '../../../elements/ip-reporting/indicators-toolbar';
import '../../../elements/list-view-indicators';
import Endpoints from '../../../endpoints';

import SortingMixin from '../../../etools-prp-common/mixins/sorting-mixin';
import LocalizeMixin from '../../../etools-prp-common/mixins/localize-mixin';
import {GenericObject} from '../../../etools-prp-common/typings/globals.types';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import {fetchIndicators} from '../../../redux/actions/indicators';

/**
 * @polymer
 * @customElement
 * @appliesMixin SortingMixin
 * @appliesMixin LocalizeMixin
 */
class PageIpReportingIndicators extends LocalizeMixin(SortingMixin(ReduxConnectedElement)) {
  public static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>

      <iron-location query="{{query}}"> </iron-location>

      <iron-query-params params-string="{{query}}" params-object="{{queryParams}}"> </iron-query-params>

      <etools-prp-ajax id="indicators" url="[[indicatorsUrl]]" params="[[queryParams]]"> </etools-prp-ajax>

      <page-header title="[[localize('indicators')]]"></page-header>
      <page-body>
        <indicators-filters></indicators-filters>
        <indicators-toolbar></indicators-toolbar>
        <list-view-indicators data="[[data]]" total-results="[[totalResults]]"> </list-view-indicators>
      </page-body>
    `;
  }

  @property({type: Array, computed: 'getReduxStateArray(rootState.indicators.all)'})
  data!: GenericObject[];

  @property({type: Boolean, computed: 'getReduxStateValue(rootState.indicators.loading)'})
  loading!: boolean;

  @property({type: Number, computed: 'getReduxStateValue(rootState.indicators.count)'})
  totalResults!: number;

  @property({type: String, computed: 'getReduxStateValue(rootState.location.id)'})
  workspaceId!: string;

  @property({type: String, computed: '_computeIndicatorsUrl(workspaceId)'})
  indicatorsUrl!: string;

  @property({type: String})
  query!: string;

  @property({type: Object})
  queryParams!: GenericObject;

  fetchIndicatorsDebouncer!: Debouncer | null;

  public static get observers() {
    return ['_indicatorsAjax(indicatorsUrl, queryParams)'];
  }

  _computeIndicatorsUrl(workspaceId: string) {
    return Endpoints.allPDIndicators(workspaceId);
  }

  _indicatorsAjax(_: any, queryParams: GenericObject) {
    if (!Object.keys(queryParams).length) {
      return;
    }

    this.fetchIndicatorsDebouncer = Debouncer.debounce(this.fetchIndicatorsDebouncer, timeOut.after(100), () => {
      const indicatorsThunk = (this.$.indicators as EtoolsPrpAjaxEl).thunk();

      // Cancel the pending request, if any
      (this.$.indicators as EtoolsPrpAjaxEl).abort();

      this.reduxStore
        .dispatch(fetchIndicators(indicatorsThunk))
        // @ts-ignore
        .catch((_err: GenericObject) => {
          // TODO: error handling
        });
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    if (this.fetchIndicatorsDebouncer && this.fetchIndicatorsDebouncer.isActive) {
      this.fetchIndicatorsDebouncer.cancel();
    }
  }
}

window.customElements.define('page-ip-reporting-indicators', PageIpReportingIndicators);
