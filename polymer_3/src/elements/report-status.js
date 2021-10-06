var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import './status-badge';
import LocalizeMixin from '../mixins/localize-mixin';
import '@polymer/polymer/lib/elements/dom-if';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 */
class ReportStatus extends LocalizeMixin(ReduxConnectedElement) {
    constructor() {
        super(...arguments);
        this.noLabel = false;
        this.final = false;
        this.reportType = '';
    }
    static get template() {
        return html `
      <style>
        :host {
          display: inline-block;
          margin-right: .5em;
        }

        status-badge {
          display: inline-block;
          vertical-align: middle;
          position: relative;
          top: -3px;
        }
      </style>

      <status-badge type="[[type]]"></status-badge>
      <template
          is="dom-if"
          if="[[!noLabel]]">
        [[label]]
      </template>`;
    }
    _computeType(status) {
        switch (status) {
            case '1':
            case 'Sub':
            case 'Met':
            case 'OnT':
            case 'Com':
            case 'Acc':
                return 'success';
            case '2':
            case 'Ove':
            case 'Sen':
                return 'error';
            case '3':
            case 'Due':
            case 'NoP':
            case 'Ong':
                return 'neutral';
            case 'Rej':
            case 'Con':
            case 'Pla':
                return 'warning';
            case 'NoS':
                return 'no-status';
        }
        return 'no-status';
    }
    _computeLabel(status, final, app, reportType, localize) {
        switch (status) {
            case '1':
                return localize('nothing_due');
            case '2':
            case 'Ove':
                return localize('overdue');
            case '3':
            case 'Due':
                return localize('due');
            case 'Sub':
                return localize('submitted');
            case 'Rej':
                return localize('rejected');
            case 'Met':
                return final ? localize('met_results') : localize('met');
            case 'OnT':
                return localize('on_track');
            case 'NoP':
                return localize('no_progress');
            case 'Con':
                return final ? localize('constrained_partially') : localize('constrained');
            case 'Ong':
                return localize('ongoing');
            case 'Pla':
                return localize('planned');
            case 'Com':
                return localize('completed');
            case 'NoS':
                return localize('no_status');
            case 'Sen':
                return localize('sent_back');
            case 'Acc':
                return app === 'ip-reporting' && reportType !== 'HR' ? localize('accepted') : localize('received');
        }
    }
}
__decorate([
    property({ type: String })
], ReportStatus.prototype, "status", void 0);
__decorate([
    property({ type: Boolean })
], ReportStatus.prototype, "noLabel", void 0);
__decorate([
    property({ type: String, computed: '_computeType(status)' })
], ReportStatus.prototype, "type", void 0);
__decorate([
    property({ type: String, computed: '_computeLabel(status, final, app, reportType, localize)' })
], ReportStatus.prototype, "label", void 0);
__decorate([
    property({ type: Boolean })
], ReportStatus.prototype, "final", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.app.current)' })
], ReportStatus.prototype, "app", void 0);
__decorate([
    property({ type: String })
], ReportStatus.prototype, "reportType", void 0);
window.customElements.define('report-status', ReportStatus);
