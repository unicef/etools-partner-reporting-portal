import {LitElement, html, css} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import {store} from '../../redux/store';
import {etoolsLogo} from '../../etools-prp-common/elements/etools-logo';
import '../../etools-prp-common/elements/app-switcher';
import '../../etools-prp-common/elements/workspace-dropdown';
import '../organization-dropdown';
import '../language-dropdown';
import '../../etools-prp-common/elements/user-profile/profile-dropdown';

@customElement('ip-reporting-app-header')
export class IpReportingAppHeader extends connect(store)(LitElement) {
  static styles = css`
    :host {
      display: block;
      position: relative;
      z-index: 102;
      height: 65px;
    }

    app-header {
      background: var(--theme-page-header-background-color);
      position: fixed;
      left: 225px;
      right: 0px;
    }

    app-toolbar {
      display: flex;
      justify-content: space-between;
      padding-left: 0;
    }

    .wrapper {
      display: flex;
      align-items: center;
    }

    .app-switcher-container {
      width: 64px;
      height: 100%;
      margin-right: 0.75em;
      border-right: 1px solid rgba(255, 255, 255, 0.3);
      display: flex;
      align-items: center;
    }
  `;

  @property({type: Array})
  languages: any[] = [];

  @property({type: String})
  language = '';

  @property({type: Array})
  workspaces: any[] = [];

  @property({type: String})
  workspace = '';

  render() {
    return html`
      <app-header-layout fullbleed>
        <app-header fixed>
          <app-toolbar>
            <div class="wrapper">
              <div class="app-switcher-container">
                <app-switcher></app-switcher>
              </div>
              ${etoolsLogo}
            </div>

            <div class="wrapper">
              <language-dropdown .data="${this.languages}" .current="${this.language}"></language-dropdown>
              <workspace-dropdown .data="${this.workspaces}" .current="${this.workspace}"></workspace-dropdown>
              <organization-dropdown></organization-dropdown>
              <profile-dropdown></profile-dropdown>
            </div>
          </app-toolbar>
        </app-header>
      </app-header-layout>
    `;
  }

  stateChanged(state) {
    if (this.languages !== state.localize.resources) {
      this.languages = state.localize.resources;
    }
    if (this.language !== state.localize.language) {
      this.language = state.localize.language;
    }
  }
}
