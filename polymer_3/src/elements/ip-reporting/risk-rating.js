var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../etools-prp-common/ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-loading/etools-loading';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import '../../etools-prp-common/elements/labelled-item';
import { partnerLoading } from '../../redux/selectors/partner';
/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 * @appliesMixin UtilsMixin
 */
class RiskRating extends UtilsMixin(LocalizeMixin(ReduxConnectedElement)) {
    static get template() {
        return html `
      <style include="app-grid-style">
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
      </style>

      <etools-content-panel panel-title="[[localize('capacity_assessment')]]">
        <etools-loading active="[[loading]]"></etools-loading>

        <ul class="app-grid">
          <li class="item">
            <labelled-item label="[[localize('financial_risk_rating')]]">
              <span class="field-value">[[_withDefault(partner.rating)]]</span>
            </labelled-item>
          </li>
          <li class="item">
            <labelled-item label="[[localize('type_of_assessment')]]">
              <span class="field-value">[[_withDefault(partner.type_of_assessment)]]</span>
            </labelled-item>
          </li>
          <li class="item">
            <labelled-item label="[[localize('risk_rating_last_date_assessment')]]">
              <span class="field-value">[[_withDefault(partner.last_assessment_date)]]</span>
            </labelled-item>
          </li>
          <li class="item">
            <labelled-item label="[[localize('sea_risk_rating')]]">
              <span class="field-value">[[_withDefault(partner.sea_risk_rating_name)]]</span>
            </labelled-item>
          </li>
          <li class="item">
            <labelled-item label="[[localize('psea_risk_rating_date_of_assessment')]]">
              <span class="field-value">[[_withDefault(partner.psea_assessment_date)]]</span>
            </labelled-item>
          </li>
        </ul>
      </etools-content-panel>
    `;
    }
    _partnerLoading(rootState) {
        return partnerLoading(rootState);
    }
}
__decorate([
    property({ type: Object, computed: 'getReduxStateObject(rootState.partner.current)' })
], RiskRating.prototype, "partner", void 0);
__decorate([
    property({ type: Boolean, computed: '_partnerLoading(rootState)' })
], RiskRating.prototype, "loading", void 0);
window.customElements.define('risk-rating', RiskRating);
