var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement, html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-input/paper-textarea';
import '@polymer/paper-styles/typography';
import '@unicef-polymer/etools-loading/etools-loading';
import Endpoints from '../../endpoints';
import UtilsMixin from '../../mixins/utils-mixin';
import ModalMixin from '../../mixins/modal-mixin';
import '../etools-prp-ajax';
import { buttonsStyles } from '../../styles/buttons-styles';
import { modalStyles } from '../../styles/modal-styles';
import { fireEvent } from '../../utils/fire-custom-event';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin ModalMixin
 */
class SendBackModal extends ModalMixin(UtilsMixin(PolymerElement)) {
    static get template() {
        return html `
    ${buttonsStyles} ${modalStyles}
    <style include="iron-flex iron-flex-alignment iron-flex-reverse">
      :host {
        display: block;

        --paper-dialog: {
          width: 600px;
        }
      }

      h3 {
        @apply --paper-font-body2;
      }

      dl {
        font-size: 12px;
        color: var(--paper-grey-600);
      }

      dt, dd {
        display: inline;
        margin: 0;
      }

      dd::after {
        content: '\A';
	      white-space: pre;
      }
    </style>

    <etools-prp-ajax
        id="sendBack"
        url="[[sendBackUrl]]"
        method="post"
        body="[[data]]"
        content-type="application/json">
    </etools-prp-ajax>

    <paper-dialog
        id="dialog"
        with-backdrop
        opened="{{opened}}">

      <div class="header layout horizontal justified">
        <h2>Send back report</h2>

        <paper-icon-button
            class="self-center"
            on-tap="close"
            icon="icons:close">
        </paper-icon-button>
      </div>

      <paper-dialog-scrollable>
        <template
            is="dom-if"
            if="[[refresh]]"
            restamp="true">
          <h3>[[report.title]]</h3>

          <dl>
            <dt>Submission date:</dt>
            <dd>[[report.submission_date]]</dd>
            <dt>Reporting period:</dt>
            <dt>Reporting period:</dt>
            <dd>[[report.reporting_period]]</dd>
          </dl>

          <paper-textarea
              label="Feedback/Comments"
              value="{{data.comment}}"
              class="validate"
              always-float-label
              required>
          </paper-textarea>
        </template>
      </paper-dialog-scrollable>

      <div class="buttons layout horizontal-reverse">
        <paper-button
            on-tap="_sendBack"
            class="btn-primary"
            raised>
          Send back
        </paper-button>

        <paper-button
            on-tap="close">
          Cancel
        </paper-button>
      </div>

      <etools-loading active="[[pending]]"></etools-loading>
    </paper-dialog>
  `;
    }
    static get observers() {
        return [
            '_handleOpenedChanged(opened)'
        ];
    }
    _handleOpenedChanged(opened) {
        if (!opened) {
            return;
        }
        this.set('data', {
            status: 'Sen',
            comment: ''
        });
        this.set('pending', false);
        this.set('refresh', false);
        setTimeout(() => {
            this.set('refresh', true);
        });
    }
    _computeSendBackUrl(report) {
        return Endpoints.indicatorReportReview(report.id);
    }
    _sendBack() {
        if (!this._fieldsAreValid()) {
            return;
        }
        const self = this;
        this.set('pending', true);
        this.$.sendBack.abort();
        this.$.sendBack.thunk()()
            .then(() => {
            self.set('pending', false);
            self.close();
            fireEvent(self, 'report-reviewed');
        })
            .catch(() => {
            self.set('pending', false);
        });
    }
}
__decorate([
    property({ type: Boolean })
], SendBackModal.prototype, "pending", void 0);
__decorate([
    property({ type: Boolean })
], SendBackModal.prototype, "refresh", void 0);
__decorate([
    property({ type: Object })
], SendBackModal.prototype, "report", void 0);
__decorate([
    property({ type: Object })
], SendBackModal.prototype, "data", void 0);
__decorate([
    property({ type: String, computed: '_computeSendBackUrl(report)' })
], SendBackModal.prototype, "sendBackUrl", void 0);
window.customElements.define('send-back-modal', SendBackModal);
export { SendBackModal as SendBackModalEl };
