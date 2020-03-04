import {ReduxConnectedElement} from '../../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import '../../../../elements/page-body';
import '../../../../elements/etools-prp-permissions';
import {buttonsStyles} from '../../../../styles/buttons-styles';
import LocalizeMixin from '../../../../mixins/localize-mixin';
import '../../project-details';
import './creation-modal';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../../../typings/globals.types';


/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 */
class Overview extends LocalizeMixin(ReduxConnectedElement){
  public static get template(){
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

  @property({type: Object})
  projectData!: GenericObject;

  @property({type: Object})
  permissions!: GenericObject;

  _canEdit(permissions: GenericObject, projectData: GenericObject) {
    return projectData.clusters ?
      permissions.editPartnerEntities(projectData.clusters) :
      false;
  }

  _openModal() {
    this.shadowRoot!.querySelector('#modal')!.open();
  }

}

window.customElements.define('pa-project-details-overview', Overview);

export {Overview as PaProjectDetailsOverviewEl};
