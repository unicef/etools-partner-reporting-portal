import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-header-layout/app-header-layout.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/iron-icons/iron-icons.js';
import {etoolsLogo} from '../etools-logo';
import '../app-switcher';
import '../workspace-dropdown';
import '../language-dropdown';
import '../user-profile/profile-dropdown';
import {property} from '@polymer/decorators';


/**
 * @polymer
 * @customElement
 */
class IpReportingAppHeader extends PolymerElement {

  static get template() {
    return html`

    <style>
      :host {
        display: block;
        position: relative;
        z-index: 100;
      }

      app-header {
        background: var(--theme-page-header-background-color);
        position: fixed;
        left: 225px;
        right: 0px;
      }

      app-toolbar {
        @apply --layout-justified;

        padding-left: 0;
      }

      workspace-dropdown {
        @apply --layout-self-center;
      }

      .wrapper {
        height: 100%;

        @apply --layout-horizontal;
        @apply --layout-center-center;
      }

      .app-switcher-container {
        width: 64px;
        height: 100%;
        margin-right: .75em;
        border-right: 1px solid rgba(255, 255, 255, 0.3);

        @apply --layout-vertical;
        @apply --layout-center-center;
      }
    </style>

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
            <language-dropdown
                data="[[languages]]"
                current="[[language]]">
            </language-dropdown>
            <workspace-dropdown
                data="[[workspaces]]"
                current="[[workspace]]">
            </workspace-dropdown>

            <profile-dropdown></profile-dropdown>
          </div>

        </app-toolbar>
      </app-header>
    </app-header-layout>
  `;
  }

  @property({type: Array, computed: 'getReduxStateObject(rootState.localize.resources)'})
  languages!: [];

  @property({type: String, computed: 'getReduxStateValue(rootState.localize.language)'})
  language!: string;
}

window.customElements.define('ip-reporting-app-header', IpReportingAppHeader);
