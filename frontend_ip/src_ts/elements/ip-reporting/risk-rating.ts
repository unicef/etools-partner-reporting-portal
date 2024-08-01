import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import {store} from '../../redux/store';
import {partnerLoading} from '../../redux/selectors/partner';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {RootState} from '../../typings/redux.types';
import '../../etools-prp-common/elements/labelled-item';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import {translate} from 'lit-translate';

@customElement('risk-rating')
export class RiskRating extends UtilsMixin(connect(store)(LitElement)) {
  static styles = [layoutStyles, css`
    labelled-item {
      padding-block-start: 8px;
      padding-block-end: 8px;
    }
    .field-value {
      display: block;
      word-wrap: break-word;
    }
  `];

  @property({type: Object})
  partner: any = {};

  @property({type: Object})
  user: any = {};

  @property({type: Boolean})
  loading = false;

  render() {
    return html`
      <etools-content-panel panel-title="${translate('CAPACITY_ASSESSMENT')}">
        <etools-loading ?active="${this.loading}"></etools-loading>

        <div class="row">
          <div class="col-md-4 col-12">
            <labelled-item label="${translate('FINANCIAL_RISK_RATING')}">
              <span class="field-value">${this._withDefault(this.partner.rating)}</span>
            </labelled-item>
          </div>
          <div class="col-md-4 col-12">
            <labelled-item label="${translate('TYPE_OF_ASSESSMENT')}">
              <span class="field-value">${this._withDefault(this.partner.type_of_assessment)}</span>
            </labelled-item>
          </div>
          <div class="col-md-4 col-12">
            <labelled-item label="${translate('RISK_RATING_LAST_DATE_ASSESSMENT')}">
              <span class="field-value">${this._withDefault(this.partner.last_assessment_date)}</span>
            </labelled-item>
          </div>
          <div class="col-md-4 col-12">
            <labelled-item label="${translate('SEA_RISK_RATING')}">
              <span class="field-value">${this._withDefault(this.partner.sea_risk_rating_name)}</span>
            </labelled-item>
          </div>
          <div class="col-md-4 col-12">
            <labelled-item label="${translate('PSEA_RISK_RATING_DATE_OF_ASSESSMENT')}">
              <span class="field-value">${this._withDefault(this.partner.psea_assessment_date)}</span>
            </labelled-item>
          </div>
        </div>
      </etools-content-panel>
    `;
  }

  stateChanged(state: RootState) {
    if (this.partner !== state.partner.current) {
      this.partner = state.partner.current;
    }

    if (this.user !== state.userProfile.profile) {
      this.user = state.userProfile.profile;
    }

    if (this.partner !== partnerLoading(state)) {
      this.loading = partnerLoading(state);
    }
  }
}
