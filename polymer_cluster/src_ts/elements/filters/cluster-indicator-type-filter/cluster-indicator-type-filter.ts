import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '../dropdown-filter/dropdown-filter';
import LocalizeMixin from '../../../mixins/localize-mixin';
import UtilsMixin from '../../../mixins/utils-mixin';
import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import {GenericObject} from '../../../typings/globals.types';

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
        data="[[data]]"
      >
      </dropdown-filter>
    `;
  }

  @property({type: Boolean, computed: '_computeRole(currentUserRoles)'})
  isPartner!: boolean;

  @property({type: Array, computed: 'getReduxStateArray(rootState.userProfile.profile.prp_roles)'})
  currentUserRoles!: any;

  @property({type: Array, computed: '_computeData(isPartner, options)'})
  data!: GenericObject[];

  @property({type: Array, computed: '_computeLocalizedOptions(resources)'})
  options!: any;

  @property({type: String})
  value!: string;

  _computeLocalizedOptions() {
    return [
      {title: this.localize('all'), id: ''},
      {title: this.localize('partner_activity'), id: 'partner_activity'},
      {title: this.localize('partner_project'), id: 'partner_project'},
      {title: this.localize('cluster_objective'), id: 'cluster_objective'},
      {title: this.localize('cluster_activity'), id: 'cluster_activity'}
    ];
  }

  _computeData(isPartner: boolean, options: any) {
    if (isPartner) {
      return options.filter(function (option: any) {
        return option.id !== 'cluster_objective';
      });
    }

    return options;
  }

  _computeRole(roles: any) {
    if (roles) {
      return roles.every(function (role: any) {
        return role.role !== 'CLUSTER_IMO';
      });
    }
  }
}

window.customElements.define('cluster-indicator-type-filter', ClusterIndicatorTypeFilter);
