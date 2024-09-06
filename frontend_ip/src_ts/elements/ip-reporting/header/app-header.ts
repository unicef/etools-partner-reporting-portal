import '@unicef-polymer/etools-unicef/src/etools-app-layout/app-toolbar.js';
import '@unicef-polymer/etools-unicef/src/etools-profile-dropdown/etools-profile-dropdown';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button.js';
import '@unicef-polymer/etools-modules-common/dist/components/dropdowns/languages-dropdown';
import '@unicef-polymer/etools-modules-common/dist/components/dropdowns/countries-dropdown';
import '@unicef-polymer/etools-modules-common/dist/components/dropdowns/organizations-dropdown';
import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {store} from '../../../redux/store';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import isEmpty from 'lodash-es/isEmpty';
import {translate, get as getTranslation} from 'lit-translate';
import {AnyObject, EtoolsUser} from '@unicef-polymer/etools-types';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {EtoolsRedirectPath} from '@unicef-polymer/etools-utils/dist/enums/router.enum';
import EndpointsCommon from '../../../etools-prp-common/endpoints';
import {Environment} from '@unicef-polymer/etools-utils/dist/singleton/environment';
import {RootState} from '../../../typings/redux.types';
import {connect} from 'pwa-helpers';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import Constants from '../../../etools-prp-common/constants';
import {setActiveLanguage} from '../../../redux/actions/active-language';
import './user-profile-dialog';

/**
 * page header element
 * @LitElement
 * @customElement
 */
@customElement('ip-reporting-app-header')
export class PageHeader extends connect(store)(LitElement) {
  @property({type: Object})
  profile!: EtoolsUser;

  @property({type: Object})
  profileDropdownData: any | null = null;

  @property({type: Array})
  offices: any[] = [];

  @property({type: Array})
  sections: any[] = [];

  @property({type: Array})
  users: any[] = [];

  @property({type: Array})
  profileDrOffices: any[] = [];

  @property({type: Array})
  profileDrSections: any[] = [];

  @property({type: Array})
  profileDrUsers: any[] = [];

  @property({type: Array})
  editableFields: string[] = [];

  @property({type: String})
  activeLanguage?: string;

  public render() {
    // main template
    // language=HTML
    return html`
      <app-toolbar
        sticky
        class="content-align"
        @menu-button-clicked="${this.menuBtnClicked}"
        .profile=${this.profile}
        responsive-width="850.9px"
        sticky
      >
        <div slot="dropdowns">
          <languages-dropdown
            .profile="${this.profile}"
            .availableLanguages="${Constants.LANGUAGES}"
            .activeLanguage="${this.activeLanguage}"
            @user-language-changed="${(e: any) => {
              // store.dispatch(updateUserData(e.detail.user));
              // store.dispatch(setActiveLanguage(e.detail.language));
              localStorage.setItem('defaultLanguage', e.detail.language);
              store.dispatch(setActiveLanguage(e.detail.language));
              window.location.reload();
            }}"
          ></languages-dropdown>
          <countries-dropdown
            id="countries"
            .profile="${this.profile}"
            countries-profile-key="workspaces_available"
            country-profile-key="workspace"
            option-label="title"
            .changeCountryEndpoint="${{url: EndpointsCommon.changeWorkspace()}}"
            @country-changed="${() => {
              EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.DEFAULT));
              document.location.assign(window.location.origin + Environment.basePath);
            }}"
          >
          </countries-dropdown>
          <organizations-dropdown
            .profile="${this.profile}"
            organizations-profile-key="partners_available"
            organization-profile-key="partner"
            option-label="title"
            .changeOrganizationEndpoint="${{url: EndpointsCommon.changeOrganization()}}"
            @organization-changed="${() => {
              EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.DEFAULT));
              document.location.assign(window.location.origin + Environment.basePath);
            }}"
          ></organizations-dropdown>
        </div>
        <div slot="icons">
          <etools-profile-dropdown
            title=${translate('GENERAL.PROFILEANDSIGNOUT')}
            .sections="${this.profileDrSections}"
            .offices="${this.profileDrOffices}"
            .users="${this.profileDrUsers}"
            show-email
            profile-dialog-component="user-profile-dialog"
            .profile="${this.profile ? {...this.profile} : {}}"
            @save-profile="${this.handleSaveProfile}"
            @sign-out="${this._signOut}"
          >
          </etools-profile-dropdown>
        </div>
      </app-toolbar>
    `;
  }

  public connectedCallback() {
    super.connectedCallback();
  }

  public stateChanged(state: RootState) {
    if (state?.userProfile?.profile && !isJsonStrMatch(this.profile, state?.userProfile?.profile)) {
      this.profile = state.userProfile.profile!;
    }

    if (this.activeLanguage !== state.activeLanguage.activeLanguage) {
      this.activeLanguage = state.activeLanguage.activeLanguage;
    }
  }

  public handleSaveProfile(e: any) {
    const modifiedFields = this._getModifiedFields(this.profile, e.detail.profile);
    if (isEmpty(modifiedFields)) {
      // empty profile means no changes found
      this.showSaveNotification();
      return;
    }
    this.profileSaveLoadingMsgDisplay();
    // updateCurrentUser(modifiedFields)
    //   .then(() => {
    //     this.showSaveNotification();
    //   })
    //   .catch(() => {
    //     this.showSaveNotification(getTranslation('PROFILE_DATA_NOT_SAVED'));
    //   })
    //   .then(() => {
    //     this.profileSaveLoadingMsgDisplay(false);
    //   });
  }

  protected profileSaveLoadingMsgDisplay(show = true) {
    fireEvent(this, 'global-loading', {
      active: show,
      loadingSource: 'profile-save'
    });
  }

  protected showSaveNotification(msg?: string) {
    fireEvent(this, 'toast', {
      text: msg ? msg : getTranslation('ALL_DATA_SAVED')
    });
  }

  protected _getModifiedFields(originalData: any, newData: any) {
    const modifiedFields: AnyObject = {};
    this.editableFields.forEach(function (field: any) {
      if (originalData[field] !== newData[field]) {
        modifiedFields[field] = newData[field];
      }
    });

    return modifiedFields;
  }

  public menuBtnClicked() {
    fireEvent(this, 'change-drawer-state');
  }

  protected _signOut() {
    fireEvent(this, 'sign-out');
  }

  protected clearLocalStorage() {
    localStorage.clear();
  }
}
