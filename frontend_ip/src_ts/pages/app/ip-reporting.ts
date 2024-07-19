import {LitElement, html, css} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-app-layout/app-drawer-layout.js';
import '@unicef-polymer/etools-unicef/src/etools-app-layout/app-drawer.js';
import '@unicef-polymer/etools-unicef/src/etools-app-layout/app-header-layout.js';
import '@unicef-polymer/etools-unicef/src/etools-app-layout/app-header.js';
// import '@unicef-polymer/etools-unicef/src/etools-app-layout/app-footer.js';

import '../../elements/ip-reporting/app-header.js';
import '../../etools-prp-common/elements/page-title.js';
import {appThemeIpStyles} from '../../styles/app-theme-ip-styles.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/iron-overlay-behavior/iron-overlay-backdrop.js';

import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin.js';
import {Route} from '../../etools-prp-common/typings/globals.types.js';
import {RootState} from '../../typings/redux.types.js';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util.js';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router.js';
import {store} from '../../redux/store.js';
import {connect, installMediaQueryWatcher} from 'pwa-helpers';
import RoutingMixin from '../../etools-prp-common/mixins/routing-mixin.js';
import '../../elements/ip-reporting/menu/app-menu.js';
import {EtoolsRedirectPath} from '@unicef-polymer/etools-utils/dist/enums/router.enum.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util.js';
import {SMALL_MENU_ACTIVE_LOCALSTORAGE_KEY} from '../../etools-prp-common/config.js';
import {appDrawerStyles} from '../../elements/ip-reporting/menu/styles/app-drawer-styles.js';
import {translate} from 'lit-translate';
// import {EtoolsRedirectPath} from '@unicef-polymer/etools-utils/dist/enums/router.enum.js';

@customElement('page-ip-reporting')
export class PageIpReporting extends UtilsMixin(RoutingMixin(connect(store)(LitElement))) {
  static styles = [
    css`
      ${appDrawerStyles}

      :host {
        display: block;
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

  @property({type: Boolean})
  narrow = true;

  @property({type: Boolean})
  drawerOpened = false;

  @property({type: Boolean})
  smallMenu: boolean;

  @property({type: Object})
  route!: Route;

  @property({type: Object})
  routeData!: {page: string};

  @query('#drawer') private drawer!: LitElement;

  constructor() {
    super();
    const menuTypeStoredVal: string | null = localStorage.getItem(SMALL_MENU_ACTIVE_LOCALSTORAGE_KEY);
    if (!menuTypeStoredVal) {
      this.smallMenu = false;
    } else {
      this.smallMenu = !!parseInt(menuTypeStoredVal, 10);
    }
  }

  render() {
    return html`
      ${appThemeIpStyles}
      <page-title .title="${translate('IP_REPORTING')}"></page-title>

     <app-drawer-layout
        id="layout"
        responsive-width="850px"
        fullbleed
        ?narrow="${this.narrow}"
        ?small-menu="${this.smallMenu}"
      >
        <!-- Drawer content -->
        <app-drawer
          id="drawer"
          slot="drawer"
          transition-duration="350"
          @app-drawer-transitioned="${this.onDrawerToggle}"
          ?opened="${this.drawerOpened}"
          ?swipe-open="${this.narrow}"
          ?small-menu="${this.smallMenu}"
        >
          <!-- App main menu(left sidebar) -->
          <app-menu .selectedOption="${this.page}" ?small-menu="${this.smallMenu}"></app-menu>

        </app-drawer>

        <!-- Main content -->
        <app-header-layout id="appHeadLayout" fullbleed has-scrolling-region>
           <ip-reporting-app-header></ip-reporting-app-header>

          ${
            this._equals(this.page, 'overview')
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
        </app-header-layout>
      </app-drawer-layout>
    `;
  }

  stateChanged(state: RootState) {
    if (state.app.routeDetails && !isJsonStrMatch(this.routeDetails, state.app.routeDetails)) {
      if (state.app.routeDetails.subRouteName !== 'ip-reporting') {
        return;
      }

      if (!state.app.routeDetails.subSubRouteName && state.workspaces.current) {
        EtoolsRouter.updateAppLocation([state.workspaces.baseUrl, 'overview'].join('/'));
      } else if (
        state.app.routeDetails.subSubRouteName &&
        !['overview', 'progress-reports', 'indicators', 'pd'].includes(state.app.routeDetails.subSubRouteName as string)
      ) {
        EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.NOT_FOUND));
        return;
      } else {
        this.page = state.app.routeDetails.subSubRouteName || '';
      }
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('change-drawer-state', this.changeDrawerState);
    this.addEventListener('app-drawer-transitioned', this.syncWithDrawerState);
    this.addEventListener('toggle-small-menu', this.toggleMenu as any);
    installMediaQueryWatcher(`(min-width: 460px)`, () => fireEvent(this, 'change-drawer-state'));
  }

  public changeDrawerState() {
    this.drawerOpened = !this.drawerOpened;
  }

  public syncWithDrawerState() {
    this.drawerOpened = Boolean((this.shadowRoot?.querySelector('#drawer') as any).opened);
  }

  public onDrawerToggle() {
    if (this.drawerOpened !== (this.drawer as any).opened) {
      this.drawerOpened = Boolean((this.drawer as any).opened);
    }
  }

  public toggleMenu(e: CustomEvent) {
    this.smallMenu = e.detail.value;
  }
}

export {PageIpReporting as PageIpReportingEl};
