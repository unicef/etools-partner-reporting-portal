import {html} from '@polymer/polymer';
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../etools-prp-common/typings/globals.types';
import {ReduxConnectedElement} from '../etools-prp-common/ReduxConnectedElement';
import '../etools-prp-common/elements/etools-prp-ajax';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {EtoolsPrpAjaxEl} from '../etools-prp-common/elements/etools-prp-ajax';
import {BASE_PATH} from '../etools-prp-common/config';
import LocalizeMixin from '../etools-prp-common/mixins/localize-mixin';
import Endpoints from '../etools-prp-common/endpoints';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 */
class OrganizationDropdown extends LocalizeMixin(ReduxConnectedElement) {
  public static get template() {
    return html` <style>
        #organizationSelector {
          width: 170px;
        }
        etools-dropdown {
          --paper-listbox: {
            max-height: 600px;
          }

          --esmm-icons: {
            color: var(--theme-primary-text-color-medium);
            cursor: pointer;
          }

          --paper-input-container-underline: {
            display: none;
          }

          --paper-input-container-underline-focus: {
            display: none;
          }

          --paper-input-container-underline-disabled: {
            display: none;
          }

          --paper-input-container-shared-input-style: {
            color: var(--theme-primary-text-color-medium);
            cursor: pointer;
            font-size: 16px;
            text-align: right;
            width: 100%;
          }

          --paper-menu-button-dropdown: {
            max-height: 380px;
          }
        }
        etools-dropdown.warning {
          --paper-input-container: {
            padding-left: 3px;
            box-sizing: border-box;
            box-shadow: inset 0px 0px 0px 1.5px red;
          }
        }
      </style>

      <etools-prp-ajax
        id="changeorganization"
        method="post"
        url="[[changeorganizationUrl]]"
        body="[[organizationData]]"
        content-type="application/json"
      >
      </etools-prp-ajax>

      <etools-dropdown
        id="organizationSelector"
        class$="[[checkMustSelectOrganization(user)]]"
        selected="[[currentOrganizationId]]"
        placeholder="[[localize('select_organization')]]"
        options="[[organizations]]"
        option-label="title"
        option-value="id"
        trigger-value-change-event
        on-etools-selected-item-changed="onOrganizationChange"
        allow-outside-scroll
        no-label-float
        hide-search
      >
      </etools-dropdown>`;
  }

  @property({type: Array})
  organizations!: any[];

  @property({type: Object})
  currentOrganizationId!: number | null;

  @property({type: Object, computed: 'getReduxStateValue(rootState.userProfile.profile)'})
  user!: GenericObject;

  @property({type: String})
  changeorganizationUrl = Endpoints.changeOrganization();

  @property({type: Object})
  organizationData!: GenericObject;

  public static get observers() {
    return ['onUserChange(user)'];
  }

  onUserChange(user: any) {
    if (!user || !Object.keys(user).length) {
      return;
    }

    this.set('organizations', this.user.partners_available);
    this.set('currentOrganizationId', this.user.partner?.id || null);
  }

  checkMustSelectOrganization(user) {
    if (user && user.id && !user.partner) {
      setTimeout(() => {
        fireEvent(this, 'toast', {text: this.localize('select_organization')});
      }, 2000);
      return 'warning';
    }
    return '';
  }

  onOrganizationChange(e: CustomEvent) {
    if (!e.detail.selectedItem) {
      return;
    }

    const selectedOrganizationId = parseInt(e.detail.selectedItem.id, 10);

    if (selectedOrganizationId !== this.currentOrganizationId) {
      // send post request to change_organization endpoint
      this.triggerOrganizationChangeRequest(selectedOrganizationId);
    }
  }

  triggerOrganizationChangeRequest(organizationId) {
    this.set('organizationData', {partner: organizationId});
    const thunk = (this.$.changeorganization as EtoolsPrpAjaxEl).thunk();
    thunk()
      .then(() => {
        window.location.href = `/${BASE_PATH}/`;
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

window.customElements.define('organization-dropdown', OrganizationDropdown);
