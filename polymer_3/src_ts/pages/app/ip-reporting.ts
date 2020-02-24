import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/app-route/app-route.js';
import '@polymer/app-layout/app-drawer-layout/app-drawer-layout.js';
import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import '@polymer/iron-pages/iron-pages.js';
import '../../elements/ip-reporting/nav';
import '../../elements/ip-reporting/app-header';
import '../../elements/page-title';
import {appThemeIpStyles} from '../../styles/app-theme-ip-styles';
import '@polymer/iron-flex-layout/iron-flex-layout.js';

import UtilsMixin from '../../mixins/utils-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import {getDomainByEnv} from '../../config';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PageIpReporting extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {

  static get template() {
    return html`
    ${appThemeIpStyles}
    <style>
      :host {
        display: block;
      }
      app-drawer {
        --app-drawer-width: 225px;
        --app-drawer-content-container: {
          box-shadow: 1px 0 2px 1px rgba(0, 0, 0, .1);
        }
      }
      app-toolbar {
        background: var(--theme-primary-color);
      }
      .mode {
        font-size: 16px;
        text-transform: uppercase;
        color: var(--theme-primary-text-color-light);
        cursor: default;
        user-select: none;
      }
      .content-align {
        @apply --layout-horizontal;
        @apply --layout-center;
      }
    </style>

    <page-title title="[[localize('ip_reporting')]]"></page-title>

    <app-route
        route="{{route}}"
        pattern="/:page"
        data="{{routeData}}"
        tail="{{subroute}}">
    </app-route>

    <app-drawer-layout fullbleed responsive-width="0px">
      <app-drawer id="drawer" slot="drawer">
        <app-header fixed>
          <app-toolbar sticky class="content-align">
            <div class="mode">
              IP
              <br>
              Reporting
            </div>
          </app-toolbar>
        </app-header>

        <ip-reporting-nav
            selected="{{page}}"
            role="navigation">
        </ip-reporting-nav>
      </app-drawer>

      <ip-reporting-app-header></ip-reporting-app-header>

      <iron-pages
          selected="[[page]]"
          attr-for-selected="name">
        <template is="dom-if" if="[[_equals(page, 'overview')]]" restamp="true">
          <page-ip-reporting-overview
              name="overview"
              route="{{subroute}}">
          </page-ip-reporting-overview>
        </template>

        <template is="dom-if" if="[[_equals(page, 'pd')]]" restamp="true">
          <page-ip-reporting-pd
              name="pd"
              route="{{subroute}}">
          </page-ip-reporting-pd>
        </template>

        <template is="dom-if" if="[[_equals(page, 'indicators')]]" restamp="true">
          <page-ip-reporting-indicators
              name="indicators"
              route="{{subroute}}">
          </page-ip-reporting-indicators>
        </template>

        <template is="dom-if" if="[[_equals(page, 'progress-reports')]]" restamp="true">
            <page-ip-progress-reports
                name="progress-reports"
                route="{{subroute}}">
            </page-ip-progress-reports>
         </template>
       </iron-pages>

    </app-drawer-layout>
  `;
  }

  @property({type: String, observer: '_pageChanged'})
  page!: string;

  static get observers() {
    return [
      '_routePageChanged(routeData.page)'
    ]
  }

  _routePageChanged(page: string) {
    if (!page) {
      this.set('route.path', '/overview'); // FIXME: correct default?
    } else {
      this.page = page;
    }
  }

  async _pageChanged(page: string) {
    //const resolvedPageUrl = `./ip-reporting/${page}.js`;
    const resolvedPageUrl = getDomainByEnv() + `/src/pages/app/ip-reporting/${page}.js`;
    console.log('ipReporting loading... :' + resolvedPageUrl);
    await import(resolvedPageUrl).catch((err: any) => {
      console.log(err);
      this._notFound();
    })
  }

  _notFound() {
    window.location.href = '/not-found';
  }

}
window.customElements.define('page-ip-reporting', PageIpReporting);

export {PageIpReporting as PageIpReportingEl};
