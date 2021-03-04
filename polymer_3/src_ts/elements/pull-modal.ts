import {ReduxConnectedElement} from '../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@unicef-polymer/etools-loading/etools-loading.js';

import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/paper-styles/typography';
import '@polymer/iron-location/iron-location';
import '@polymer/paper-input/paper-input';
import '@polymer/app-layout/app-grid/app-grid-style';
import {GenericObject} from '../typings/globals.types';
import ModalMixin from '../mixins/modal-mixin';
import UtilsMixin from '../mixins/utils-mixin';
import NotificationsMixin from '../mixins/notifications-mixin';
import './etools-prp-permissions';
import './confirm-box';
import './project-status';
import './page-body';
import './list-placeholder';
import './status-badge';
import './etools-prp-ajax';
import {fireEvent} from '../utils/fire-custom-event';
import Endpoints from '../endpoints';
import {tableStyles} from '../styles/table-styles';
import {buttonsStyles} from '../styles/buttons-styles';
import {modalStyles} from '../styles/modal-styles';
import {EtoolsPrpAjaxEl} from './etools-prp-ajax';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin NotificationsMixin
 * @appliesMixin ModalMixin
 */
class PullModal extends NotificationsMixin(ModalMixin(UtilsMixin(ReduxConnectedElement))) {
  static get template() {
    return html`
      ${tableStyles} ${buttonsStyles} ${modalStyles}
      <style include="data-table-styles iron-flex iron-flex iron-flex-alignment iron-flex-reverse">
        :host {
          display: block;

          --header-title: {
            display: block;
          }
          --paper-dialog: {
            width: 800px;
          }
        }

        .qpr-header {
          transform: translate(24px, 48px);
        }

        .qpr-header h3 {
          font-size: 18px;
        }

        .qpr-header h4 {
          font-size: 16px;
        }

        .overwrite-notification {
          background-color: #ffcc00;
          margin: 20px;
        }

        .overwrite-notification iron-icon {
          top: 10px;
          margin: 12px;
        }
      </style>

      <etools-prp-permissions permissions="{{permissions}}"> </etools-prp-permissions>

      <etools-prp-ajax id="reports" url="[[pullUrl]]"> </etools-prp-ajax>

      <etools-prp-ajax id="pull" url="[[pullUrl]]" method="post" body="[[postBody]]" content-type="application/json">
      </etools-prp-ajax>

      <paper-dialog id="dialog" modal opened="{{opened}}">
        <div class="header layout horizontal justified">
          <h2>Pull data</h2>
          <div class="layout horizontal">
            <p>Reporting period: [[reportingPeriod]]</p>

            <paper-icon-button class="self-center" on-tap="close" icon="icons:close"> </paper-icon-button>
          </div>
        </div>

        <paper-dialog-scrollable>
          <div class="qpr-header">
            <h3>[[indicatorName]]</h3>
            <h4>For this high frequency indicator data will be pulled from reports matching this time period:</h4>
          </div>
          <etools-data-table-header no-collapse>
            <etools-data-table-column field="report">
              <div class="table-column">Report #</div>
            </etools-data-table-column>
            <etools-data-table-column field="due">
              <div class="table-column">Due date</div>
            </etools-data-table-column>
            <etools-data-table-column field="period">
              <div class="table-column">Reporting Period</div>
            </etools-data-table-column>
            <etools-data-table-column field="progress">
              <div class="table-column">Total indicator progress across all locations</div>
            </etools-data-table-column>
          </etools-data-table-header>

          <template id="list" is="dom-repeat" items="[[data.reports]]" as="report">
            <etools-data-table-row no-collapse>
              <div slot="row-data">
                <div class="table-cell table-cell--text">
                  [[report.report_name]]
                </div>
                <div class="table-cell table-cell--text">
                  [[report.due_date]]
                </div>
                <div class="table-cell table-cell--text">
                  [[report.start_date]] - [[report.end_date]]
                </div>
                <div class="table-cell table-cell--text">
                  [[report.report_location_total.v]]
                </div>
              </div>
            </etools-data-table-row>
          </template>

          <div class="layout horizontal justified overwrite-notification">
            <iron-icon icon="icons:info"></iron-icon>
            <p>
              In order to keep data intact, aggregated data will be shown as a total progress. Any data provided
              manually will be overwritten.
            </p>
          </div>
        </paper-dialog-scrollable>

        <div class="buttons layout horizontal-reverse">
          <paper-button class="btn-primary" on-tap="_save" raised>
            OK
          </paper-button>
        </div>

        <confirm-box id="confirm"></confirm-box>

        <etools-loading active="[[updatePending]]"></etools-loading>
      </paper-dialog>
    `;
  }

  @property({type: String})
  reportingPeriod!: string;

  @property({type: String})
  indicatorName!: string;

  @property({type: Boolean})
  opened!: boolean;

  @property({type: Boolean})
  updatePending = false;

  @property({type: Object})
  postBody: GenericObject = {};

  @property({type: String, computed: 'getReduxStateValue(rootState.location.id)'})
  workspaceId!: string;

  @property({type: String})
  indicatorId!: string;

  @property({type: String})
  reportId!: string;

  @property({type: String, computed: '_computePullUrl(workspaceId, reportId, indicatorId)'})
  pullUrl!: string;

  @property({type: Object})
  data!: GenericObject;

  _computePullUrl(workspaceId: string, reportId: string, indicatorId: string) {
    return Endpoints.indicatorPullData(workspaceId, reportId, indicatorId);
  }

  _save() {
    (this.$.pull as EtoolsPrpAjaxEl)
      .thunk()()
      .then(() => {
        this.close();
        fireEvent(this, 'locations-updated');
      })
      .catch((err: any) => {
        this._notifyErrorMessage({text: err.data.non_field_errors[0]});
      });
  }

  close() {
    this.set('opened', false);
    this.set('data', {reports: []});
  }

  open() {
    (this.$.reports as EtoolsPrpAjaxEl).abort();

    const thunk = (this.$.reports as EtoolsPrpAjaxEl).thunk();
    thunk()
      .then((res: GenericObject) => {
        this.set('data', {reports: res.data});
        this.set('opened', true);
      })
      .catch((err: any) => {
        this._notifyErrorMessage({text: err.data.non_field_errors[0]});
      });
  }
}
window.customElements.define('pull-modal', PullModal);

export {PullModal as PullModalEl};
