import {ReduxConnectedElement} from '../../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '../dropdown-filter/searchable-dropdown-filter';
import '../../../etools-prp-common/elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../../etools-prp-common/elements/etools-prp-ajax';
import UtilsMixin from '../../../etools-prp-common/mixins/utils-mixin';
import FilterMixin from '../../../etools-prp-common/mixins/filter-mixin';
import Endpoints from '../../../endpoints';
import FilterDependenciesMixin from '../../../etools-prp-common/mixins/filter-dependencies-mixin';
import {GenericObject} from '../../../etools-prp-common/typings/globals.types';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin FilterMixin
 * @appliesMixin FilterDependenciesMixin
 */
class ClusterActivityFilter extends UtilsMixin(FilterMixin(FilterDependenciesMixin(ReduxConnectedElement))) {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>

      <iron-location query="{{query}}"> </iron-location>

      <iron-query-params params-string="{{query}}" params-object="{{queryParams}}"> </iron-query-params>

      <etools-prp-ajax id="activities" url="[[activitiesUrl]]" params="[[params]]"> </etools-prp-ajax>

      <searchable-dropdown-filter label="Activity" name="activity" value="[[value]]" data="[[data]]">
      </searchable-dropdown-filter>
    `;
  }

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: String, computed: '_computeActivitiesUrl(responsePlanId)'})
  activitiesUrl = '';

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanId!: string;

  @property({type: Array})
  data = [];

  @property({type: Object})
  defaultParams = {page_size: 99999};

  @property({type: String})
  value!: string;

  static get observers() {
    return ['_fetchActivities(activitiesUrl, params)'];
  }

  private _debouncer!: Debouncer;

  _computeActivitiesUrl(responsePlanId: string) {
    if (!responsePlanId) {
      return;
    }
    return Endpoints.partnerActivityList(responsePlanId);
  }

  _fetchActivities() {
    this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(250), () => {
      // activities.abort();
      (this.$.activities as EtoolsPrpAjaxEl).abort();
      (this.$.activities as EtoolsPrpAjaxEl)
        .thunk()()
        .then((res: any) => {
          this.set(
            'data',
            [
              {
                id: '',
                title: 'All'
              }
            ].concat(res.data.results || [])
          );
        })
        // @ts-ignore
        .catch(function (err: any) {
          console.log(err);
        });
    });
  }

  disconnectedCallback() {
    super.connectedCallback();

    (this.$.activities as EtoolsPrpAjaxEl).abort();

    if (this._debouncer && this._debouncer.isActive()) {
      this._debouncer.cancel();
    }
  }
}

window.customElements.define('cluster-activity-filter', ClusterActivityFilter);
