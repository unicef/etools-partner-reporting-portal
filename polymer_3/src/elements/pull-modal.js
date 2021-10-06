var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
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
import { fireEvent } from '../utils/fire-custom-event';
import Endpoints from '../endpoints';
import { tableStyles } from '../styles/table-styles';
import { buttonsStyles } from '../styles/buttons-styles';
import { modalStyles } from '../styles/modal-styles';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin NotificationsMixin
 * @appliesMixin ModalMixin
 */
class PullModal extends NotificationsMixin(ModalMixin(UtilsMixin(ReduxConnectedElement))) {
    constructor() {
        super(...arguments);
        this.updatePending = false;
        this.postBody = {};
    }
    static get template() {
        return html `
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

    <etools-prp-permissions
      permissions="{{permissions}}">
    </etools-prp-permissions>

    <etools-prp-ajax
      id="reports"
      url="[[pullUrl]]">
    </etools-prp-ajax>

    <etools-prp-ajax
      id="pull"
      url="[[pullUrl]]"
      method="post"
      body=[[postBody]]
      content-type="application/json">
    </etools-prp-ajax>

    <paper-dialog
      id="dialog"
      with-backdrop
      opened="{{opened}}">
      <div class="header layout horizontal justified">
        <h2>Pull data</h2>
        <div class="layout horizontal">
          <p>Reporting period: [[reportingPeriod]]</p>

          <paper-icon-button
            class="self-center"
            on-tap="close"
            icon="icons:close">
          </paper-icon-button>
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

        <template
          id="list"
          is="dom-repeat"
          items="[[data.reports]]"
          as="report">
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
          <p>In order to keep data intact, aggregated data will be shown as a total progress.
            Any data provided manually will be overwritten.</p>
        </div>

      </paper-dialog-scrollable>

      <div class="buttons layout horizontal-reverse">
        <paper-button
          class="btn-primary"
          on-tap="_save"
          raised>
          OK
        </paper-button>

      </div>

      <confirm-box id="confirm"></confirm-box>

      <etools-loading active="[[updatePending]]"></etools-loading>
    </paper-dialog>
  `;
    }
    _computePullUrl(workspaceId, reportId, indicatorId) {
        return Endpoints.indicatorPullData(workspaceId, reportId, indicatorId);
    }
    _save() {
        const self = this;
        this.$.pull.thunk()()
            .then(() => {
            self.close();
            fireEvent(self, 'locations-updated');
        })
            .catch((err) => {
            self._notifyErrorMessage({ text: err.data.non_field_errors[0] });
        });
    }
    close() {
        this.set('opened', false);
        this.set('data', { 'reports': [] });
    }
    open() {
        const self = this;
        this.$.reports.abort();
        const thunk = this.$.reports.thunk();
        thunk()
            .then((res) => {
            self.set('data', { 'reports': res.data });
            self.set('opened', true);
        })
            .catch((err) => {
            self._notifyErrorMessage({ text: err.data.non_field_errors[0] });
        });
    }
}
__decorate([
    property({ type: String })
], PullModal.prototype, "reportingPeriod", void 0);
__decorate([
    property({ type: String })
], PullModal.prototype, "indicatorName", void 0);
__decorate([
    property({ type: Boolean })
], PullModal.prototype, "opened", void 0);
__decorate([
    property({ type: Boolean })
], PullModal.prototype, "updatePending", void 0);
__decorate([
    property({ type: Object })
], PullModal.prototype, "postBody", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.location.id)' })
], PullModal.prototype, "workspaceId", void 0);
__decorate([
    property({ type: String })
], PullModal.prototype, "indicatorId", void 0);
__decorate([
    property({ type: String })
], PullModal.prototype, "reportId", void 0);
__decorate([
    property({ type: String, computed: '_computePullUrl(workspaceId, reportId, indicatorId)' })
], PullModal.prototype, "pullUrl", void 0);
__decorate([
    property({ type: Object })
], PullModal.prototype, "data", void 0);
window.customElements.define('pull-modal', PullModal);
export { PullModal as PullModalEl };
