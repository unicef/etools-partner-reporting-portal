import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-radio-button/paper-radio-button';
import '@polymer/paper-card/paper-card';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@unicef-polymer/etools-data-table/etools-data-table';

import '../../../elements/etools-prp-permissions';
import '../../../elements/workspace-dropdown';
import '../../../elements/etools-prp-workspaces';
import '../../../elements/cluster-reporting/add-plan-panel';
import RoutingMixin from '../../../mixins/routing-mixin';
import {GenericObject} from '../../../typings/globals.types';
import {tableStyles} from '../../../styles/table-styles';
import {appThemeClusterStyles} from '../../../styles/app-theme-cluster-styles';

/**
 * @polymer
 * @customElement
 * @appliesMixin RoutingMixin
 */
class PageClusterReportingSelectPlan extends RoutingMixin(ReduxConnectedElement) {

  public static get template() {
    return html`
    ${tableStyles} ${appThemeClusterStyles}
    <style include="data-table-styles">
      :host {
        display: block;
        position: absolute;
        height: 100%;
        width: 100%;
        max-width: 1200px;

        --container-inner-layout: {
          @apply --layout-vertical;
          @apply --layout-center-justified;
        };

        --underline-shown: {
          display: block;
        };

        --workspace-dropdown-input: {
          color: black;
        };

        --select-plan-workspaces-offset: {
          transform: translate(0px, -12px);
        };

        --workspaces-dropdown-width: {
          width: 240px;
        };
      }

      a {
        color: var(--theme-primary-color-b);
        font-size: 12px;
      }

      /*Center-aligns the radio button.*/
      .table-cell:first-of-type {
        text-align: center;
      }

      paper-button#confirm {
        background-color: var(--theme-primary-color);
        color: white;
      }

      paper-button#confirm[disabled] {
        background-color: var(--paper-grey-400);
      }

      paper-button#admin {
        background-color: var(--theme-primary-color);
        color: white;
        float: right;
      }

      paper-card {
        z-index: 1;
      }

      workspace-dropdown {
        z-index: 2;
      }

      paper-radio-button {
        --paper-radio-button-unchecked-color: var(--theme-primary-text-color-medium);
        --paper-radio-button-checked-color: var(--theme-primary-color);
        --paper-radio-button-checked-ink-color: var(--theme-primary-text-color-medium);
        --paper-radio-button-unchecked-ink-color: var(--theme-primary-color);
      }

      .container {
        @apply --layout-horizontal;
        @apply --layout-center-justified;
        @apply --layout-vertical;

        box-sizing: border-box;
        min-height: 100%;
        padding: 3em;
      }

      .container-inner {
        @apply --container-inner-layout;
      }

      .actions {
        @apply --layout-horizontal;
        @apply --layout-end-justified;
        margin-top: 3em;
      }

      .documents, .documents h5 {
        color: var(--paper-grey-600);
        font-size: 12px;
        font-weight: 400;
        margin: 0;
      }

      ul {
        margin: 0;
        list-style-type: none;
        padding: 0;
      }

      li {
        padding: 3px 0;
      }

      iron-icon {
        width: 22px;
        height: 22px;
        margin-right: 5px;
      }

      .response-header {
        display: inline-block;
      }

      h2 {
        display: inline-block;
        float: left;
      }

    </style>

    <iron-location
        query="{{query}}"
        path="{{path}}">
    </iron-location>

    <iron-query-params
        params-string="{{query}}"
        params-object="{{queryParams}}">
    </iron-query-params>

    <etools-prp-permissions
        permissions="{{permissions}}">
    </etools-prp-permissions>

    <etools-prp-workspaces
        all="{{workspaces}}"
        current="{{workspace}}">
    </etools-prp-workspaces>

    <div class="container">
      <div class="container-inner">
          <h2>Select Workspace</h2>
          <workspace-dropdown
              data="[[workspaces]]"
              current="[[workspace]]">
          </workspace-dropdown>
        <div class="response-header">
          <h2> Select Response Plan [[workspace]]</h2>
        </div>
        <template is="dom-if" if="[[permissions.adminResponsePlan]]">
          <add-plan-panel></add-plan-panel>
        </template>
        <paper-card>
          <etools-data-table-header label="">
            <etools-data-table-column field="selected" flex-1>
            </etools-data-table-column>
            <etools-data-table-column field="response" flex-2>
              <div class="table-column">Response Plan</div>
            </etools-data-table-column>
            <etools-data-table-column field="type" flex-2>
              <div class="table-column">Plan Type</div>
            </etools-data-table-column>
            <etools-data-table-column field="start" flex-2>
              <div class="table-column">Start Date</div>
            </etools-data-table-column>
            <etools-data-table-column field="end" flex-2>
              <div class="table-column">End Date</div>
            </etools-data-table-column>
          </etools-data-table-header>

          <template id="list"
                    is="dom-repeat"
                    items="[[responsePlans]]"
                    as="plan">
            <etools-data-table-row no-collapse>

              <div slot="row-data">
                <div class="table-cell" flex-1>
                  <paper-radio-button
                    checked="[[_determineIfChecked(selected, plan.id)]]"
                    name="[[plan.id]]"
                    on-tap="_handleRadioButtonChange">
                  </paper-radio-button>
                </div>
                <div class="table-cell" flex-2>
                  [[plan.title]]
                </div>
                <div class="table-cell" flex-2>
                  [[_planType(plan)]]
                </div>
                <div class="table-cell" flex-2>
                  [[plan.start]]
                </div>
                <div class="table-cell" flex-2>
                  [[plan.end]]
                </div>
              </div>

            </etools-data-table-row>
          </template>

        </paper-card>
      </div>
      <div class="actions">
        <template is="dom-if" if="[[queryParams.previous]]">
          <paper-button id="cancel" on-tap="_cancel">Cancel</paper-button>
        </template>
        <paper-button id="confirm"
                      on-tap="_confirm"
                      raised
                      disabled="[[!selected]]">
          Confirm
        </paper-button>
      </div>
    </div>
  `;
  }

  @property({type: String})
  query!: string;

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: Object})
  permissions!: GenericObject;

  @property({type: Array, computed: 'getReduxStateArray(rootState.responsePlans.all)'})
  responsePlans!: any[];

  @property({type: Number})
  selected = null;

  @property({type: String, computed: 'getReduxStateValue(rootState.workspaces.current)'})
  workspace!: string;


  _determineIfChecked(selected: number, id: number) {
    if (id === this.selected) {
      return true;
    }
    return false;
  }

  /*
  Note:
  paper-radio-group requires the radio buttons to be directly nested.
  It will not work for this component.
  on-tap and change events target different elements in Chrome than in Safari and FF.
  */

  //Gets correct target element when using Chrome.
  _handleRadioButtonChange(e: CustomEvent) {
    var target = e.target;
    if (e.target.id === 'onRadio' || e.target.id === 'offRadio') {
      target = e.target.parentNode.parentNode;
    }

    if (target.checked) {
      this.selected = target.name;
    } else {
      this.selected = null;
    }
  }

  _redirectToPlan(planId: string) {
    var newPath = this.buildUrl(this._baseUrl, '/plan/' + planId + '/');

    this.set('queryParams', {});
    this.set('path', newPath);
  }

  _redirectToAdmin() {
    window.location = '/api/admin/core/responseplan/';
  }

  _cancel() {
    this._redirectToPlan(this.queryParams.previous);
  }

  _confirm() {
    this._redirectToPlan(this.selected);
  }

  _planType(plan: GenericObject) {
    return plan.plan_type === 'OTHER' ? plan.plan_custom_type_label : plan.plan_type;
  }
}


window.customElements.define('page-cluster-reporting-select-plan', PageClusterReportingSelectPlan);
