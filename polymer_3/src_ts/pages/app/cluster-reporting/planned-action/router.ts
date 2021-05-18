import {PolymerElement, html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/app-route/app-route';
import '@polymer/iron-location/iron-query-params';
import '@polymer/iron-pages/iron-pages';
import UtilsMixin from '../../../../etools-prp-common/mixins/utils-mixin';
import {getDomainByEnv} from '../../../../config';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
class PlannedActionProjectsRouter extends UtilsMixin(PolymerElement) {
  public static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>

      <app-route route="{{route}}" pattern="/:id" data="{{routeData}}" tail="{{subroute}}"> </app-route>

      <iron-pages selected="[[page]]" attr-for-selected="name">
        <template is="dom-if" if="[[_equals(page, 'projects')]]" restamp="true">
          <planned-action-projects-list name="projects" route="{{subroute}}"> </planned-action-projects-list>
        </template>

        <template is="dom-if" if="[[_equals(page, 'project')]]" restamp="true">
          <planned-action-projects-details name="project" project-id="{{id}}" route="{{subroute}}">
          </planned-action-projects-details>
        </template>

        <template is="dom-if" if="[[_equals(page, 'activities')]]" restamp="true">
          <planned-action-activities-list name="activities" route="{{subroute}}"> </planned-action-activities-list>
        </template>

        <template is="dom-if" if="[[_equals(page, 'activity')]]" restamp="true">
          <planned-action-activities-details name="activity" activity-id="{{id}}" route="{{subroute}}">
          </planned-action-activities-details>
        </template>
      </iron-pages>
    `;
  }

  static get observers() {
    return ['_routeChanged(routeData.id)'];
  }

  @property({type: String})
  id!: string;

  @property({type: Boolean})
  visible!: boolean;

  @property({type: String, observer: '_pageChanged'})
  page!: string;

  _routeChanged(id: string) {
    this.id = id;
  }

  async _pageChanged(page: string) {
    if (!page) {
      return;
    }

    if (!this.visible) {
      return;
    }

    const resolvedPageUrl = getDomainByEnv() + `/src/pages/app/cluster-reporting/planned-action/${page}.js`;
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

window.customElements.define('planned-action-projects-router', PlannedActionProjectsRouter);
