import {ReduxConnectedElement} from '../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';

import '@polymer/app-layout/app-grid/app-grid-style';
import '@polymer/iron-icon/iron-icon';
import '@polymer/paper-spinner/paper-spinner';
import '@unicef-polymer/etools-loading/etools-loading';
import {currentProgrammeDocument} from '../../etools-prp-common/redux/selectors/programmeDocuments';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import NotificationsMixin from '../../etools-prp-common/mixins/notifications-mixin';
import {EtoolsPrpAjaxEl} from '../../etools-prp-common/elements/etools-prp-ajax';
import {computeDocUrl} from './js/pd-details-doc-download-functions';
import {RootState} from '../../typings/redux.types';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin NotificationsMixin
 */
class PdDetailsDocDownload extends MatomoMixin(NotificationsMixin(UtilsMixin(ReduxConnectedElement))) {
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
        <a href="" on-click="_openDoc" tracker="PD Details Download Document">Download Document</a>
      </div>
      <etools-prp-ajax id="pddoc" url="[[pdDocumentUrl]]"> </etools-prp-ajax>
    `;
  }

  @property({type: Boolean})
  spinnerActive!: boolean;

  @property({type: Object, computed: '_currentProgrammeDocument(rootState)'})
  pd = {};

  @property({type: String, computed: 'getReduxStateValue(rootState.location.id)'})
  locationId!: string;

  @property({type: String, computed: '_computeDocUrl(locationId, pd.id)'})
  pdDocumentUrl!: string;

  @property({type: String})
  docUrl!: string;

  _currentProgrammeDocument(rootState: RootState) {
    return currentProgrammeDocument(rootState);
  }

  _computeDocUrl(locationId: string, pdId: string) {
    return computeDocUrl(locationId, pdId);
  }

  _openDoc(e: CustomEvent) {
    e.preventDefault();
    this.trackAnalytics(e);
    this.set('spinnerActive', true);
    const thunk = (this.$.pddoc as EtoolsPrpAjaxEl).thunk();

    thunk().then((res: any) => {
      this.set('spinnerActive', false);
      if (res.status !== 200 || !res.data.signed_pd_document_file) {
        // Fire Toast with error
        this._notifyServerError();
        console.error(res);
      } else {
        const anchor = document.createElement('a');
        anchor.setAttribute('href', res.data.signed_pd_document_file);
        anchor.setAttribute('target', '_blank');
        anchor.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));
        anchor.remove();
      }
    });
  }
}

window.customElements.define('pd-details-doc-download', PdDetailsDocDownload);
