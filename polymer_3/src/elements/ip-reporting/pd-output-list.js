var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../etools-prp-common/ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@unicef-polymer/etools-loading/etools-loading.js';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import './pd-output';
import '../../etools-prp-common/elements/list-placeholder';
import '../ip-reporting/pd-output';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import { computeViewData } from './js/pd-output-list-functions';
import { llosAll } from '../../redux/selectors/llos';
import { currentProgrammeDocument } from '../../etools-prp-common/redux/selectors/programmeDocuments';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 */
class PdOutputList extends LocalizeMixin(ReduxConnectedElement) {
    static get template() {
        return html `
      <style include="iron-flex iron-flex-alignment">
        :host {
          display: block;
        }

        etools-content-panel::part(ecp-content) {
          padding: 0;
        }

        .loader {
          padding: 2em 0;
        }

        pd-output {
          margin-bottom: 25px;
        }

        pd-output:not(:first-of-type) {
          border-top: 1px solid var(--paper-grey-300);
        }
      </style>

      <etools-content-panel panel-title="[[localize('pd_output_results')]]">
        <template is="dom-if" if="[[loading]]" restamp="true">
          <div class="loader layout horizontal center-center">
            <div>
              <etools-loading no-overlay active></etools-loading>
            </div>
          </div>
        </template>

        <template is="dom-if" if="[[!loading]]">
          <template is="dom-repeat" items="[[viewData]]">
            <pd-output
              data="[[item]]"
              current-pd="[[currentPd]]"
              override-mode="[[overrideMode]]"
              workspace-id="[[workspaceId]]"
            >
            </pd-output>
          </template>

          <list-placeholder data="[[viewData]]" loading="[[loading]]"> </list-placeholder>
        </template>
      </etools-content-panel>
    `;
    }
    _currentProgrammeDocument(rootState) {
        return currentProgrammeDocument(rootState);
    }
    _computeViewData(data) {
        return computeViewData(data);
    }
    _llosAll(rootState) {
        return llosAll(rootState);
    }
}
__decorate([
    property({ type: String })
], PdOutputList.prototype, "overrideMode", void 0);
__decorate([
    property({ type: Boolean, computed: 'getReduxStateValue(rootState.programmeDocumentReports.current.loading)' })
], PdOutputList.prototype, "loading", void 0);
__decorate([
    property({ type: Array, computed: '_llosAll(rootState)' })
], PdOutputList.prototype, "data", void 0);
__decorate([
    property({ type: Array, computed: '_computeViewData(data)' })
], PdOutputList.prototype, "viewData", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.programmeDocumentReports.current.id)' })
], PdOutputList.prototype, "reportId", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.location.id)' })
], PdOutputList.prototype, "workspaceId", void 0);
__decorate([
    property({ type: Number, computed: 'getReduxStateValue(rootState.programmeDocuments.current)' })
], PdOutputList.prototype, "pdId", void 0);
__decorate([
    property({ type: Object, computed: '_currentProgrammeDocument(rootState)' })
], PdOutputList.prototype, "currentPd", void 0);
window.customElements.define('pd-output-list', PdOutputList);
export { PdOutputList as PdOutputListEl };
