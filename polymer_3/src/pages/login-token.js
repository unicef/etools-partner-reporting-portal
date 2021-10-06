var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement, html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/paper-styles/typography';
import '@polymer/iron-location/iron-location';
import '../etools-prp-common/elements/etools-prp-ajax';
import Endpoints from '../endpoints';
import { fireEvent } from '../etools-prp-common/utils/fire-custom-event';
import { BASE_PATH } from '../etools-prp-common/config';
/**
 * @polymer
 * @customElement
 */
class PageLoginToken extends PolymerElement {
    constructor() {
        super(...arguments);
        this.data = {};
        this.tokenUrl = Endpoints.userLoginToken();
    }
    static get template() {
        return html `
      <style>
        :host {
          display: block;
          padding: 25px;
        }

        h3 {
          @apply --paper-font-display1;
        }
      </style>

      <iron-location query="{{query}}"> </iron-location>

      <etools-prp-ajax
        id="validateToken"
        url="[[tokenUrl]]"
        body="[[data]]"
        content-type="application/json"
        method="post"
      >
      </etools-prp-ajax>

      <h3>The page is loading...</h3>
    `;
    }
    connectedCallback() {
        super.connectedCallback();
        const token = this.query.split('=')[1];
        this.set('data', { token: token });
        const thunk = this.$.validateToken.thunk();
        thunk()
            .then((res) => {
            if (res.data.success) {
                window.location.href = `/${BASE_PATH}/`;
            }
        })
            .catch(() => {
            fireEvent(this, 'token-error');
        });
    }
}
__decorate([
    property({ type: String })
], PageLoginToken.prototype, "query", void 0);
__decorate([
    property({ type: Object })
], PageLoginToken.prototype, "data", void 0);
__decorate([
    property({ type: String })
], PageLoginToken.prototype, "tokenUrl", void 0);
window.customElements.define('page-login-token', PageLoginToken);
