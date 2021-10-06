var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '../../../page-body';
import '../../../etools-prp-permissions';
import { buttonsStyles } from '../../../../styles/buttons-styles';
import LocalizeMixin from '../../../../mixins/localize-mixin';
import '../../activity-details';
import './editing-modal';
/**
* @polymer
* @appliesMixin LocalizeMixin
*/
class PaActivityDetailsOverview extends LocalizeMixin(ReduxConnectedElement) {
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

      <template is="dom-if"
        if="[[permissions.createPartnerEntities]]"
        restamp="true">
        <planned-action-activity-editing-modal id="modal" edit-data="[[activityData]]"></planned-action-activity-editing-modal>

        <div id="action">
          <paper-button id="edit" on-tap="_openModal" class="btn-primary" raised>
            [[localize('edit_activity')]]
          </paper-button>
        </div>
      </template>

      <activity-details-display activity-data=[[activityData]]></activity-details-display>
    </page-body>
  `;
    }
    _openModal() {
        this.shadowRoot.querySelector('#modal').open();
    }
}
__decorate([
    property({ type: Object })
], PaActivityDetailsOverview.prototype, "activityData", void 0);
__decorate([
    property({ type: Object })
], PaActivityDetailsOverview.prototype, "permissions", void 0);
window.customElements.define('pa-activity-details-overview', PaActivityDetailsOverview);
export { PaActivityDetailsOverview as PaActivityDetailsOverviewEl };
