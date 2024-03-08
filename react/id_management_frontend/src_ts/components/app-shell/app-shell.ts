/**
@license
Copyright (c) 2019 The eTools Project Authors. All rights reserved.
*/

import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings.js';
import {connect} from 'pwa-helpers/connect-mixin.js';
import {installMediaQueryWatcher} from 'pwa-helpers/media-query.js';
import {installRouter} from 'pwa-helpers/router.js';

// This element is connected to the Redux store.
import {store, RootState} from '../../redux/store';

// These are the actions needed by this element.
import {
  navigate,
  // updateOffline,
  updateDrawerState
} from '../../redux/actions/app';

// These are the elements needed by this element.
import '@polymer/app-layout/app-drawer-layout/app-drawer-layout.js';
import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-header-layout/app-header-layout.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import '@unicef-polymer/etools-piwik-analytics/etools-piwik-analytics';

import {AppDrawerLayoutElement} from '@polymer/app-layout/app-drawer-layout/app-drawer-layout';
import {AppHeaderLayoutElement} from '@polymer/app-layout/app-header-layout/app-header-layout';
import {AppDrawerElement} from '@polymer/app-layout/app-drawer/app-drawer';
import {customElement, html, LitElement, property, query} from 'lit-element';
import LoadingMixin from '@unicef-polymer/etools-loading/etools-loading-mixin';

import {AppShellStyles} from './app-shell-styles';

import './menu/app-menu.js';
import './header/page-header.js';
import './footer/page-footer.js';

import './app-theme.js';
import {ToastNotificationHelper} from '../common/toast-notifications/toast-notification-helper';
import user from '../../redux/reducers/user';
import commonData from '../../redux/reducers/common-data';
import {SMALL_MENU_ACTIVE_LOCALSTORAGE_KEY, ROOT_PATH} from '../../config/config';
import {AnyObject} from '@unicef-polymer/etools-types';
import {getCurrentUser} from '../user/user-actions';
import {EtoolsRouter} from '../../routing/routes';
import {RouteDetails} from '../../routing/router';
import {loadPartners, loadUnicefUsers} from '../../redux/actions/common-data';
import {registerTranslateConfig, use} from 'lit-translate';
declare const dayjs: any;
declare const dayjs_plugin_utc: any;

dayjs.extend(dayjs_plugin_utc);

store.addReducers({
  user,
  commonData
});

registerTranslateConfig({loader: (lang: string) => fetch(`assets/i18n/${lang}.json`).then((res: any) => res.json())});

/**
 * @customElement
 * @LitElement
 */
@customElement('app-shell')
export class AppShell extends connect(store)(LoadingMixin(LitElement)) {
  static get styles() {
    return [AppShellStyles];
  }

  public render() {
    // main template
    // language=HTML
    return html`
      <etools-piwik-analytics
        .page="${ROOT_PATH + this.mainPage}"
        .user="${this.user}"
        .toast="${this.currentToastMessage}"
      >
      </etools-piwik-analytics>

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
          <app-menu
            selected-option="${this.mainPage}"
            @toggle-small-menu="${(e: CustomEvent) => this.toggleMenu(e)}"
            ?small-menu="${this.smallMenu}"
          ></app-menu>
        </app-drawer>

        <!-- Main content -->
        <app-header-layout id="appHeadLayout" fullbleed has-scrolling-region>
          <app-header slot="header" fixed shadow>
            <page-header id="pageheader" title="eTools"></page-header>
          </app-header>

          <!-- Main content -->
          <main role="main" class="main-content">
            <ip-reporting-list
              class="page"
              ?active="${this.isActivePage(this.mainPage, 'ip-reporting', this.subPage, 'list')}"
            ></ip-reporting-list>
            <ip-reporting-tabs
              class="page"
              ?active="${this.isActivePage(this.mainPage, 'ip-reporting', this.subPage, 'details|questionnaires')}"
            >
            </ip-reporting-tabs>
            <page-not-found
              class="page"
              ?active="${this.isActivePage(this.mainPage, 'page-not-found')}"
            ></page-not-found>
          </main>

          <page-footer></page-footer>
        </app-header-layout>
      </app-drawer-layout>
    `;
  }

  @property({type: Boolean})
  public narrow = true;

  @property({type: Boolean})
  public drawerOpened = false;

  @property({type: Object})
  public routeDetails!: RouteDetails;

  @property({type: String})
  public mainPage = ''; // routeName

  @property({type: String})
  public subPage: string | null = null; // subRouteName

  @property({type: Boolean})
  public smallMenu = false;

  @property({type: String})
  selectedLanguage!: string;

  @property({type: String})
  currentToastMessage!: string;

  @property({type: Object})
  user!: AnyObject;

  @query('#layout') private drawerLayout!: AppDrawerLayoutElement;
  @query('#drawer') private drawer!: AppDrawerElement;
  @query('#appHeadLayout') private appHeaderLayout!: AppHeaderLayoutElement;

  private appToastsNotificationsHelper!: ToastNotificationHelper;

  constructor() {
    super();
    // Gesture events like tap and track generated from touch will not be
    // preventable, allowing for better scrolling performance.
    setPassiveTouchGestures(true);
    // init toasts notifications queue
    this.appToastsNotificationsHelper = new ToastNotificationHelper(this);
    this.appToastsNotificationsHelper.addToastNotificationListeners();

    const menuTypeStoredVal: string | null = localStorage.getItem(SMALL_MENU_ACTIVE_LOCALSTORAGE_KEY);
    if (!menuTypeStoredVal) {
      this.smallMenu = false;
    } else {
      this.smallMenu = !!parseInt(menuTypeStoredVal, 10);
    }

    store.dispatch(loadPartners());
    store.dispatch(loadUnicefUsers());
  }

  public connectedCallback() {
    super.connectedCallback();

    installRouter((location) => store.dispatch(navigate(decodeURIComponent(location.pathname + location.search))));
    installMediaQueryWatcher(`(min-width: 460px)`, () => store.dispatch(updateDrawerState(false)));

    getCurrentUser().then((user?: AnyObject) => {
      if (user) {
        this.user = user;
      }
    });

    setTimeout(() => {
      window.EtoolsEsmmFitIntoEl = this.appHeaderLayout!.shadowRoot!.querySelector('#contentContainer');
      this.etoolsLoadingContainer = window.EtoolsEsmmFitIntoEl;
    }, 100);

    this.addEventListener('scroll-up', () => {
      if (this.appHeaderLayout) {
        this.appHeaderLayout.$.contentContainer.scrollTop = 0;
      }
    });
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    // remove toasts notifications listeners
    this.appToastsNotificationsHelper.removeToastNotificationListeners();
  }

  public stateChanged(state: RootState) {
    this.routeDetails = state.app!.routeDetails;
    this.mainPage = state.app!.routeDetails!.routeName;
    this.subPage = state.app!.routeDetails!.subRouteName;
    this.drawerOpened = state.app!.drawerOpened;

    if (state.activeLanguage && state.activeLanguage.activeLanguage !== this.selectedLanguage) {
      this.selectedLanguage = state.activeLanguage!.activeLanguage;
      this.loadLocalization();
    }
  }

  async loadLocalization() {
    await use(this.selectedLanguage);
  }

  // TODO: just for testing...
  public getState() {
    console.log(store.getState());
  }

  // Testing router (from console)
  public getRouter() {
    return EtoolsRouter;
  }

  public onDrawerToggle() {
    if (this.drawerOpened !== this.drawer.opened) {
      store.dispatch(updateDrawerState(this.drawer.opened));
    }
  }

  public toggleMenu(e: CustomEvent) {
    this.smallMenu = e.detail.value;
    this._updateDrawerStyles();
    this._notifyLayoutResize();
  }

  private _updateDrawerStyles(): void {
    this.drawerLayout.updateStyles();
    this.drawer.updateStyles();
  }

  private _notifyLayoutResize(): void {
    this.drawerLayout.notifyResize();
    this.appHeaderLayout.notifyResize();
  }

  protected isActiveMainPage(currentPageName: string, expectedPageName: string): boolean {
    return currentPageName === expectedPageName;
  }

  protected isActiveSubPage(currentSubPageName: string, expectedSubPageNames: string): boolean {
    const subPages: string[] = expectedSubPageNames.split('|');
    return subPages.indexOf(currentSubPageName) > -1;
  }

  protected isActivePage(
    pageName: string,
    expectedPageName: string,
    currentSubPageName?: string | null,
    expectedSubPageNames?: string
  ): boolean {
    if (!this.isActiveMainPage(pageName, expectedPageName)) {
      return false;
    }
    if (currentSubPageName && expectedSubPageNames) {
      return this.isActiveSubPage(currentSubPageName, expectedSubPageNames);
    }
    return true;
  }
}
