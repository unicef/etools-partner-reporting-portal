import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';

import '@polymer/app-layout/app-grid/app-grid-style';
import '@polymer/iron-icon/iron-icon';
import '@polymer/paper-spinner/paper-spinner';
import '@unicef-polymer/etools-loading/etools-loading';
import '../../settings';
import {currentProgrammeDocument} from '../../redux/selectors/programmeDocuments';
import UtilsMixin from '../../mixins/utils-mixin';
import NotificationsMixin from '../../mixins/notifications-mixin';
import {EtoolsPrpAjaxEl} from '../etools-prp-ajax';
import {computeDocUrl} from './js/pd-details-doc-download-functions';


/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin NotificationsMixin
 */
class PdDetailsDocDownload extends NotificationsMixin(UtilsMixin(ReduxConnectedElement)) {

  static get template() {
    return html`
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
    <etools-prp-ajax
        id="pddoc"
        url="[[pdDocumentUrl]]">
    </etools-prp-ajax>
  `;
  }


  @property({type: Boolean})
  spinnerActive!: boolean;

  @property({type: Object, computed: 'currentProgrammeDocument(rootState)'})
  pd = {};

  @property({type: String, computed: 'getReduxStateValue(rootState.location.id)'})
  locationId!: string;

  @property({type: String, computed: '_computeDocUrl(locationId, pd.id)'})
  pdDocumentUrl!: string;

  @property({type: String})
  docUrl!: string;


  _computeDocUrl(locationId: string, pdId: string) {
    return computeDocUrl(locationId, pdId);
  }

  _openDoc(e: CustomEvent) {
    var self = this;
    e.preventDefault();
    this.set('spinnerActive', true);
    const thunk = (this.$.pddoc as EtoolsPrpAjaxEl).thunk();

    thunk()
      .then(function(res: any) {
        self.set('spinnerActive', false);
        if (res.status !== 200 || !res.data.signed_pd_document_file) {
          // Fire Toast with error
          self._notifyServerError();
          console.error(res);
        } else {
          let anchor = document.createElement('a');
          anchor.setAttribute('href', res.data.signed_pd_document_file);
          anchor.setAttribute('target', '_blank');
          anchor.dispatchEvent(new MouseEvent('click',
            {bubbles: true, cancelable: true, view: window})
          );
          anchor.remove();
        }
      });
  }

}

window.customElements.define('pd-details-doc-download', PdDetailsDocDownload);
