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

@customElement('page-ip-reporting')
export class PageIpReporting extends LocalizeMixin(UtilsMixin(LitElement)) {
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

  render() {
    return html`
      ${appThemeIpStyles}
      <page-title .title="${this.localize('ip_reporting')}"></page-title>

      <app-route
        .route="${this.route}"
        pattern="/:page"
        .data="${this.routeData}"
        .tail="${this.subroute}"
        @route-changed=${(e) => {
          console.log(e.detail);
        }}
        @tail-changed=${(e) => {
          console.log(e.detail);
          if (e.detail.value && JSON.stringify(this.subroute) !== JSON.stringify(e.detail.value)) {
            this.subroute = e.detail.value;
            console.log('C2>>', this.subroute);
          }
        }}
        @data-changed=${(e) => {
          console.log(e.detail);
          if (
            e.detail.value &&
            e.detail.value.page &&
            JSON.stringify(this.routeData) !== JSON.stringify(e.detail.value)
          ) {
            this.routeData = e.detail.value;
            console.log('C1>>', this.routeData);
            this._routePageChanged(this.routeData.page);
          }
        }}
      >
      </app-route>

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

        <main role="main" id="page-container">
          <iron-overlay-backdrop id="pageOverlay"></iron-overlay-backdrop>

          <ip-reporting-app-header></ip-reporting-app-header>

          <iron-pages .selected="${this.page}" attr-for-selected="name">
            ${this._equals(this.page, 'overview')
              ? html` <page-ip-reporting-overview name="overview" .route="${this.subroute}">
                </page-ip-reporting-overview>`
              : ''}
            ${this._equals(this.page, 'pd')
              ? html` <page-ip-reporting-pd name="pd" .route="${this.subroute}"> </page-ip-reporting-pd>`
              : ''}
            ${this._equals(this.page, 'indicators')
              ? html` <page-ip-reporting-indicators name="indicators" .route="${this.subroute}">
                </page-ip-reporting-indicators>`
              : ''}
            ${this._equals(this.page, 'progress-reports')
              ? html` <page-ip-progress-reports name="progress-reports" .route="${this.subroute}">
                </page-ip-progress-reports>`
              : ''}
          </iron-pages>
        </main>
      </app-drawer-layout>
    `;
  }

  @property({type: Object})
  route!: Route;

  @property({type: Object})
  routeData!: {page: string};

  updated(changedProperties) {
    if (changedProperties.has('page')) {
      this._pageChanged(this.page);
    }
  }

  _routePageChanged(page: string) {
    if (!page) {
      this.route.path = '/overview'; // FIXME: correct default?
    } else {
      this.page = page;
    }
  }

  async _pageChanged(page: string) {
    console.log('pagechanged>>>', page);
    switch (page) {
      case 'overview':
        await import('./ip-reporting/overview.js').catch((err: any) => {
          console.log(err);
          this._notFound();
        });
        break;
      case 'indicators':
        await import('./ip-reporting/indicators.js').catch((err: any) => {
          console.log(err);
          this._notFound();
        });
        break;
      case 'pd':
        await import('./ip-reporting/pd.js').catch((err: any) => {
          console.log(err);
          this._notFound();
        });
        break;
      case 'progress-reports':
        await import('./ip-reporting/progress-reports.js').catch((err: any) => {
          console.log(err);
          this._notFound();
        });
        break;

      default:
        await import('./ip-reporting/overview.js').catch((err: any) => {
          console.log(err);
          this._notFound();
        });
        break;
    }
  }

  _notFound() {
    window.location.href = '/not-found';
  }
}

export {PageIpReporting as PageIpReportingEl};
