import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@polymer/app-route/app-route.js';
import '@polymer/app-layout/app-drawer-layout/app-drawer-layout.js';
import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import '@polymer/iron-pages/iron-pages.js';
import '../../elements/ip-reporting/nav.js';
import '../../elements/ip-reporting/app-header.js';
import '../../etools-prp-common/elements/page-title.js';
import {appThemeIpStyles} from '../../styles/app-theme-ip-styles.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/iron-overlay-behavior/iron-overlay-backdrop.js';

import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin.js';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin.js';
import {Route} from '../../etools-prp-common/typings/globals.types.js';
import {RootState} from '../../typings/redux.types.js';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util.js';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router.js';
import {store} from '../../redux/store.js';
import {connect} from 'pwa-helpers';
import RoutingMixin from '../../etools-prp-common/mixins/routing-mixin.js';
import {EtoolsRedirectPath} from '@unicef-polymer/etools-utils/dist/enums/router.enum.js';

@customElement('page-ip-reporting')
export class PageIpReporting extends LocalizeMixin(UtilsMixin(RoutingMixin(connect(store)(LitElement)))) {
  static styles = [
    css`
      :host {
        display: block;
      }
      app-drawer {
        --app-drawer-width: 225px;
        --app-drawer-content-container: {
          box-shadow: 1px 0 2px 1px rgba(0, 0, 0, 0.1);
        }
        z-index: 0 !important;
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
        display: flex;
        align-items: center;
      }
      #page-container {
        margin-left: -30px;
      }
      #pageOverlay.opened {
        opacity: 0.6 !important;
        transition: opacity 0.2s linear;
      }
    `
  ];

  @property({type: String})
  page = '';

  /** 
   * 
   * 
   *       <app-route
        .route="${this.route}"
        pattern="/:page"
        .data="${this.routeData}"
        .tail="${this.subroute}"
        @route-changed=${(e) => {
          console.log('ipReportingRouteChanged', e.detail.value);
        }}
        @tail-changed=${(e) => {
          console.log('ipReportingTailChanged', e.detail.value);
          if (e.detail.value && JSON.stringify(this.subroute) !== JSON.stringify(e.detail.value)) {
            this.subroute = {...e.detail.value};
            console.log('C2>>', this.subroute);
          }
        }}
        @data-changed=${(e) => {
          console.log('ipReportingDataChanged', e.detail.value);
          if (
            e.detail.value &&
            e.detail.value.page &&
            JSON.stringify(this.routeData) !== JSON.stringify(e.detail.value)
          ) {
            this.routeData = {...e.detail.value};
            console.log('C1>>', this.routeData);
            this._routePageChanged(this.routeData.page);
          }
        }}
      >
      </app-route>
  */

  render() {
    return html`
      ${appThemeIpStyles}
      <page-title .title="${this.localize('ip_reporting')}"></page-title>

      <app-drawer-layout fullbleed responsive-width="0px">
        <app-drawer id="drawer" slot="drawer">
          <app-header fixed>
            <app-toolbar sticky class="content-align">
              <div class="mode">
                IP
                <br />
                Reporting
              </div>
            </app-toolbar>
          </app-header>

          <ip-reporting-nav .selected="${this.page}" role="navigation"> </ip-reporting-nav>
        </app-drawer>


          <iron-overlay-backdrop id="pageOverlay"></iron-overlay-backdrop>

          <ip-reporting-app-header></ip-reporting-app-header>

          ${
            !this.page || this._equals(this.page, 'overview')
              ? html` <page-ip-reporting-overview name="overview" .route="${this.subroute}">
                </page-ip-reporting-overview>`
              : ''
          }
          ${
            this._equals(this.page, 'pd')
              ? html` <page-ip-reporting-pd name="pd" .route="${this.subroute}"> </page-ip-reporting-pd>`
              : ''
          }
          ${
            this._equals(this.page, 'indicators')
              ? html` <page-ip-reporting-indicators name="indicators" .route="${this.subroute}">
                </page-ip-reporting-indicators>`
              : ''
          }
          ${
            this._equals(this.page, 'progress-reports')
              ? html` <page-ip-progress-reports name="progress-reports" .route="${this.subroute}">
                </page-ip-progress-reports>`
              : ''
          }

        </main>
      </app-drawer-layout>
    `;
  }

  @property({type: Object})
  route!: Route;

  @property({type: Object})
  routeData!: {page: string};

  stateChanged(state: RootState) {
    if (state.app.routeDetails && !isJsonStrMatch(this.routeDetails, state.app.routeDetails)) {
      if (!state.app.routeDetails.subSubRouteName && state.workspaces.current) {
        EtoolsRouter.updateAppLocation(
          this._computeBaseUrl(state.workspaces.current, state.app.routeDetails.subRouteName as any) + '/overview'
        );
        return;
      }

      // if (
      //   state.app.routeDetails.subSubRouteName &&
      //   !['overview', 'progress-reports', 'indicators', 'pd'].includes(state.app.routeDetails.subSubRouteName as string)
      // ) {
      //   EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.NOT_FOUND));
      //   return;
      // }

      this.page = state.app.routeDetails.subSubRouteName || '';
    }
  }
}

export {PageIpReporting as PageIpReportingEl};
