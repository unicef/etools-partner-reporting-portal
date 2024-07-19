import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import '../etools-prp-common/elements/etools-prp-ajax';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {EtoolsPrpAjaxEl} from '../etools-prp-common/elements/etools-prp-ajax';
import {translate} from 'lit-translate';
import {store} from '../redux/store';
import Endpoints from '../etools-prp-common/endpoints';
import {RootState} from '../typings/redux.types';
import {BASE_PATH} from '../etools-prp-common/config';

@customElement('organization-dropdown')
export class OrganizationDropdown extends connect(store)(LitElement) {
  static styles = css`
    :host {
      display: block;
    }

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
  `;

  @property({type: Array})
  organizations: any[] = [];

  @property({type: Number})
  currentOrganizationId: number | null = null;

  @property({type: Object})
  user!: any;

  @property({type: String})
  changeorganizationUrl: string = Endpoints.changeOrganization();

  @property({type: Object})
  organizationData!: any;

  stateChanged(state: RootState) {
    if (this.user !== state.userProfile.profile) {
      this.user = state.userProfile.profile;
    }
  }

  updated(changedProperties: any) {
    super.updated(changedProperties);
    if (changedProperties.has('user')) {
      this.onUserChange(this.user);
    }
  }

  private onUserChange(user: any | undefined) {
    if (!user || !Object.keys(user).length) {
      return;
    }

    this.organizations = user.partners_available;
    this.currentOrganizationId = user.partner?.id || null;
  }

  private checkMustSelectOrganization(user: any | undefined) {
    if (user && user.id && !user.partner) {
      setTimeout(() => {
        fireEvent(this, 'toast', {text: translate('SELECT_ORGANIZATION')});
      }, 2000);
      return 'warning';
    }
    return '';
  }

  private onOrganizationChange(e: CustomEvent) {
    if (!e.detail.selectedItem) {
      return;
    }

    const selectedOrganizationId = parseInt(e.detail.selectedItem.id, 10);

    if (selectedOrganizationId !== this.currentOrganizationId) {
      this.triggerOrganizationChangeRequest(selectedOrganizationId);
    }
  }

  private triggerOrganizationChangeRequest(organizationId: number) {
    this.organizationData = {partner: organizationId};
    const thunk = (this.shadowRoot!.querySelector('#changeorganization') as any as EtoolsPrpAjaxEl).thunk();
    thunk()
      .then(() => {
        window.location.href = `/${BASE_PATH}/`;
      })
      .catch((err: Error) => {
        console.error(err);
      });
  }

  render() {
    return html`
      <etools-prp-ajax
        id="changeorganization"
        method="post"
        url="${this.changeorganizationUrl}"
        .body="${this.organizationData}"
        content-type="application/json"
      >
      </etools-prp-ajax>

      <etools-dropdown
        id="organizationSelector"
        class="${this.checkMustSelectOrganization(this.user)}"
        .selected="${this.currentOrganizationId}"
        placeholder="${translate('SELECT_ORGANIZATION')}"
        .options="${this.organizations}"
        option-label="title"
        option-value="id"
        trigger-value-change-event
        @etools-selected-item-changed="${this.onOrganizationChange}"
        allow-outside-scroll
        no-label-float
        hide-search
      >
      </etools-dropdown>
    `;
  }
}
