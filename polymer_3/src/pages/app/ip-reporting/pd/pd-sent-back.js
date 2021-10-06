var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../../etools-prp-common/ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/paper-card/paper-card';
import '@polymer/paper-styles/typography';
import '@polymer/paper-button/paper-button';
import './pd-report-sr/reporting';
import { buttonsStyles } from '../../../../etools-prp-common/styles/buttons-styles';
import { programmeDocumentReportsCurrent } from '../../../../redux/selectors/programmeDocumentReports';
import UtilsMixin from '../../../../etools-prp-common/mixins/utils-mixin';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
class PdSentBack extends UtilsMixin(ReduxConnectedElement) {
    constructor() {
        super(...arguments);
        this.expanded = false;
        this.threshold = 250;
    }
    static get template() {
        return html `
    ${buttonsStyles}
    <style>
      :host {
        display: block;

        --paper-card-content: {
          padding: 30px 30px 30px 70px;
        };
      }

      .sent-back-feedback {
        width: 100%;
        margin-bottom: 25px;
        border-top: 2px solid var(--paper-red-700);
      }

      .ribbon {
        width: 30px;
        height: 30px;
        position: absolute;
        left: 16px;
        top: 0;
        z-index: 2;
        background: var(--paper-red-700);
      }

      .ribbon::before,
      .ribbon::after {
        content: "";
        width: 0;
        height: 0;
        position: absolute;
        top: 15px;
        border-top: 15px solid transparent;
        border-bottom: 15px solid transparent;
      }

      .ribbon::before {
        left: 0;
        border-left: 15px solid var(--paper-red-700);
      }

      .ribbon::after {
        right: 0;
        border-right: 15px solid var(--paper-red-700);
      }

      h3 {
        @apply --paper-font-body2;

        margin: 0 0 1em;
        text-transform: uppercase;
        color: var(--paper-red-700);
      }

      paper-button {
        margin: 0;
      }

      .collapsed {
        max-height: 100px;
        overflow: hidden;
        position: relative;
      }

      .collapsed::after {
        content: "";
        height: 50%;
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 2;
        background: linear-gradient(transparent, white);
      }
    </style>

    <template
      is="dom-if"
      if="[[hasFeedback]]"
      restamp="tre">
      <paper-card class="sent-back-feedback">
        <div class="ribbon" aria-hidden="true"></div>
        <div class="card-content">
          <h3>Report was sent back</h3>
          <div class$="[[containerClass]]" inner-text="[[currentReport.sent_back_feedback]]"></div>
        </div>

        <template
          is="dom-if"
          if="[[collapsible]]"
          restamp="true">
          <div class="card-actions">
            <paper-button
              noink
              class="btn-primary"
              on-click="_toggle">
              [[buttonText]]
            </paper-button>
          </div>
        </template>
      </paper-card>
      </div>
    </template>
  `;
    }
    _programmeDocumentReportsCurrent(rootState) {
        return programmeDocumentReportsCurrent(rootState);
    }
    _hasFeedback(currentReport) {
        return !!(this._equals(currentReport.status, 'Sen') && currentReport.sent_back_feedback);
    }
    _computeButtonText(expanded) {
        return expanded ? 'Collapse message' : 'Expand message';
    }
    _computeCollapsible(threshold, currentReport) {
        if (currentReport) {
            return currentReport.sent_back_feedback && currentReport.sent_back_feedback.length >= threshold;
        }
        return false;
    }
    _computeContainerClass(expanded, collapsible) {
        return collapsible && !expanded ? 'collapsed' : '';
    }
    _toggle() {
        this.set('expanded', !this.expanded);
    }
}
__decorate([
    property({ type: Object, computed: '_programmeDocumentReportsCurrent(rootState)' })
], PdSentBack.prototype, "currentReport", void 0);
__decorate([
    property({ type: Boolean, computed: '_hasFeedback(currentReport)' })
], PdSentBack.prototype, "hasFeedback", void 0);
__decorate([
    property({ type: Boolean })
], PdSentBack.prototype, "expanded", void 0);
__decorate([
    property({ type: Number })
], PdSentBack.prototype, "threshold", void 0);
__decorate([
    property({ type: Boolean, computed: '_computeCollapsible(threshold, currentReport)' })
], PdSentBack.prototype, "collapsible", void 0);
__decorate([
    property({ type: String, computed: '_computeContainerClass(expanded, collapsible)' })
], PdSentBack.prototype, "containerClass", void 0);
__decorate([
    property({ type: String, computed: '_computeButtonText(expanded)' })
], PdSentBack.prototype, "buttonText", void 0);
window.customElements.define('pd-sent-back', PdSentBack);
