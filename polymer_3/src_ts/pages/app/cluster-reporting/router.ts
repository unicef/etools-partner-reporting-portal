import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/iron-pages/iron-pages';
import '@polymer/app-layout/app-drawer-layout/app-drawer-layout';
import '@polymer/app-layout/app-drawer/app-drawer';
import '@polymer/app-route/app-route';
import '@polymer/app-layout/app-header/app-header';
import '@polymer/app-layout/app-toolbar/app-toolbar';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@unicef-polymer/etools-loading/etools-loading';
import {appThemeClusterStyles} from '../../../styles/app-theme-cluster-styles';
import '../../../elements/etools-prp-permissions';
import '../../../elements/cluster-reporting/nav';
import '../../../elements/cluster-reporting/app-header';
import UtilsMixin from '../../../mixins/utils-mixin';
import {setCurrentResponsePlanID, setCurrentResponsePlan} from '../../../redux/actions';
import {GenericObject} from '../../../typings/globals.types';
import {getDomainByEnv} from '../../../config';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PageClusterReportingRouter extends UtilsMixin(ReduxConnectedElement) {

  public static get template() {
    return html`
    ${appThemeClusterStyles}
    <style include="iron-flex">
      :host {
        display: block;
      }
      app-drawer {
        --app-drawer-width: 225px;
        --app-drawer-content-container: {
          box-shadow: 1px 0 2px 1px rgba(0, 0, 0, .1);
        }
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
      .loading {
        margin: 10em 0;
      }
      #page-container {
        margin-left: -30px;
      }
    </style>

    <etools-prp-permissions
      permissions="{{ permissions }}">
    </etools-prp-permissions>

    <app-route
      route="{{ route }}"
      pattern="/:plan/:page"
      data="{{ routeData }}"
      tail="{{ subroute }}">
    </app-route>

    <app-drawer-layout fullbleed responsive-width="0px">
      <app-drawer id="drawer" slot="drawer">
        <app-header fixed>
          <app-toolbar>
            <div class="mode">
              Cluster
              <br>
              Reporting
            </div>
          </app-toolbar>
        </app-header>

        <cluster-reporting-nav
          route="{{ subroute }}"
          selected="{{ page }}"
          role="navigation">
        </cluster-reporting-nav>
      </app-drawer>

      <main role="main" id="page-container">
          <cluster-reporting-app-header></cluster-reporting-app-header>

          <template
            is="dom-if"
            if="[[loading]]"
            restamp="true">
            <div class="loading layout horizontal center-center">
              <etools-loading no-overlay></etools-loading>
            </div>
          </template>

          <iron-pages
            selected="[[page]]"
            attr-for-selected="name"
            hidden$="[[!loading]]">
            <template
              is="dom-if"
              if="[[_equals(page, 'dashboard')]]"
              restamp="true">
              <page-cluster-reporting-dashboard
                name="dashboard"
                route="{{ subroute }}">
              </page-cluster-reporting-dashboard>
            </template>

            <template
              is="dom-if"
              if="[[_equals(page, 'response-parameters')]]"
              restamp="true">
              <page-cluster-reporting-response-parameters
                name="response-parameters"
                route="{{ subroute }}">
              </page-cluster-reporting-response-parameters>
            </template>

            <template
              is="dom-if"
              if="[[_equals(page, 'planned-action')]]"
              restamp="true">
              <template
                is="dom-if"
                if="[[canViewPlannedAction]]"
                restamp="true">
                <page-cluster-reporting-planned-action
                  name="planned-action"
                  route="{{ subroute }}">
                </page-cluster-reporting-planned-action>
              </template>
            </template>

            <template
              is="dom-if"
              if="[[_equals(page, 'results')]]"
              restamp="true">
              <page-cluster-reporting-results
                name="results"
                route="{{ subroute }}">
              </page-cluster-reporting-results>
            </template>

            <template
              is="dom-if"
              if="[[_equals(page, 'analysis')]]"
              restamp="true">
              <page-cluster-reporting-analysis
                name="analysis"
                route="{{ subroute }}">
              </page-cluster-reporting-analysis>
            </template>
         </iron-pages>
      </main>
    </app-drawer-layout>
  `;
  }

  @property({type: Boolean})
  loading = false;

  @property({type: String, observer: '_planChanged'})
  plan!: string;

  @property({type: String, observer: '_pageChanged'})
  page!: string;

  @property({type: Array, computed: 'getReduxStateArray(rootState.responsePlans.all)'})
  allPlans!: any[];

  @property({type: Boolean, computed: '_computeViewPlannedAction(permissions)'})
  canViewPlannedAction!: boolean;

  static get observers() {
    return [
      '_routePageChanged(routeData.page)',
      '_routePlanChanged(routeData.plan)',
      '_routeCurrentPlanChanged(routeData.plan, allPlans)',
    ];
  }


  async _pageChanged(page: string) {

    this.set('loading', true);
    //const resolvedPageUrl = this.resolveUrl(page + '.html');
    const resolvedPageUrl = getDomainByEnv() + `/src/pages/app/cluster-reporting/${page}.js`;
    console.log('cluster router loading... :' + resolvedPageUrl);
    await import(resolvedPageUrl)
      .catch((err: any) => {
        console.log(err);
        this._notFound();
      }).then(() => {this.set('loading', false);})
  }

  _computeViewPlannedAction(permissions: GenericObject) {
    return permissions && permissions.viewPlannedAction;
  }


  _planChanged(plan: string) {
    this.reduxStore.dispatch(setCurrentResponsePlanID(plan));
  }

  _routePlanChanged(plan: string) {
    this.set('plan', plan);
  }

  _routeCurrentPlanChanged(id: string, allPlans: any[]) {
    if (!allPlans) {
      return;
    }

    const current = allPlans.find(function(plan) {
      return Number(id) === plan.id;
    });
    if (current) {
      this.reduxStore.dispatch(setCurrentResponsePlan(current));
    }
  }

  _routePageChanged(page: string) {
    var newPage = page || 'dashboard';

    this.set('page', newPage);

    if (newPage !== page) {
      setTimeout(() => {
        this.set('routeData.page', newPage);
      })
    }
  }

}

window.customElements.define('page-cluster-reporting-router', PageClusterReportingRouter);
