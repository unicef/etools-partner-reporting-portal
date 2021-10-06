var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-styles/typography';
import ModalMixin from '../../mixins/modal-mixin';
import { buttonsStyles } from '../../styles/buttons-styles';
import { modalStyles } from '../../styles/modal-styles';
import { property } from '@polymer/decorators/lib/decorators';
/**
 * @polymer
 * @customElement
 * @appliesMixin ModalMixin
 */
class FeedbackModal extends ModalMixin(PolymerElement) {
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
            content: '\\A';
            white-space: pre;
          }

          .feedback {
            margin: 0 -24px;
            padding: 10px 24px;
            background: var(--paper-grey-100);
          }

          h4 {
            @apply --paper-font-caption;

            margin: 0 0 1em;
          }

          .feedback-date {
            margin: 0;
            font-size: 12px;
            color: var(--paper-grey-400);
          }

          .feedback-body {
            margin: 0;
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
            <h2>View feedback for this report</h2>

            <paper-icon-button
                class="self-center"
                on-tap="close"
                icon="icons:close">
            </paper-icon-button>
          </div>

          <paper-dialog-scrollable>
            <h3>[[report.title]]</h3>

            <dl>
              <dt>Submission date:</dt>
              <dd>[[report.submission_date]]</dd>
              <dt>Reporting period:</dt>
              <dt>Reporting period:</dt>
              <dd>[[report.reporting_period]]</dd>
            </dl>

            <div class="feedback">
              <h4>Newest feedback</h4>
              <p class="feedback-date">[[report.review_date]]</p>
              <p class="feedback-body">[[report.sent_back_feedback]]</p>
            </div>
          </paper-dialog-scrollable>

          <div class="buttons layout horizontal-reverse">
            <paper-button
                class="btn-primary"
                on-tap="close"
                raised>
              Ok
            </paper-button>
          </div>
        </paper-dialog>

      `;
    }
}
__decorate([
    property({ type: Object })
], FeedbackModal.prototype, "report", void 0);
window.customElements.define('feedback-modal', FeedbackModal);
export { FeedbackModal as FeedbackModalEl };
