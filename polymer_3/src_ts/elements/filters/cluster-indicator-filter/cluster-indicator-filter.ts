import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '../dropdown-filter/searchable-dropdown-filter';
import '../../etools-prp-ajax';
import '../../../endpoints';
import LocalizeMixin from '../../../mixins/localize-mixin';
import Endpoints from '../../../endpoints';
import {EtoolsPrpAjaxEl} from '../../etools-prp-ajax';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 */
class ClusterIndicatorFilter extends LocalizeMixin(ReduxConnectedElement) {
  static get template() {
    return html`
    <style>
      :host {
        display: block;
      }
    </style>

    <etools-prp-ajax
        id="indicatorNames"
        url="[[indicatorNamesUrl]]">
    </etools-prp-ajax>

    <searchable-dropdown-filter
        label="[[localize('indicator')]]"
        name="indicator"
        value="[[value]]"
        data="[[data]]">
    </searchable-dropdown-filter>
  `;
  }

  @property({type: String, computed: '_computeIndicatorNamesUrl(responsePlanID)', observer: '_fetchIndicatorNames'})
  indicatorNamesUrl!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanId!: string;

  @property({type: Array})
  data = [];

  @property({type: String})
  value!: string;

  _computeIndicatorNamesUrl(responsePlanId: string) {
    return Endpoints.clusterNames(responsePlanId);
  };

  _fetchIndicatorNames() {
    var self = this;
    const thunk = (this.$.indicatorNames as EtoolsPrpAjaxEl).thunk();
    (this.$.indicatorNames as EtoolsPrpAjaxEl).abort();

    thunk()
      .then(function(res: any) {
        self.set('data', [{
          id: '',
          title: 'All',
        }].concat(res.data));
      })
      .catch(function(err) {
        // TODO: error handling
      });
  };

  disconnectedCallback() {
    super.disconnectedCallback();
    (this.$.indicatorNames as EtoolsPrpAjaxEl).abort();
  };
}

window.customElements.define('cluster-indicator-filter', ClusterIndicatorFilter);
