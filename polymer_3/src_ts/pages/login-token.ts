
import {PolymerElement, html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/paper-styles/typography';
import '@polymer/iron-location/iron-location';
import '../elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../elements/etools-prp-ajax';
import Endpoints from '../endpoints';
import {fireEvent} from '../utils/fire-custom-event';

/**
 * @polymer
 * @customElement
 */
class PageLoginToken extends PolymerElement {

  static get template() {
    return html`
    <style>
    :host {
      display: block;
      padding: 25px;
    }

    h3 {
      @apply --paper-font-display1;
    }
    </style>

    <iron-location
      query="{{query}}">
    </iron-location>

    <etools-prp-ajax
      id="validateToken"
      url="[[tokenUrl]]"
      body="[[data]]"
      content-type="application/json"
      method="post">
    </etools-prp-ajax>

    <h3>The page is loading...</h3>
    `;
  }

  @property({type: String})
  query!: string;

  @property({type: Object})
  data = {};

  @property({type: String})
  tokenUrl: string = Endpoints.userLoginToken();


  connectedCallback() {
    super.connectedCallback();
    const token = this.query.split('=')[1];
    this.set('data', {'token': token});
    const self = this;
    const thunk = (this.$.validateToken as EtoolsPrpAjaxEl).thunk();
    thunk()
      .then(function (res: any) {
        if (res.data.success) {
          window.location.href = '/app/';
        }
      })
      .catch(function () {
        fireEvent(self, 'token-error');
      });
  }

}
window.customElements.define('page-login-token', PageLoginToken);
