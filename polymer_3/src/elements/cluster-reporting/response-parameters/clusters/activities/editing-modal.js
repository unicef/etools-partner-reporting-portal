var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from '@polymer/polymer';
import { ReduxConnectedElement } from '../../../../../ReduxConnectedElement';
import { property } from '@polymer/decorators/lib/decorators';
import LocalizeMixin from '../../../../../mixins/localize-mixin';
import UtilsMixin from '../../../../../mixins/utils-mixin';
import DateMixin from '../../../../../mixins/date-mixin';
import '@polymer/polymer/lib/elements/dom-if';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/iron-form/iron-form';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-location/iron-location';
import '@polymer/paper-styles/typography';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable';
import '@polymer/paper-dialog/paper-dialog';
import '../../../../form-fields/dropdown-form-input';
import '../../../../form-fields/cluster-dropdown-content';
import Endpoints from '../../../../../endpoints';
import { buttonsStyles } from '../../../../../styles/buttons-styles';
import { modalStyles } from '../../../../../styles/modal-styles';
import { fireEvent } from '../../../../../utils/fire-custom-event';
/**
 * @polymer
 * @customElement
 * @appliesMixin ModalMixin
 * @appliesMixin UtilsMixin
 * @appliesMixin DateMixin
 */
class ClusterActivitiesEditingModal extends LocalizeMixin(UtilsMixin(DateMixin(ReduxConnectedElement))) {
    constructor() {
        super(...arguments);
        this.opened = false;
        this.updatePending = false;
        this.data = {};
        this.refresh = false;
    }
    static get template() {
        // language=HTML
        return html `
    ${modalStyles} ${buttonsStyles}
    <style include="app-grid-style iron-flex iron-flex-alignment iron-flex-reverse">
      :host {
        display: block;

        --app-grid-columns: 3;
        --app-grid-gutter: 15px;
        --app-grid-item-height: auto;
        --app-grid-expandible-item-columns: 3;

        --paper-dialog: {
          width: 700px;
          margin: 0;
          }
      }

      .full-width {
        @apply --app-grid-expandible-item;
      }

      .header {
        height: 48px;
        padding: 0 24px;
        margin: 0;
        color: white;
        background: var(--theme-primary-color);
      }

      .header h2 {
        @apply --paper-font-title;

        margin: 0;
        line-height: 48px;
      }

      .header paper-icon-button {
        margin: 0 -13px 0 20px;
        color: white;
      }

      .buttons {
        padding: 24px;
      }
    </style>

    <iron-location path="{{path}}"></iron-location>

    <etools-prp-ajax
        id="editActivity"
        url="[[url]]"
        body="[[data]]"
        content-type="application/json"
        method="patch">
    </etools-prp-ajax>

    <paper-dialog
        id="dialog"
        with-backdrop
        opened="[[opened]]">
      <div class="header layout horizontal justified">
        <h2>[[localize('edit_cluster_activity')]]</h2>
          <paper-icon-button
              class="self-center"
              on-tap="close"
              icon="icons:close">
          </paper-icon-button>
        </div>
      </div>

      <paper-dialog-scrollable>
        <template
            is="dom-if"
            if="[[refresh]]"
            restamp="true">
          <iron-form class="app-grid">
            <paper-input
              class="item validate full-width"
              id="title"
              label="[[localize('cluster_activity_title')]]"
              value="{{data.title}}"
              type="string"
              on-input="_validate"
              required>
            </paper-input>
          </iron-form>
        </template>
      </paper-dialog-scrollable>

      <div class="buttons layout horizontal-reverse">
        <paper-button class="btn-primary" on-tap="_save" raised>
          [[localize('save')]]
        </paper-button>

        <paper-button class="btn-cancel" on-tap="close">
          [[localize('cancel')]]
        </paper-button>
      </div>

      <etools-loading active="[[updatePending]]"></etools-loading>

    </paper-dialog>
    `;
    }
    _computeUrl(activityID) {
        return Endpoints.responseParamtersClustersActivityDetail(activityID);
    }
    close() {
        this.set('data', {});
        this.set('opened', false);
        this.set('refresh', false);
    }
    open() {
        this.set('data', Object.assign({}, { id: this.editData.id, title: this.editData.title }));
        this.set('opened', true);
        this.set('refresh', true);
    }
    _validate(e) {
        e.target.validate();
    }
    _save() {
        if (!this._fieldsAreValid()) {
            return;
        }
        const self = this;
        const thunk = this.$.editActivity.thunk();
        self.updatePending = true;
        thunk()
            .then((res) => {
            self.updatePending = false;
            fireEvent(self, 'activity-edited', res.data);
            self.close();
        })
            .catch((_err) => {
            self.updatePending = false;
            // TODO: error handling
        });
    }
}
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], ClusterActivitiesEditingModal.prototype, "responsePlanID", void 0);
__decorate([
    property({ type: Boolean })
], ClusterActivitiesEditingModal.prototype, "opened", void 0);
__decorate([
    property({ type: Boolean })
], ClusterActivitiesEditingModal.prototype, "updatePending", void 0);
__decorate([
    property({ type: String, computed: '_computeUrl(data.id)' })
], ClusterActivitiesEditingModal.prototype, "url", void 0);
__decorate([
    property({ type: Object })
], ClusterActivitiesEditingModal.prototype, "data", void 0);
__decorate([
    property({ type: Object })
], ClusterActivitiesEditingModal.prototype, "editData", void 0);
__decorate([
    property({ type: Boolean })
], ClusterActivitiesEditingModal.prototype, "refresh", void 0);
window.customElements.define('cluster-activities-editing-modal', ClusterActivitiesEditingModal);
export { ClusterActivitiesEditingModal as ClusterActivitiesEditingModalEl };
