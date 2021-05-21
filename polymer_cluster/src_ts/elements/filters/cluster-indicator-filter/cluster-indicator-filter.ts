import {ReduxConnectedElement} from '../../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '../dropdown-filter/searchable-dropdown-filter';
import '../../../etools-prp-common/elements/etools-prp-ajax';
import '../../../etools-prp-common/endpoints';
import LocalizeMixin from '../../../etools-prp-common/mixins/localize-mixin';
import Endpoints from '../../../etools-prp-common/endpoints';
import {EtoolsPrpAjaxEl} from '../../../etools-prp-common/elements/etools-prp-ajax';
import {GenericObject} from '../../../etools-prp-common/typings/globals.types';

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

      <etools-prp-ajax id="indicatorNames" url="[[indicatorNamesUrl]]"> </etools-prp-ajax>

      <searchable-dropdown-filter label="[[localize('indicator')]]" name="indicator" value="[[value]]" data="[[data]]">
      </searchable-dropdown-filter>
    `;
  }

  @property({type: String, computed: '_computeIndicatorNamesUrl(responsePlanId)', observer: '_fetchIndicatorNames'})
  indicatorNamesUrl!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanId!: string;

  @property({type: Array})
  data = [];

  @property({type: String})
  value!: string;

  _computeIndicatorNamesUrl(responsePlanId: string) {
    if (!responsePlanId) {
      return;
    }
    return Endpoints.clusterIndicatorNames(responsePlanId);
  }

  _fetchIndicatorNames() {
    if (!this.indicatorNamesUrl) {
      return;
    }

    const thunk = (this.$.indicatorNames as EtoolsPrpAjaxEl).thunk();
    (this.$.indicatorNames as EtoolsPrpAjaxEl).abort();

    thunk()
      .then((res: any) => {
        this.set(
          'data',
          [
            {
              id: '',
              title: 'All'
            }
          ].concat(res.data || [])
        );
      })
      .catch((_err: GenericObject) => {
        // TODO: error handling
      });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    (this.$.indicatorNames as EtoolsPrpAjaxEl).abort();
  }
}

window.customElements.define('cluster-indicator-filter', ClusterIndicatorFilter);
