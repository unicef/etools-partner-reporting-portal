import {ReduxConnectedElement} from '../../../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import '../../../../etools-prp-common/elements/page-body';
import '../../../../etools-prp-common/elements/etools-prp-permissions';
import {buttonsStyles} from '../../../../etools-prp-common/styles/buttons-styles';
import LocalizeMixin from '../../../../etools-prp-common/mixins/localize-mixin';
import '../../project-details';
import './creation-modal';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../../../etools-prp-common/typings/globals.types';
import {PlannedActionProjectsModalEl} from './creation-modal';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 */
class PaProjectDetailsOverview extends LocalizeMixin(ReduxConnectedElement) {
  public static get template() {
    return html`
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

      <etools-prp-permissions permissions="{{ permissions }}"> </etools-prp-permissions>

      <page-body>
        <template is="dom-if" if="[[_canEdit(permissions, projectData)]]" restamp="true">
          <planned-action-projects-modal id="modal" edit-data="[[projectData]]" edit> </planned-action-projects-modal>

          <div id="action">
            <paper-button id="edit" on-tap="_openModal" class="btn-primary" raised>
              [[localize('edit_project')]]
            </paper-button>
          </div>
        </template>
        <project-details-display project-data="[[projectData]]"></project-details-display>
      </page-body>
    `;
  }

  @property({type: Object})
  projectData!: GenericObject;

  @property({type: Object})
  permissions!: GenericObject;

  _canEdit(permissions: GenericObject, projectData: GenericObject) {
    if (!permissions || !projectData) {
      return;
    }
    return projectData.clusters ? permissions.editPartnerEntities(projectData.clusters) : false;
  }

  _openModal() {
    (this.shadowRoot!.querySelector('#modal') as PlannedActionProjectsModalEl).open();
  }
}

window.customElements.define('pa-project-details-overview', PaProjectDetailsOverview);

export {PaProjectDetailsOverview as PaProjectDetailsOverviewEl};
