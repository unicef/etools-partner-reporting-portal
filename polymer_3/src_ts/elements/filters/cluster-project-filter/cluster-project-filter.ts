import {html} from '@polymer/polymer';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '../dropdown-filter/dropdown-filter-multi';
import {EtoolsPrpAjaxEl} from '../../etools-prp-ajax';
import LocalizeMixin from '../../../mixins/localize-mixin';
import {ReduxConnectedElement} from ''../../../ ReduxConnectedElement';
import Endpoints from "../../../endpoints";
import FilterDependenciesMixin from '../../../mixins/filter-dependencies-mixin';
import {GenericObject} from '../../../typings/globals.types';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';


/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 * @appliesMixin FilterDependenciesMixin
 */
class ClusterProjectFilter extends LocalizeMixin(FilterDependenciesMixin(ReduxConnectedElement)) {
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
        id="projectNames"
        url="[[projectNamesUrl]]"
        params="[[params]]">
    </etools-prp-ajax>

    <searchable-dropdown-filter
        label="[[localize('project')]]"
        name="project"
        value="[[value]]"
        data="[[data]]">
    </searchable-dropdown-filter>
  `;
  }

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: String, computed: '_computeProjectNamesUrl(responsePlanID)'})
  projectNamesUrl = '';

  @property({type: String, computed: 'getReduxStateValue(state.responsePlans.currentID)'})
  responsePlanId!: string;

  @property({type: Array})
  data = [];

  @property({type: String})
  value!: string;

  static get observers() {
    return ['_fetchProjectNames(projectNamesUrl, params)'];
  }

  _computeProjectNamesUrl(responsePlanID: string) {
    return Endpoints.clusterProjectNames(responsePlanID);
  };

  _fetchProjectNames() {
    this._debouncer = Polymer.Debouncer.debounce('fetch-project-names',
      Polymer.Async.timeOut.after(250),
      function() {
        var self = this;
        const thunk = (this.$.projectNames as EtoolsPrpAjaxEl).thunk();
        (this.$.projectNames as EtoolsPrpAjaxEl).abort();

        thunk()
          .then(function(res: any) {
            self.set('data', [{
              id: '',
              title: 'All',
            }].concat(res.data));
          })
          .catch(function(err: any) { // jshint ignore:line
            // TODO: error handling
          });
      }, 100);
  };

  detached() {
    (this.$.projectNames as EtoolsPrpAjaxEl).abort();

    if (Debouncer.isActive('fetch-project-names')) {
      Debouncer.cancel('fetch-project-names');
    }
  };
}

window.customElements.define('cluster-project-filter', ClusterProjectFilter);
