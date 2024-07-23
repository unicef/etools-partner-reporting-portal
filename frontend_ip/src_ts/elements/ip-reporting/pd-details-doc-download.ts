import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import {store} from '../../redux/store';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import {get as getTranslation} from 'lit-translate';
import {currentProgrammeDocument} from '../../etools-prp-common/redux/selectors/programmeDocuments';
import {computeDocUrl} from './js/pd-details-doc-download-functions';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {RootState} from '../../typings/redux.types';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax';

@customElement('pd-details-doc-download')
export class PdDetailsDocDownload extends MatomoMixin(UtilsMixin(connect(store)(LitElement))) {
  static styles = css`
    .spinner-size {
      width: 19px;
      height: 19px;
    }

    [hidden] {
      display: none !important;
    }
  `;

  @property({type: Boolean})
  spinnerActive = false;

  @property({type: Object})
  pd: any = {};

  @property({type: String})
  locationId = '';

  @property({type: String})
  pdDocumentUrl = '';

  @property({type: String})
  docUrl = '';

  stateChanged(state: RootState) {
    if (currentProgrammeDocument(state)) {
      this.pd = currentProgrammeDocument(state);
    }

    if (this.locationId != state.location.id) {
      this.locationId = state.location.id;
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('pd') || changedProperties.has('locationId')) {
      this.pdDocumentUrl = computeDocUrl(this.locationId, this.pd.id);
    }
  }

  render() {
    return html`
      <div>
        <paper-spinner
          ?hidden="${!this.spinnerActive}"
          class="spinner-size"
          .active="${this.spinnerActive}"
        ></paper-spinner>
        <a href="#" @click="${this._openDoc}" tracker="PD Details Download Document">Download Document</a>
      </div>
    `;
  }

  _openDoc(e: Event) {
    e.preventDefault();
    this.trackAnalytics(e as CustomEvent);
    this.spinnerActive = true;

    sendRequest({
      method: 'GET',
      endpoint: {url: this.pdDocumentUrl}
    }).then((res: any) => {
      this.spinnerActive = false;
      if (!res.signed_pd_document_file) {
        // Fire Toast with error
        fireEvent(this, 'toast', {
          text: getTranslation('AN_ERROR_OCCURRED'),
          showCloseBtn: true
        });
        console.error(res);
      } else {
        const anchor = document.createElement('a');
        anchor.href = res.signed_pd_document_file;
        anchor.target = '_blank';
        anchor.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));
        anchor.remove();
      }
    });
  }
}
