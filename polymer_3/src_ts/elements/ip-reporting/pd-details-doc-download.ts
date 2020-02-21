import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';

import '@polymer/app-layout/app-grid/app-grid-style';
import '@polymer/iron-icon/iron-icon';
import '@polymer/paper-spinner/paper-spinner';
import '@unicef-polymer/etoolsetools-loading/etools-loading';
import '../../settings';
import {store} from '../../redux/store';
import {currentProgramDocuments} from '../../redux/selectors/programmeDocument';
import UtilsMixin from '../../mixins/utils-mixin';
import NotificationsMixin from '../../mixins/notifications-mixin';
import {EtoolsPrpAjaxEl} from '../etools-prp-ajax';

//<link rel="import" href="js/pd-details-doc-download-functions">
//<link rel="import" href="js/pd-details-calculation-methods-functions.html">
// @Lajos
// behaviors: [
//   behaviors: [
  // App.Behaviors.UtilsBehavior,
  // App.Behaviors.ReduxBehavior,
  // App.Behaviors.NotificationsBehavior
// ],
// ],

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin NotificationsMixin
 */
class PdDetailsDocDownload extends UtilsMixin(NotificationsMixin(ReduxConnectedElement)) {

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

  //@Lajos bellowes needs to be checked for states
  @property({type: Object, computed: 'currentProgramDocuments(state)'})
  pd = {};


  @property({type: String, computed: 'getReduxStateValue(rootState.location.id)'})
  locationId!: string;

  @property({type: String, computed: '_computeDocUrl(locationId, pd.id)'})
  pdDocumentUrl!: string;

  @property({type: String})
  docUrl!: string;

  _openDoc(e: CustomEvent) {
    var self = this;
    e.preventDefault();
    this.set('spinnerActive', true);
    const thunk = (this.$.pddoc as EtoolsPrpAjaxEl).thunk();
    
    thunk()
        .then(function (res: any) {
          self.set('spinnerActive', false);
          // console.log(res);
          if (res.status !== 200 || !res.data.signed_pd_document_file) {
            // Fire Toast with error
            self._notifyServerError();
            console.error(res);
          } else {
            var anchor = document.createElement('a');
            anchor.setAttribute('href', res.data.signed_pd_document_file);
            anchor.setAttribute('target', '_blank');
            anchor.dispatchEvent(new MouseEvent('click',
              {bubbles: true, cancelable: true, view: window})
            );
            anchor.delete();
          }
        });
  }
}

window.customElements.define('pd-details-doc-download', PdDetailsDocDownload);
