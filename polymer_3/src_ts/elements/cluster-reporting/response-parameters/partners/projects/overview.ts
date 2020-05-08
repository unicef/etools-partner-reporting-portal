import {ReduxConnectedElement} from '../../../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/polymer/lib/elements/dom-if';
import '../../../planned-action/projects/creation-modal';
import {PlannedActionProjectsModalEl} from '../../../planned-action/projects/creation-modal';
import '../../../../page-body';
import '../../../project-details';
import '../../../../etools-prp-permissions';
import {buttonsStyles} from '../../../../../styles/buttons-styles';
import LocalizeMixin from '../../../../../mixins/localize-mixin';
import {GenericObject} from '../../../../../typings/globals.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 */
class RpPartnerProjectDetailsOverview extends LocalizeMixin(ReduxConnectedElement) {
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

  @property({type: Object})
  projectData!: GenericObject;

  @property({type: Object, computed: 'getReduxStateObject(rootState.responsePlans.current)'})
  responsePlanCurrent!: GenericObject;

  _openModal() {
    (this.shadowRoot!.querySelector('#modal') as PlannedActionProjectsModalEl).open();
  }

  _canEdit(permissions: GenericObject, projectData: GenericObject) {
    if (!permissions || !projectData) {
      return;
    }
    return projectData.clusters ?
      permissions.editPartnerEntities(projectData.clusters) :
      false;
  }

}

window.customElements.define('rp-partner-project-details-overview', RpPartnerProjectDetailsOverview);

export {RpPartnerProjectDetailsOverview as RpPartnerProjectDetailsOverviewEl};
