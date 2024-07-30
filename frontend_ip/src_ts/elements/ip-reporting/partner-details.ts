import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import {store} from '../../redux/store';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import {translate} from 'lit-translate';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';
import '../../etools-prp-common/elements/labelled-item';
import {partnerLoading} from '../../redux/selectors/partner';
import {computePartnerType} from './js/partner-details-functions';
import {RootState} from '../../typings/redux.types';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
@customElement('partner-details')
export class PartnerDetails extends MatomoMixin(UtilsMixin(connect(store)(LitElement))) {
  static styles = css`
    :host {
      display: block;
      margin-bottom: 25px;
    }

    etools-content-panel {
      /* Add your styles */
    }

    .app-grid {
      padding: 0;
      margin: 0;
      list-style: none;
    }

    .item {
      /* Add your styles */
    }

    .field-value {
      display: block;
      word-wrap: break-word;
    }

    .field-value[has-icon] {
      position: relative;
      padding-left: 2em;
    }

    .field-value etools-icon {
      position: absolute;
      left: 0;
      top: 0;
      color: var(--paper-grey-600);
    }
  `;

  @property({type: Object})
  partner!: any;

  @property({type: Boolean})
  loading = false;

  stateChanged(state: RootState) {
    this.loading = partnerLoading(state);

    if (this.partner != state.partner.current) {
      this.partner = state.partner.current;
    }
  }

  render() {
    return html`
      <etools-content-panel panel-title="${translate('PARTNER_DETAILS')}">
        <etools-loading ?active="${this.loading}"></etools-loading>

        <ul class="app-grid">
          <li class="item">
            <labelled-item label="${translate('FULL_NAME')}">
              <span class="field-value">${this._withDefault(this.partner?.title)}</span>
            </labelled-item>
          </li>
          <li class="item">
            <labelled-item label="${translate('SHORT_NAME')}">
              <span class="field-value">${this._withDefault(this.partner?.short_title)}</span>
            </labelled-item>
          </li>
          <li class="item">
            <labelled-item label="${translate('ALTERNATE_NAME')}">
              <span class="field-value">${this._withDefault(this.partner?.alternate_title)}</span>
            </labelled-item>
          </li>
          <li class="item">
            <labelled-item label="${translate('VENDOR_NUMBER')}">
              <span class="field-value">${this._withDefault(this.partner?.vendor_number)}</span>
            </labelled-item>
          </li>
          <li class="item">
            <labelled-item label="${translate('PARTNER_TYPE')}">
              <span class="field-value">${this._computePartnerType(this.partner)}</span>
            </labelled-item>
          </li>
          <li class="item">
            <labelled-item label="${translate('SHARED_PARTNERS')}">
              <span class="field-value">${this._withDefault(this.partner?.shared_partner_display)}</span>
            </labelled-item>
          </li>
          <li class="item">
            <labelled-item label="${translate('DATE_LAST_ASSESSED')}">
              <span class="field-value">${this._withDefault(this.partner?.core_values_assessment_date)}</span>
            </labelled-item>
          </li>
        </ul>

        <ul class="app-grid">
          <li class="item">
            <labelled-item label="${translate('ADDRESS')}">
              <span class="field-value" has-icon>
                <etools-icon name="communication:location-on"></etools-icon>
                ${this._withDefault(this.partner?.street_address)}
              </span>
            </labelled-item>
          </li>
          <li class="item">
            <labelled-item label="${translate('PHONE_NUMBER')}">
              <span class="field-value" has-icon>
                <etools-icon name="communication:phone"></etools-icon>
                ${this._withDefault(this.partner?.phone_number)}
              </span>
            </labelled-item>
          </li>
          <li class="item">
            <labelled-item label="${translate('EMAIL_ADDRESS')}">
              <span class="field-value" has-icon>
                <etools-icon name="communication:email"></etools-icon>
                ${this._withDefault(this.partner?.email)}
              </span>
            </labelled-item>
          </li>
        </ul>
      </etools-content-panel>
    `;
  }

  _partnerLoading(state: RootState): boolean {
    return partnerLoading(state);
  }

  _computePartnerType(partner: any): string {
    return computePartnerType(partner, this._withDefault);
  }
}
