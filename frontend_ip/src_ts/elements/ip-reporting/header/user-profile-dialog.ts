import {LitElement, html} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown-multi';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import EtoolsDialog from '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';

/**
 * @customElement
 */
@customElement('user-profile-dialog')
export class EtoolsUserProfileDialog extends LitElement {
  @property({type: Object})
  profile: any = {};

  @property({type: Boolean})
  readonly = true;

  @property({type: Boolean})
  showEmail = false;

  @property({type: Boolean})
  hideAvailableWorkspaces = false;

  render() {
    // language=HTML
    return html`
      <style>
        [hidden] {
          display: none !important;
        }

        .paper-label {
          font-size: var(--etools-font-size-12, 12px);
          color: var(--secondary-text-color);
          padding-top: 6px;
        }

        .input-label {
          min-height: 24px;
          padding-top: 4px;
          padding-bottom: 6px;
          min-width: 0;
          font-size: var(--etools-font-size-16, 16px);
        }

        .input-label[empty]::after {
          content: '—';
          color: var(--secondary-text-color);
        }

        .separator {
          padding: 0 8px;
        }

        etools-input {
          width: 100%;
        }

        etools-input[readonly],
        etools-dropdown-multi[readonly] {
          pointer-events: none;
          --etools-input-container-underline: {
            display: none;
          };
        }

        #profile-content {
          overflow: hidden;
          box-sizing: border-box;
        }

        .row-h {
          display: flex;
          flex-direction: row;
        }

        .flex-c {
          /* flex container */
          flex: 1;
        }

        .row-h + .row-h,
        .row-v + .row-v {
          margin-top: 20px;
        }

        .row-h:first-child + .row-v {
          margin-top: 0;
        }

        .col {
          display: flex;
          flex-direction: row;
          box-sizing: border-box;
        }

        .col:not(:first-child) {
          padding-inline-start: 24px;
        }

        .col-6 {
          flex: 0 0 50%;
          max-width: 50%;
        }

        .col-12 {
          flex: 0 0 100%;
          max-width: 100%;
        }

        etools-dialog::part(ed-title) {
          border-bottom: var(--epd-profile-dialog-border-b, none);
        }
        .flex-wrap {
          display: flex;
          flex-wrap: wrap;
        }
        .input-label.flex-wrap div {
          padding-bottom: 6px;
        }

        etools-dialog {
          --divider-color: transparent;
        }
      </style>

      <etools-dialog
        id="userProfileDialog"
        size="lg"
        ok-btn-text="${translate('OK_BTN_TEXT')}"
        cancel-btn-text="${translate('CANCEL_BTN_TEXT')}"
        dialog-title="${translate('MY_PROFILE')}"
        ?hide-confirm-btn="${this.readonly}"
        @close="${this._closeUserProfileDialog}"
      >
        <div id="profile-content" part="epd-user-profile-dropdown-content">
          <div class="row-h flex-c">
            <div class="col col-12">
              <etools-input
                id="name"
                label="${translate('NAME')}"
                placeholder="&#8212;"
                .value="${`${this.profile.first_name} ${this.profile.last_name}`}"
                readonly
              ></etools-input>
            </div>
          </div>
          <div class="row-h flex-c" ?hidden="${!this.showEmail}">
            <div class="col col-12">
              <etools-input
                id="email"
                label="${translate('EMAIL')}"
                placeholder="&#8212;"
                .value="${this.profile.email}"
                readonly
              ></etools-input>
            </div>
          </div>
          <div class="row-h flex-c" ?hidden="${this.hideAvailableWorkspaces}">
            <div class="col col-12">
              <div>
                <label class="paper-label">${translate('AVAILABLE_WORKSPACES')}</label>
                <div class="input-label flex-wrap">
                  ${(this.profile?.workspaces_available || []).map(
                    (item, index) => html`
                      <div>
                        ${item.title}
                        <span class="separator">${this.getSeparator(this.profile.workspaces_available, index)}</span>
                      </div>
                    `
                  )}
                </div>
              </div>
            </div>
          </div>
          <div class="row-h flex-c" ?hidden="${this.hideAvailableWorkspaces}">
            <div class="col col-12">
              <div>
                <label class="paper-label">${translate('MY_ROLES')}</label>
                <div class="input-label flex-wrap">
                  ${(this.profile?.prp_roles || []).map(
                    (item, index) => html`
                      <div>
                        ${item.role_display}
                        <span class="separator">${this.getSeparator(this.profile?.prp_roles, index)}</span>
                      </div>
                    `
                  )}
                </div>
              </div>
            </div>
          </div>
          <div class="row-h flex-c" ?hidden=${!this.profile?.partner}>
            <div class="col col-12">
              <etools-input
                id="partner"
                label="${translate('PARTNER')}"
                placeholder="&#8212;"
                .value="${this.profile?.partner?.title}"
                readonly
              ></etools-input>
            </div>
          </div>
          <div class="row-h flex-c" ?hidden=${!this.profile?.organization}>
            <div class="col col-12">
              <etools-input
                id="partner"
                label="${translate('PARTNER')}"
                placeholder="&#8212;"
                .value="${this.profile?.organization?.title}"
                readonly
              ></etools-input>
            </div>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  openUserProfileDialog() {
    (this.shadowRoot!.querySelector('#userProfileDialog') as EtoolsDialog)!.opened = true;
  }

  _closeUserProfileDialog(e) {
    if (e.detail.confirmed) {
      this.saveData();
    }
  }

  getSeparator(collection, index) {
    if (!collection) {
      return '';
    }
    if (index < collection.length - 1) {
      return '|';
    }
    return '';
  }

  saveData() {
    this.dispatchEvent(
      new CustomEvent('save-profile', {
        detail: {profile: this.profile},
        bubbles: true,
        composed: true
      })
    );
  }
}
