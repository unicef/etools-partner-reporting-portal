var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '../dropdown-filter/dropdown-filter';
import LocalizeMixin from '../../../mixins/localize-mixin';
import UtilsMixin from '../../../mixins/utils-mixin';
import { ReduxConnectedElement } from '../../../ReduxConnectedElement';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 * @appliesMixin UtilsMixin
 */
class ClusterIndicatorTypeFilter extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {
    static get template() {
        return html `
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
    _computeLocalizedOptions() {
        return [
            { title: this.localize('all'), id: '' },
            { title: this.localize('partner_activity'), id: 'partner_activity' },
            { title: this.localize('partner_project'), id: 'partner_project' },
            { title: this.localize('cluster_objective'), id: 'cluster_objective' },
            { title: this.localize('cluster_activity'), id: 'cluster_activity' },
        ];
    }
    _computeData(isPartner, options) {
        if (isPartner) {
            return options.filter(function (option) {
                return option.id !== 'cluster_objective';
            });
        }
        return options;
    }
    _computeRole(roles) {
        if (roles) {
            return roles.every(function (role) {
                return role.role !== 'CLUSTER_IMO';
            });
        }
    }
}
__decorate([
    property({ type: Boolean, computed: '_computeRole(currentUserRoles)' })
], ClusterIndicatorTypeFilter.prototype, "isPartner", void 0);
__decorate([
    property({ type: Array, computed: 'getReduxStateArray(rootState.userProfile.profile.prp_roles)' })
], ClusterIndicatorTypeFilter.prototype, "currentUserRoles", void 0);
__decorate([
    property({ type: Array, computed: '_computeData(isPartner, options)' })
], ClusterIndicatorTypeFilter.prototype, "data", void 0);
__decorate([
    property({ type: Array, computed: '_computeLocalizedOptions(resources)' })
], ClusterIndicatorTypeFilter.prototype, "options", void 0);
__decorate([
    property({ type: String })
], ClusterIndicatorTypeFilter.prototype, "value", void 0);
window.customElements.define('cluster-indicator-type-filter', ClusterIndicatorTypeFilter);
