import {PolymerElement, html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/paper-tabs/paper-tab';
import '@polymer/paper-tabs/paper-tabs';
import '@polymer/app-route/app-route';
import '@polymer/iron-pages/iron-pages';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import UtilsMixin from '../../../mixins/utils-mixin';
import {getDomainByEnv} from '../../../config';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PageClusterReportingResponseParameters extends UtilsMixin(PolymerElement) {

  public static get template() {
    return html`
    <style>
      :host {
        display: block;
      }
    </style>

    <app-route
      route="{{route}}"
      pattern="/:page"
      data="{{routeData}}"
      tail="{{subroute}}">
    </app-route>

    <iron-pages
      selected="{{page}}"
      attr-for-selected="name">
        <template is="dom-if" if="[[_equals(page, 'clusters')]]" restamp="true">
          <clusters-response-parameters
            name="clusters"
            route="{{subroute}}">
          </clusters-response-parameters>
        </template>

        <template is="dom-if" if="[[_equals(page, 'partners')]]" restamp="true">
          <partners-response-parameters
            name="partners"
            route="{{subroute}}">
          </partners-response-parameters>
      </template>

    </iron-pages>
`;
  }


  static get observers() {
    return [
      '_routeChanged(routeData.page)'
    ];
  }

  @property({type: Boolean})
  visible!: boolean;

  @property({type: String, observer: '_pageChanged'})
  page!: string;


  _routeChanged(page: string) {
    if (!page) {
      setTimeout(() => {
        if (!this.visible) {
          return;
        }

        this.set('route.path', '/clusters');
      });
    } else if (page !== this.page) {
      this.page = page;
    }
  }

  async _pageChanged(page: string) {
    if (!page) {
      return;
    }

    const resolvedPageUrl = getDomainByEnv() + `/src/pages/app/cluster-reporting/response-parameters/${page}/${page}.js`;
    await import(resolvedPageUrl).catch((err: any) => {
      console.log(err);
      this._notFound();
    });

  }

  connectedCallback() {
    super.connectedCallback();
    this.set('visible', true);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.set('visible', false);
  }

}

window.customElements.define('page-cluster-reporting-response-parameters', PageClusterReportingResponseParameters);
