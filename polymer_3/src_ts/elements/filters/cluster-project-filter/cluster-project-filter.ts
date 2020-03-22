import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '../dropdown-filter/searchable-dropdown-filter';
import '../../etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../etools-prp-ajax';
import LocalizeMixin from '../../../mixins/localize-mixin';
import Endpoints from '../../../endpoints';
import FilterDependenciesMixin from '../../../mixins/filter-dependencies-mixin';
import {GenericObject} from '../../../typings/globals.types';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';


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
  params!: GenericObject;

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: String, computed: '_computeProjectNamesUrl(responsePlanId)'})
  projectNamesUrl!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanId!: string;

  @property({type: Array})
  data = [];

  @property({type: String})
  value!: string;

  static get observers() {
    return ['_fetchProjectNames(projectNamesUrl, params)'];
  }

  private _debouncer!: Debouncer;

  _computeProjectNamesUrl(responsePlanId: string) {
    if (!responsePlanId) {
      return;
    }
    return Endpoints.clusterProjectNames(responsePlanId);
  }

  _fetchProjectNames() {
    if (!this.projectNamesUrl) {
      return;
    }

    const self = this;
    this._debouncer = Debouncer.debounce(this._debouncer,
      timeOut.after(250),
      function() {
        const thunk = (self.$.projectNames as EtoolsPrpAjaxEl).thunk();
        (self.$.projectNames as EtoolsPrpAjaxEl).abort();

        thunk()
          .then(function(res: any) {
            self.set('data', [{
              id: '',
              title: 'All'
            }].concat(res.data || []));
          });
        // .catch((err: any) => {
        //   // TODO: error handling
        // });
      });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    (this.$.projectNames as EtoolsPrpAjaxEl).abort();

    if (this._debouncer && this._debouncer.isActive()) {
      this._debouncer.cancel();
    }
  }

}

window.customElements.define('cluster-project-filter', ClusterProjectFilter);
