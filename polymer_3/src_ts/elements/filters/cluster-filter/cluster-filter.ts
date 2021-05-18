import {ReduxConnectedElement} from '../../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '../dropdown-filter/dropdown-filter';
import '../../../etools-prp-common/elements/etools-prp-ajax';
import UtilsMixin from '../../../etools-prp-common/mixins/utils-mixin';
import FilterDependenciesMixin from '../../../mixins/filter-dependencies-mixin';
import LocalizeMixin from '../../../etools-prp-common/mixins/localize-mixin';
import Endpoints from '../../../etools-prp-common/endpoints';
import {property} from '@polymer/decorators';
import {GenericObject} from '../../../etools-prp-common/typings/globals.types';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {EtoolsPrpAjaxEl} from '../../../etools-prp-common/elements/etools-prp-ajax';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin FilterMixin
 * @appliesMixin LocalizeMixin
 */
class ClusterFilter extends LocalizeMixin(FilterDependenciesMixin(UtilsMixin(ReduxConnectedElement))) {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>

      <iron-location query="{{query}}"> </iron-location>

      <iron-query-params params-string="{{query}}" params-object="{{queryParams}}"> </iron-query-params>

      <etools-prp-ajax id="clusterNames" url="[[clusterNamesUrl]]" params="[[params]]"> </etools-prp-ajax>

      <dropdown-filter label="[[localize('cluster')]]" name="cluster_id" value="[[value]]" data="[[data]]">
      </dropdown-filter>
    `;
  }

  @property({type: String})
  query!: string;

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: String, computed: '_computeClusterNamesUrl(responsePlanId)'})
  clusterNamesUrl!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanId!: string;

  @property({type: Array})
  data = [];

  @property({type: String})
  value!: string;

  static get observers() {
    return ['_fetchClusterNames(clusterNamesUrl, params)'];
  }

  private clusterNamesDebouncer!: Debouncer;

  _computeClusterNamesUrl(responsePlanId: string) {
    if (!responsePlanId) {
      return;
    }
    return Endpoints.clusterNames(responsePlanId);
  }

  _fetchClusterNames() {
    if (!this.clusterNamesUrl || !this.params) {
      return;
    }

    this.clusterNamesDebouncer = Debouncer.debounce(this.clusterNamesDebouncer, timeOut.after(250), () => {
      (this.$.clusterNames as EtoolsPrpAjaxEl).abort();
      (this.$.clusterNames as EtoolsPrpAjaxEl)
        .thunk()()
        .then((res: any) => {
          this.set('data', [{id: '', title: 'All'}].concat(res.data || []));
        })
        .catch((_err: GenericObject) => {
          // TODO: error handling
        });
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    (this.$.clusterNames as EtoolsPrpAjaxEl).abort();

    if (this.clusterNamesDebouncer && this.clusterNamesDebouncer.isActive()) {
      this.clusterNamesDebouncer.cancel();
    }
  }
}

window.customElements.define('cluster-filter', ClusterFilter);
