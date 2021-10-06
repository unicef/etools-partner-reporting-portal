var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../etools-prp-common/ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@polymer/iron-icon/iron-icon';
import '@polymer/paper-spinner/paper-spinner';
import '@unicef-polymer/etools-loading/etools-loading';
import { currentProgrammeDocument } from '../../etools-prp-common/redux/selectors/programmeDocuments';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import NotificationsMixin from '../../etools-prp-common/mixins/notifications-mixin';
import { computeDocUrl } from './js/pd-details-doc-download-functions';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin NotificationsMixin
 */
class PdDetailsDocDownload extends NotificationsMixin(UtilsMixin(ReduxConnectedElement)) {
    constructor() {
        super(...arguments);
        this.pd = {};
    }
    static get template() {
        return html `
      <style>
        .spinner-size {
          width: 19px;
          height: 19px;
        }
        [hidden] {
          display: none !important;
        }
      </style>

      <div>
        <!--Text-->
        <paper-spinner hidden="[[!spinnerActive]]" class="spinner-size" active="[[spinnerActive]]"></paper-spinner>
        <a href="" on-click="_openDoc">Download Document</a>
      </div>
      <etools-prp-ajax id="pddoc" url="[[pdDocumentUrl]]"> </etools-prp-ajax>
    `;
    }
    _currentProgrammeDocument(rootState) {
        return currentProgrammeDocument(rootState);
    }
    _computeDocUrl(locationId, pdId) {
        return computeDocUrl(locationId, pdId);
    }
    _openDoc(e) {
        e.preventDefault();
        this.set('spinnerActive', true);
        const thunk = this.$.pddoc.thunk();
        thunk().then((res) => {
            this.set('spinnerActive', false);
            if (res.status !== 200 || !res.data.signed_pd_document_file) {
                // Fire Toast with error
                this._notifyServerError();
                console.error(res);
            }
            else {
                const anchor = document.createElement('a');
                anchor.setAttribute('href', res.data.signed_pd_document_file);
                anchor.setAttribute('target', '_blank');
                anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
                anchor.remove();
            }
        });
    }
}
__decorate([
    property({ type: Boolean })
], PdDetailsDocDownload.prototype, "spinnerActive", void 0);
__decorate([
    property({ type: Object, computed: '_currentProgrammeDocument(rootState)' })
], PdDetailsDocDownload.prototype, "pd", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.location.id)' })
], PdDetailsDocDownload.prototype, "locationId", void 0);
__decorate([
    property({ type: String, computed: '_computeDocUrl(locationId, pd.id)' })
], PdDetailsDocDownload.prototype, "pdDocumentUrl", void 0);
__decorate([
    property({ type: String })
], PdDetailsDocDownload.prototype, "docUrl", void 0);
window.customElements.define('pd-details-doc-download', PdDetailsDocDownload);
