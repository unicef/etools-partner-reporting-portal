import { html, PolymerElement } from '@polymer/polymer';
import '@polymer/app-layout/app-header/app-header';
import '@polymer/app-layout/app-header-layout/app-header-layout';
import '@polymer/app-layout/app-toolbar/app-toolbar';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '../etools-logo';
import '../app-switcher';
import '../workspace-dropdown';
import '../language-dropdown';
import '../etools-prp-workspaces';
import '../etools-prp-languages';
import './change-response-plan';
import '../user-profile/profile-dropdown';
/**
* @polymer
* @customElement
*/
class AppHeader extends PolymerElement {
    static get template() {
        // language=HTML
        return html `
    <style>
      :host {
        display: block;
        position: relative;
        z-index: 100;
      }

      app-header {
        background: var(--theme-page-header-background-color);
      }

      app-toolbar {
        @apply --layout-justified;

        padding-left: 0;
      }

      workspace-dropdown {
        @apply --layout-self-center;
      }

      change-response-plan {
        margin: 0 10px 0 30px;
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

    <etools-prp-languages
        all="{{languages}}"
        current="{{language}}">
    </etools-prp-languages>

    <etools-prp-workspaces
        all="{{workspaces}}"
        current="{{workspace}}">
    </etools-prp-workspaces>

    <app-header-layout>
      <app-header fixed>

        <app-toolbar>
          <div class="wrapper">
            <div class="app-switcher-container">
              <app-switcher></app-switcher>
            </div>
            <etools-logo size="120" text-color="#fff"></etools-logo>
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

            <change-response-plan></change-response-plan>
            <profile-dropdown></profile-dropdown>
          </div>
        </app-toolbar>

      </app-header>
    </app-header-layout>
  `;
    }
}
window.customElements.define('cluster-reporting-app-header', AppHeader);
