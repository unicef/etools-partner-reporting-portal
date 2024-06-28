import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import {store} from '../../redux/store';
import {partnerLoading} from '../../redux/selectors/partner';
import {RootState} from '../../typings/redux.types';
import '../../etools-prp-common/elements/labelled-item';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-loading/etools-loading';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';

@customElement('risk-rating')
export class RiskRating extends UtilsMixin(LocalizeMixin(connect(store)(LitElement))) {
  static styles = css`
    :host {
      display: block;
      --app-grid-columns: 3;
      --app-grid-gutter: 25px;
      --app-grid-item-height: auto;
    }

    .app-grid {
      padding: 0;
      margin: 0;
      list-style: none;
    }

    .field-value {
      display: block;
      word-wrap: break-word;
    }
  `;

  @property({type: Object})
  partner: any = {};

  @property({type: Object})
  user: any = {};

  @property({type: Boolean})
  loading: boolean = false;

  render() {
    return html`
      <etools-content-panel panel-title="${this.localize('capacity_assessment')}">
        <etools-loading ?active="${this.loading}"></etools-loading>

        <ul class="app-grid">
          <li class="item">
            <labelled-item label="${this.localize('financial_risk_rating')}">
              <span class="field-value">${this._withDefault(this.partner.rating)}</span>
            </labelled-item>
          </li>
          <li class="item">
            <labelled-item label="${this.localize('type_of_assessment')}">
              <span class="field-value">${this._withDefault(this.partner.type_of_assessment)}</span>
            </labelled-item>
          </li>
          <li class="item">
            <labelled-item label="${this.localize('risk_rating_last_date_assessment')}">
              <span class="field-value">${this._withDefault(this.partner.last_assessment_date)}</span>
            </labelled-item>
          </li>
          <li class="item">
            <labelled-item label="${this.localize('sea_risk_rating')}">
              <span class="field-value">${this._withDefault(this.partner.sea_risk_rating_name)}</span>
            </labelled-item>
          </li>
          <li class="item">
            <labelled-item label="${this.localize('psea_risk_rating_date_of_assessment')}">
              <span class="field-value">${this._withDefault(this.partner.psea_assessment_date)}</span>
            </labelled-item>
          </li>
        </ul>
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
