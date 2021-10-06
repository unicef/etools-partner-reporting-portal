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
import '../../../planned-action/projects/creation-modal';
import '../../../../page-body';
import '../../../project-details';
import '../../../../etools-prp-permissions';
import { buttonsStyles } from '../../../../../styles/buttons-styles';
import LocalizeMixin from '../../../../../mixins/localize-mixin';
/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 */
class RpPartnerProjectDetailsOverview extends LocalizeMixin(ReduxConnectedElement) {
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
      permissions="{{ permissions }}">
    </etools-prp-permissions>

    <page-body>
      <template
        is="dom-if"
        if="[[_canEdit(permissions, projectData)]]"
        restamp="true">
        <div id="action">
          <paper-button id="edit" on-tap="_openModal" class="btn-primary" raised>
            [[localize('edit_project')]]
          </paper-button>
        </div>
        <planned-action-projects-modal
          id="modal"
          edit-data="[[projectData]]"
          edit>
        </planned-action-projects-modal>
      </template>

      <project-details-display project-data=[[projectData]]></project-details-display>
    </page-body>
    `;
    }
    _openModal() {
        this.shadowRoot.querySelector('#modal').open();
    }
    _canEdit(permissions, projectData) {
        if (!permissions || !projectData) {
            return;
        }
        return projectData.clusters ?
            permissions.editPartnerEntities(projectData.clusters) :
            false;
    }
}
__decorate([
    property({ type: Object })
], RpPartnerProjectDetailsOverview.prototype, "projectData", void 0);
__decorate([
    property({ type: Object, computed: 'getReduxStateObject(rootState.responsePlans.current)' })
], RpPartnerProjectDetailsOverview.prototype, "responsePlanCurrent", void 0);
window.customElements.define('rp-partner-project-details-overview', RpPartnerProjectDetailsOverview);
export { RpPartnerProjectDetailsOverview as RpPartnerProjectDetailsOverviewEl };
