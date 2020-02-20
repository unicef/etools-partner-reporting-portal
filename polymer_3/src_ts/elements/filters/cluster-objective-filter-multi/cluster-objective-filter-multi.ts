import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '../dropdown-filter/dropdown-filter-multi';
import {EtoolsPrpAjaxEl} from '../../etools-prp-ajax';
import LocalizeMixin from '../../../mixins/localize-mixin';
import FilterDependenciesMixin from '../../../mixins/filter-dependencies-mixin';
import {ReduxConnectedElement} from "../../../ReduxConnectedElement";
import Endpoints from '../../../endpoints';
import {GenericObject} from '../../../typings/globals.types';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';

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

    <iron-location
        query="{{query}}">
    </iron-location>

    <iron-query-params
        params-string="{{query}}"
        params-object="{{queryParams}}">
    </iron-query-params>

    <etools-prp-ajax
        id="objectives"
        url="[[objectivesUrl]]"
        params="[[objectivesParams]]">
    </etools-prp-ajax>

    <dropdown-filter-multi
        label="[[localize('cluster_objective')]]"
        name="cluster_objectives"
        value="[[value]]"
        data="[[data]]"
        disabled="[[pending]]">
    </dropdown-filter-multi>
  `;
  }


  @property({type: String, computed: '_computeObjectivesUrl(responsePlanId)'})
  objectivesUrl!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanId!: string;

  @property({type: Array})
  data = [];

  @property({type: Object, computed: '_computeObjectivesParams(params)', observer: '_fetchObjectives'})
  objectivesParams!: GenericObject;

  @property({type: String})
  value!: string;

  @property({type: Boolean})
  pending = false;

  _computeObjectivesUrl(responsePlanId: string) {
    return Endpoints.responseParametersClusterObjectives(responsePlanId);
  },

  _computeObjectivesParams(params: GenericObject) {
    var objectivesParams = {
      page_size: 99999,
    };

    if (params.clusters) {
      objectivesParams.cluster_ids = params.clusters;
    }

    return objectivesParams;
  };

  private _debouncer!: Debouncer;

  _fetchObjectives() {
    this._debouncer = Debouncer.debounce(this._debouncer,
     timeOut.after(250),
      function() {
        var self = this;
        const thunk = (this.$.objectives as EtoolsPrpAjaxEl).thunk();
        this.set('pending', true);

        (this.$.objectives as EtoolsPrpAjaxEl).abort();

        thunk()
          .then(function(res: any) {
            self.set('pending', false);
            self.set('data', res.data.results);
          })
          .catch(function(err: any) { // jshint ignore:line
            // TODO: error handling
            self.set('pending', false);
          });
      });
  };

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._debouncer.isActive()) {
      this._debouncer.cancel();
    }
  },
}

window.customElements.define('cluster-objective-filter-multi', ClusterObjectiveFilterMulti);
