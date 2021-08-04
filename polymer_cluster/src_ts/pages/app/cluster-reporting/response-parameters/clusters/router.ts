import {html, PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/app-route/app-route';
import '@polymer/iron-pages/iron-pages';
import UtilsMixin from '../../../../../etools-prp-common/mixins/utils-mixin';
import {getDomainByEnv} from '../../../../../etools-prp-common/config';
import {GenericObject} from '../../../../../etools-prp-common/typings/globals.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
class ResponseParametersClustersRouter extends UtilsMixin(PolymerElement) {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>

      <iron-location></iron-location>

      <app-route route="{{route}}" pattern="/:id" data="{{routeData}}" tail="{{subroute}}"> </app-route>

      <iron-pages selected="[[page]]" attr-for-selected="name">
        <template is="dom-if" if="[[_equals(page, 'objectives')]]" restamp="true">
          <clusters-objectives name="objectives" route="{{subroute}}"> </clusters-objectives>
        </template>

        <template is="dom-if" if="[[_equals(page, 'objective')]]" restamp="true">
          <clusters-objective-details name="objective" objective-id="{{id}}" route="{{subroute}}">
          </clusters-objective-details>
        </template>

        <template is="dom-if" if="[[_equals(page, 'activities')]]" restamp="true">
          <clusters-activities name="activities" route="{{subroute}}"> </clusters-activities>
        </template>

        <template is="dom-if" if="[[_equals(page, 'activity')]]" restamp="true">
          <clusters-activity-details name="activity" activity-id="{{id}}" route="{{subroute}}">
          </clusters-activity-details>
        </template>

        <template is="dom-if" if="[[_equals(page, 'disaggregations')]]" restamp="true">
          <clusters-disaggregations name="disaggregations" route="{{subroute}}"> </clusters-disaggregations>
        </template>
      </iron-pages>
    `;
  }

  @property({type: Object})
  routeData!: GenericObject;

  @property({type: String})
  id!: string;

  @property({type: Boolean})
  visible!: boolean;

  @property({type: String, observer: '_pageChanged'})
  page!: string;

  static get observers() {
    return ['_routeChanged(routeData.id)'];
  }

  _routeChanged(id: string) {
    this.set('id', id);
  }

  async _pageChanged(page: string) {
    if (!page) {
      return;
    }

    if (!this.visible) {
      return;
    }

    const resolvedPageUrl =
      getDomainByEnv() + `/src/pages/app/cluster-reporting/response-parameters/clusters/${page}.js`;
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

window.customElements.define('response-parameters-clusters-router', ResponseParametersClustersRouter);

export {ResponseParametersClustersRouter as ResponseParametersClustersRouterEl};
