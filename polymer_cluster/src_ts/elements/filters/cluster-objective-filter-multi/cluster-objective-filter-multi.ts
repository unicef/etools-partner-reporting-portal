import {ReduxConnectedElement} from '../../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '../dropdown-filter/dropdown-filter-multi';
import {EtoolsPrpAjaxEl} from '../../../etools-prp-common/elements/etools-prp-ajax';
import LocalizeMixin from '../../../etools-prp-common/mixins/localize-mixin';
import FilterDependenciesMixin from '../../../etools-prp-common/mixins/filter-dependencies-mixin';
import Endpoints from '../../../etools-prp-common/endpoints';
import {GenericObject} from '../../../etools-prp-common/typings/globals.types';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';

/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 * @appliesMixin FilterDependenciesMixin
 */
class ClusterObjectiveFilterMulti extends LocalizeMixin(FilterDependenciesMixin(ReduxConnectedElement)) {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>

      <iron-location query="{{query}}"> </iron-location>

      <iron-query-params params-string="{{query}}" params-object="{{queryParams}}"> </iron-query-params>

      <etools-prp-ajax id="objectives" url="[[objectivesUrl]]" params="[[objectivesParams]]"> </etools-prp-ajax>

      <dropdown-filter-multi
        label="[[localize('cluster_objective')]]"
        name="cluster_objectives"
        value="[[value]]"
        data="[[data]]"
        disabled="[[pending]]"
      >
      </dropdown-filter-multi>
    `;
  }

  @property({type: String, computed: '_computeObjectivesUrl(responsePlanId)'})
  objectivesUrl!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanId!: string;

  @property({type: Array})
  data = [];

  @property({type: Object, computed: '_computeObjectivesParams(params)'})
  objectivesParams!: GenericObject;

  @property({type: String})
  value!: string;

  @property({type: Boolean})
  pending = false;

  private _debouncer!: Debouncer;

  static get observers() {
    return ['_fetchObjectives(objectivesParams, objectivesUrl)'];
  }

  _computeObjectivesUrl(responsePlanId: string) {
    if (!responsePlanId) {
      return;
    }
    return Endpoints.responseParametersClusterObjectives(responsePlanId);
  }

  _computeObjectivesParams(params: GenericObject) {
    const objectivesParams: GenericObject = {
      page_size: 99999
    };

    if (params.clusters) {
      objectivesParams.cluster_ids = params.clusters;
    }

    return objectivesParams;
  }

  _fetchObjectives() {
    if (!this.objectivesParams || !this.objectivesUrl) {
      return;
    }

    this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(250), () => {
      const thunk = (this.$.objectives as EtoolsPrpAjaxEl).thunk();
      this.set('pending', true);

      (this.$.objectives as EtoolsPrpAjaxEl).abort();

      thunk()
        .then((res: any) => {
          this.set('pending', false);
          this.set('data', res.data.results);
        })
        .catch((_err: GenericObject) => {
          // TODO: error handling
          this.set('pending', false);
        });
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._debouncer && this._debouncer.isActive()) {
      this._debouncer.cancel();
    }
  }
}

window.customElements.define('cluster-objective-filter-multi', ClusterObjectiveFilterMulti);
