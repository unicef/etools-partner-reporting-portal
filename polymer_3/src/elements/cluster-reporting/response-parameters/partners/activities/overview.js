var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import '@polymer/polymer/lib/elements/dom-if';
import '../../../../cluster-reporting/planned-action/activities/editing-modal';
import '../../../../page-body';
import LocalizeMixin from '../../../../../mixins/localize-mixin';
import '../../../activity-details';
import '../../../../etools-prp-permissions';
import { buttonsStyles } from '../../../../../styles/buttons-styles';
/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 */
class RpPartnerActivityDetailsOverview extends LocalizeMixin(ReduxConnectedElement) {
    static get template() {
        return html `
    ${buttonsStyles}
    <style>
      :host {
        display: block;
      }
      div#action {
        margin: 25px 0;
        @apply --layout-horizontal;
        @apply --layout-end-justified;
      }
    </style>

    <etools-prp-permissions
      permissions="{{permissions}}">
    </etools-prp-permissions>

    <page-body>
      <template
        is="dom-if"
        if="[[_canEditActivity(permissions, activityData)]]"
        restamp="true">
        <div id="action">
          <paper-button id="add" on-tap="_openModal" class="btn-primary" raised>
            [[localize('edit_activity')]]
          </paper-button>
        </div>
        <planned-action-activity-editing-modal
          id="modal"
          edit-data=[[activityData]]>
        </planned-action-activity-editing-modal>
      </template>
      <activity-details-display activity-data=[[activityData]]></activity-details-display>
    </page-body>
    `;
    }
    _openModal() {
        this.shadowRoot.querySelector('#modal').open();
    }
    _canEditActivity(permissions, activityData) {
        if (!permissions || !activityData) {
            return;
        }
        if (activityData.cluster) {
            return permissions.createPartnerEntitiesByResponsePlan([activityData.cluster]);
        }
        return false;
    }
}
__decorate([
    property({ type: Object })
], RpPartnerActivityDetailsOverview.prototype, "activityData", void 0);
__decorate([
    property({ type: Object, computed: 'getReduxStateObject(rootState.responsePlans.current)' })
], RpPartnerActivityDetailsOverview.prototype, "responsePlanCurrent", void 0);
window.customElements.define('rp-partner-activity-details-overview', RpPartnerActivityDetailsOverview);
export { RpPartnerActivityDetailsOverview as RpPartnerActivityDetailsOverviewEl };
