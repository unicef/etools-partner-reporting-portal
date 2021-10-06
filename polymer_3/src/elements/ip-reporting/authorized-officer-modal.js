var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../etools-prp-common/ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable';
import '@polymer/paper-styles/typography';
import '@polymer/iron-location/iron-location';
import '../../etools-prp-common/elements/error-modal';
import ModalMixin from '../../etools-prp-common/mixins/modal-mixin';
import { buttonsStyles } from '../../etools-prp-common/styles/buttons-styles';
import { modalStyles } from '../../etools-prp-common/styles/modal-styles';
import '../../etools-prp-common/elements/etools-prp-ajax';
import { currentProgrammeDocument } from '../../etools-prp-common/redux/selectors/programmeDocuments';
import { pdReportsUpdateSingle } from '../../redux/actions/pdReports';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import RoutingMixin from '../../etools-prp-common/mixins/routing-mixin';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import '../../etools-prp-common/elements/etools-prp-permissions';
import { computePostBody, computeAuthorizedPartners } from './js/authorized-officer-modal-functions';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import { waitForIronOverlayToClose } from '../../etools-prp-common/utils/util';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin ModalMixin
 * @appliesMixin RoutingMixin
 * @appliesMixin LocalizeMixin
 */
class AuthorizedOfficerModal extends LocalizeMixin(RoutingMixin(ModalMixin(UtilsMixin(ReduxConnectedElement)))) {
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
        .dialog-content {
          padding-bottom: 24px;
        }
        .buttons {
          justify-content: flex-start;
        }
        paper-dialog-scrollable {
          margin-top: 0px;
        }
      </style>

      <iron-location path="{{path}}"> </iron-location>

      <etools-prp-ajax
        id="submit"
        url="[[submitUrl]]"
        body="[[postBody]]"
        content-type="application/json"
        method="post"
      >
      </etools-prp-ajax>

      <paper-dialog modal opened="[[opened]]">
        <div class="header layout horizontal justified">
          <h2>[[localize('select_authorized_officer')]]</h2>

          <paper-icon-button class="self-center" on-tap="close" icon="icons:close"> </paper-icon-button>
        </div>
        <paper-dialog-scrollable>
          <div class="dialog-content">
            <h3>[[localize('could_not_be_submitted')]]</h3>
            <etools-dropdown
              id="officerDropdown"
              class="validate"
              label="[[localize('authorized_officer')]]"
              placeholder="[[localize('select')]]"
              options="[[currentAuthorizedPartners]]"
              option-value="value"
              option-label="title"
              required
              selected="{{selectedFocalPoint}}"
              with-backdrop
              hide-search
            >
            </etools-dropdown>
          </div>
        </paper-dialog-scrollable>

        <div class="buttons layout horizontal-reverse">
          <paper-button class="btn-primary" on-tap="_save" raised disabled="[[busy]]">
            [[localize('submit')]]
          </paper-button>
          <paper-button class="btn-primary" on-tap="_cancel" disabled="[[busy]]"> [[localize('cancel')]] </paper-button>
        </div>
      </paper-dialog>
      <error-modal id="error"></error-modal>
    `;
    }
    _computePostBody(selectedFocalPoint) {
        return computePostBody(selectedFocalPoint);
    }
    _computeAuthorizedPartners(pd) {
        return computeAuthorizedPartners(pd);
    }
    _currentProgrammeDocument(rootState) {
        return currentProgrammeDocument(rootState);
    }
    _save() {
        if (!this._fieldsAreValid()) {
            return;
        }
        this.set('busy', true);
        this.$.submit
            .thunk()()
            .then((res) => {
            const newPath = this.buildUrl(this._baseUrl, 'pd/' + this.pdId + '/view/reports');
            this.reduxStore.dispatch(pdReportsUpdateSingle(this.pdId, this.reportId, res.data));
            this.set('busy', false);
            this.close();
            waitForIronOverlayToClose(300).then(() => this.set('path', newPath));
        })
            .catch((res) => {
            const errors = res.data.non_field_errors;
            this.close();
            return this.$.error.open(errors);
        })
            .then(() => {
            this.set('busy', false);
        });
    }
    _cancel() {
        this.close();
    }
}
__decorate([
    property({ type: Object })
], AuthorizedOfficerModal.prototype, "data", void 0);
__decorate([
    property({ type: Array })
], AuthorizedOfficerModal.prototype, "emails", void 0);
__decorate([
    property({ type: String })
], AuthorizedOfficerModal.prototype, "userMail", void 0);
__decorate([
    property({ type: Boolean })
], AuthorizedOfficerModal.prototype, "busy", void 0);
__decorate([
    property({ type: String })
], AuthorizedOfficerModal.prototype, "selectedFocalPoint", void 0);
__decorate([
    property({ type: Object, computed: '_currentProgrammeDocument(rootState)' })
], AuthorizedOfficerModal.prototype, "currentPd", void 0);
__decorate([
    property({ type: Array, computed: '_computeAuthorizedPartners(currentPd)' })
], AuthorizedOfficerModal.prototype, "currentAuthorizedPartners", void 0);
__decorate([
    property({ type: Object, computed: '_computePostBody(selectedFocalPoint)' })
], AuthorizedOfficerModal.prototype, "postBody", void 0);
__decorate([
    property({ type: String })
], AuthorizedOfficerModal.prototype, "pdId", void 0);
__decorate([
    property({ type: String })
], AuthorizedOfficerModal.prototype, "reportId", void 0);
__decorate([
    property({ type: String })
], AuthorizedOfficerModal.prototype, "submitUrl", void 0);
window.customElements.define('authorized-officer-modal', AuthorizedOfficerModal);
export { AuthorizedOfficerModal as AuthorizedOfficerModalEl };
