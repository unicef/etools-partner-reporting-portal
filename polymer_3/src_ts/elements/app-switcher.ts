import {ReduxConnectedElement} from '../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import '@polymer/paper-menu-button/paper-menu-button.js';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icons/image-icons.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../typings/globals.types';
import '@polymer/paper-styles/typography';
import RoutingMixin from '../mixins/routing-mixin';
import '@polymer/polymer/lib/elements/dom-repeat';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin RoutingMixin
 */
class AppSwitcher extends RoutingMixin(ReduxConnectedElement) {
  public static get template() {
    return html`
      <style include="iron-flex">
        :host {
          --paper-icon-button: {
            color: rgba(255, 255, 255, 0.7);
          }
        }

        h3 {
          padding: 10px 20px;
          margin: 0;
          border-bottom: 1px solid var(--paper-grey-300);

          @apply --paper-font-body1;
        }

        .apps {
          padding: 0;
          margin: 0;
          list-style: none;
        }

        .apps li:not(:first-child) {
          border-left: 1px solid var(--paper-grey-300);
        }

        .app {
          @apply --paper-font-body2;

          display: block;
          width: 65px;
          min-height: 45px;
          padding: 25px 20px 20px 90px;
          position: relative;
          font-size: 16px;
          line-height: 1.25;
          text-transform: uppercase;
          text-decoration: none;
          color: var(--theme-primary-text-color-dark);
        }

        .app::before {
          content: '';
          width: 50px;
          height: 50px;
          position: absolute;
          left: 20px;
          top: 20px;
        }

        .app--ip-reporting::before {
          background: #0099ff;
        }

        .app--cluster-reporting::before {
          background: #009d55;
        }

        .app:hover,
        .app.selected {
          background: var(--paper-grey-200);
        }
      </style>

      <paper-menu-button vertical-align="top" dynamic-align>
        <paper-icon-button icon="icons:apps" slot="dropdown-trigger"></paper-icon-button>
        <aside slot="dropdown-content">
          <h3>Select an application</h3>
          <ul class="apps layout horizontal">
            <template is="dom-repeat" items="[[profile.access]]">
              <li>
                <a
                  class$="app app--[[item]] [[_getSelectedClassName(item, app)]]"
                  href="[[buildBaseUrl(workspace, item)]]"
                  on-tap="_navigate"
                >
                  [[_getAppLabel(item)]]
                </a>
              </li>
            </template>
          </ul>
        </aside>
      </paper-menu-button>
    `;
  }

  @property({type: String, computed: 'getReduxStateValue(rootState.app.current)'})
  app!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.workspaces.current)'})
  workspace!: string;

  @property({type: Object, computed: 'getReduxStateObject(rootState.userProfile.profile)'})
  profile!: GenericObject;

  public _getAppLabel(app: string) {
    switch (app.toLowerCase()) {
      case 'ip-reporting':
        return 'IP Portal';

      case 'cluster-reporting':
        return 'Cluster Portal';
    }
    return '';
  }

  public _getSelectedClassName(app: string, currentApp: string) {
    return app === currentApp ? 'selected' : '';
  }

  public _navigate(e: CustomEvent) {
    e.preventDefault();
    location.href = (e.target as any).href;
  }
}

window.customElements.define('app-switcher', AppSwitcher);
