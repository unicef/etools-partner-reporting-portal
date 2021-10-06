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
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/paper-styles/typography';
import '@polymer/iron-location/iron-location';
import '@polymer/paper-input/paper-input';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@polymer/polymer/lib/elements/dom-if';
import UtilsMixin from '../mixins/utils-mixin';
import ModalMixin from '../mixins/modal-mixin';
import RoutingMixin from '../mixins/routing-mixin';
import LocalizeMixin from '../mixins/localize-mixin';
import './error-modal';
import './etools-prp-number';
import './etools-prp-ajax';
import { buttonsStyles } from '../styles/buttons-styles';
import { modalStyles } from '../styles/modal-styles';
/**
 * @polymer
 * @customElement
 * @appliesMixin ModalMixin
 * @appliesMixin UtilsMixin
 * @appliesMixin RoutingMixin
 * @appliesMixin LocalizeMixin
 */
class RefreshReportModal extends LocalizeMixin(RoutingMixin(UtilsMixin(ModalMixin(ReduxConnectedElement)))) {
    constructor() {
        super(...arguments);
        this.busy = false;
    }
    static get template() {
        return html `
    ${buttonsStyles} ${modalStyles}
    <style include="app-grid-style iron-flex iron-flex-alignment iron-flex-reverse">
      :host {
        display: block;
        --paper-dialog: {
          width: 750px;
        }

      }
    </style>

    <iron-location
      path="{{path}}">
    </iron-location>

    <etools-prp-ajax
        id="refreshReport"
        url="[[refreshUrl]]"
        body="[[data]]"
        method="post"
        content-type="application/json">
    </etools-prp-ajax>

    <paper-dialog opened=[[opened]]>
      <div class="header layout horizontal justified">
        <h2>[[localize('are_you_sure')]]?</h2>

        <paper-icon-button class="self-center" on-tap="close" icon="icons:close">
        </paper-icon-button>
      </div>
      <paper-dialog-scrollable>

        <h3>
            <template
                is="dom-if"
                if="[[_equals(data.report_type, 'PR')]]"
                restamp="true">
                [[localize('you_are_about_to_delete')]]
            </template>

            <template
                is="dom-if"
                if="[[_equals(data.report_type, 'IR')]]"
                restamp="true">
                You are about to reset all location data and entered info for this Indicator Report; including Overall status, Narrative Assessment, and Report Status. New location data entries will be generated. <!-- Localize this line! -->
                This action is irreversible. Please click "Refresh" if you wish to proceed.  <!-- Localize this line! -->
            </template>
        </h3>

      </paper-dialog-scrollable>

      <div class="buttons layout horizontal-reverse">
        <paper-button
          class="btn-primary"
          on-tap="_refresh"
          raised
          disabled="[[busy]]">
          [[localize('refresh')]]
        </paper-button>
        <paper-button
          class="btn-primary"
          on-tap="_cancel"
          disabled="[[busy]]">
          [[localize('cancel')]]
        </paper-button>
      </div>
    </paper-dialog>
    <error-modal id="error"></error-modal>
`;
    }
    _refresh() {
        const self = this;
        this.set('busy', true);
        const refreshThunk = this.$.refreshReport.thunk();
        refreshThunk()
            .then(() => {
            window.location.reload();
        })
            .catch((res) => {
            console.log(res);
            self.set('busy', false);
        });
    }
    _cancel() {
        this.close();
    }
}
__decorate([
    property({ type: Object })
], RefreshReportModal.prototype, "data", void 0);
__decorate([
    property({ type: Boolean })
], RefreshReportModal.prototype, "busy", void 0);
window.customElements.define('refresh-report-modal', RefreshReportModal);
export { RefreshReportModal as RefreshReportModalEl };
