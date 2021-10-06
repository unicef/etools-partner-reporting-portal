var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement, html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/app-route/app-route';
import '@polymer/iron-location/iron-query-params';
import '@polymer/iron-pages/iron-pages';
import UtilsMixin from '../../../../mixins/utils-mixin';
import { getDomainByEnv } from '../../../../config';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
class PlannedActionProjectsRouter extends UtilsMixin(PolymerElement) {
    static get template() {
        return html `
    <style>
      :host {
        display: block;
      }
    </style>

    <app-route
      route="{{route}}"
      pattern="/:id"
      data="{{routeData}}"
      tail="{{subroute}}">
    </app-route>

    <iron-pages
      selected="[[page]]"
      attr-for-selected="name">
      <template is="dom-if" if="[[_equals(page, 'projects')]]" restamp="true">
        <planned-action-projects-list
          name="projects"
          route="{{subroute}}">
        </planned-action-projects-list>
      </template>

      <template is="dom-if" if="[[_equals(page, 'project')]]" restamp="true">
        <planned-action-projects-details
          name="project"
          project-id="{{id}}"
          route="{{subroute}}">
        </planned-action-projects-details>
      </template>

      <template is="dom-if" if="[[_equals(page, 'activities')]]" restamp="true">
        <planned-action-activities-list
          name="activities"
          route="{{subroute}}">
        </planned-action-activities-list>
      </template>

      <template is="dom-if" if="[[_equals(page, 'activity')]]" restamp="true">
        <planned-action-activities-details
          name="activity"
          activity-id="{{id}}"
          route="{{subroute}}">
        </planned-action-activities-details>
      </template>
    </iron-pages>
  `;
    }
    static get observers() {
        return [
            '_routeChanged(routeData.id)'
        ];
    }
    _routeChanged(id) {
        this.id = id;
    }
    async _pageChanged(page) {
        if (!page) {
            return;
        }
        if (!this.visible) {
            return;
        }
        const resolvedPageUrl = getDomainByEnv() + `/src/pages/app/cluster-reporting/planned-action/${page}.js`;
        console.log('cluster planned-action router loading... :' + resolvedPageUrl);
        await import(resolvedPageUrl).catch((err) => {
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
__decorate([
    property({ type: String })
], PlannedActionProjectsRouter.prototype, "id", void 0);
__decorate([
    property({ type: Boolean })
], PlannedActionProjectsRouter.prototype, "visible", void 0);
__decorate([
    property({ type: String, observer: '_pageChanged' })
], PlannedActionProjectsRouter.prototype, "page", void 0);
window.customElements.define('planned-action-projects-router', PlannedActionProjectsRouter);
