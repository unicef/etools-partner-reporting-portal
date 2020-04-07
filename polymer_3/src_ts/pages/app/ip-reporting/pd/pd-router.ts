import {PolymerElement, html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/app-route/app-route';
import '@polymer/iron-pages/iron-pages';
import './pd-details';
import './pd-report';
import UtilsMixin from '../../../../mixins/utils-mixin';
import {getDomainByEnv} from '../../../../config';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
class PageIpReportingPdRouter extends UtilsMixin(PolymerElement) {

  public static get template() {
    return html`
    <style>
      :host {
        display: block;
      }
    </style>

    <app-route
        route="{{route}}"
        pattern="/:tree"
        data="{{routeData}}"
        tail="{{subroute}}">
    </app-route>

    <iron-pages
        selected="[[page]]"
        attr-for-selected="name">
      <template is="dom-if" if="[[_equals(page, 'pd-details')]]" restamp="true">
        <page-ip-reporting-pd-details
            name="pd-details"
            route="{{subroute}}">
        </page-ip-reporting-pd-details>
      </template>

      <template is="dom-if" if="[[_equals(page, 'pd-report')]]" restamp="true">
        <page-ip-reporting-pd-report
            name="pd-report"
            route="{{subroute}}">
        </page-ip-reporting-pd-report>
      </template>
    </iron-pages>
  `;
  }

  @property({type: String, observer: '_pageChanged'})
  page!: string;

  @property({type: String})
  pdId!: string;

  public static get observers() {
    return [
      '_routeTreeChanged(routeData.tree)',
    ]
  }

  _routeTreeChanged(tree: string) {
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

  async _pageChanged(page: string) {
    if (!page) {
      return;
    }

    const resolvedPageUrl = getDomainByEnv() + `/src/pages/app/ip-reporting/pd/${page}.js`;
    console.log('pd-router page changed: ' + resolvedPageUrl);
    await import(resolvedPageUrl)
      .catch((err: any) => {
        console.log(err);
        console.log(resolvedPageUrl);
        this._notFound();
      });
  }

}

window.customElements.define('page-ip-reporting-pd-router', PageIpReportingPdRouter);
