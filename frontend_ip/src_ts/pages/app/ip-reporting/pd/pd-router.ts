import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import UtilsMixin from '../../../../etools-prp-common/mixins/utils-mixin.js';
import {getDomainByEnv} from '../../../../etools-prp-common/config.js';
import '@polymer/app-route/app-route.js';
import '@polymer/iron-pages/iron-pages.js';
import './pd-details.js';
import './pd-report.js';

@customElement('page-ip-reporting-pd-router')
class PageIpReportingPdRouter extends UtilsMixin(LitElement) {
  @property({type: String})
  page = '';

  @property({type: String})
  pdId = '';

  static styles = css`
    :host {
      display: block;
    }
  `;

  /**
   *   <app-route .route="${this.route}" pattern="/:tree" .data="${this.routeData}" .tail="${this.subroute}">
      </app-route>
   */

  render() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>

      ${this._equals(this.page, 'pd-details')
        ? html` <page-ip-reporting-pd-details name="pd-details" .route="${this.subroute}">
          </page-ip-reporting-pd-details>`
        : html``}
      ${this._equals(this.page, 'pd-report')
        ? html` <page-ip-reporting-pd-report name="pd-report" .route="${this.subroute}"> </page-ip-reporting-pd-report>`
        : html``}
    `;
  }

  updated(changedProperties) {
    if (changedProperties.has('routeData')) {
      this._routeTreeChanged(this.routeData.tree);
    }
  }

  _routeTreeChanged(tree) {
    switch (tree) {
      case 'view':
        this.page = 'pd-details';
        break;

      case 'report':
        this.page = 'pd-report';
        break;

      default:
        this.page = 'pd-details';
        break;
    }
  }

  // async _pageChanged(page) {
  //   if (!page) {
  //     return;
  //   }

  //   const resolvedPageUrl = `${getDomainByEnv()}/src/pages/app/ip-reporting/pd/${page}.js`;
  //   try {
  //     await import(resolvedPageUrl);
  //   } catch (err) {
  //     console.log(err);
  //     this._notFound();
  //   }
  // }
}

export {PageIpReportingPdRouter};
