var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import '../../../../elements/page-body';
import '../../../../elements/etools-prp-permissions';
import { buttonsStyles } from '../../../../styles/buttons-styles';
import LocalizeMixin from '../../../../mixins/localize-mixin';
import '../../project-details';
import './creation-modal';
import { property } from '@polymer/decorators/lib/decorators';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 */
class PaProjectDetailsOverview extends LocalizeMixin(ReduxConnectedElement) {
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
        <template is="dom-if"
                  if="[[_canEdit(permissions, projectData)]]"
                  restamp="true">
          <planned-action-projects-modal
            id="modal"
            edit-data="[[projectData]]"
            edit>
          </planned-action-projects-modal>


          <div id="action">
            <paper-button id="edit" on-tap="_openModal" class="btn-primary" raised>
              [[localize('edit_project')]]
            </paper-button>
          </div>
        </template>
        <project-details-display project-data=[[projectData]]></project-details-display>
      </page-body>

    `;
    }
    _canEdit(permissions, projectData) {
        if (!permissions || !projectData) {
            return;
        }
        return projectData.clusters ?
            permissions.editPartnerEntities(projectData.clusters) :
            false;
    }
    _openModal() {
        this.shadowRoot.querySelector('#modal').open();
    }
}
__decorate([
    property({ type: Object })
], PaProjectDetailsOverview.prototype, "projectData", void 0);
__decorate([
    property({ type: Object })
], PaProjectDetailsOverview.prototype, "permissions", void 0);
window.customElements.define('pa-project-details-overview', PaProjectDetailsOverview);
export { PaProjectDetailsOverview as PaProjectDetailsOverviewEl };
