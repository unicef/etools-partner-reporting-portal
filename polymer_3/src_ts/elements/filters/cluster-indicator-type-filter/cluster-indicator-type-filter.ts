import {html} from '@polymer/polymer';
import '../dropdown-filter/dropdown - filter - multi'
import {store} from "../../../redux/store"
import LocalizeMixin from '../../../mixins/localize-mixin';
import UtilsMixin from '../../../mixins/utils-mixin';
import {ReduxConnectedElement} from '../../../ ReduxConnectedElement';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 * @appliesMixin UtilsMixin
 */
class ClusterIndicatorTypeFilter extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {
  static get template() {
    return html`
    <style>
      :host {
        display: block;
      }
    </style>

    <dropdown-filter
      label="[[localize('indicator_type')]]"
      name="indicator_type"
      value="[[_withDefault(value, '')]]"
      data="[[data]]">
    </dropdown-filter>
  `;
  }

  @property({type: Boolean, computed: '_computeRole(currentUserRoles)'})
  isPartner!: boolean;

  @property({type: Array, computed: 'getReduxStateArray(state.userProfile.profile.prp_roles)'})
  currentUserRoles!: any;

  @property({type: Array})
  data = [];

  @property({type: Array, computed: '_computeLocalizedOptions(localize)'})
  options!: any;

  @property({type: String})
  value!: string;

  _computeLocalizedOptions(localize: any) {
    var options = [
      {title: localize('all'), id: ''},
      {title: localize('partner_activity'), id: 'partner_activity'},
      {title: localize('partner_project'), id: 'partner_project'},
      {title: localize('cluster_objective'), id: 'cluster_objective'},
      {title: localize('cluster_activity'), id: 'cluster_activity'},
    ];

    return options;
  };

  _computeData(isPartner: boolean, options: any) {
    if (isPartner) {
      return options.filter(function(option: any) {
        return option.id !== 'cluster_objective';
      });
    }

    return options;
  },

  _computeRole(roles: any) {
    return roles.every(function(role: any) {
      return role.role !== 'CLUSTER_IMO';
    });
  },
}

window.customElements.define('cluster-indicator-type-filter', ClusterIndicatorTypeFilter);
