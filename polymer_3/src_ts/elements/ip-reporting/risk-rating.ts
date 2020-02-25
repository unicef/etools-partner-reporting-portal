import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-loading/etools-loading';
import UtilsMixin from "../../mixins/utils-mixin";
import LocalizeMixin from "../../mixins/localize-mixin";
import '../labelled-item';
import {GenericObject} from '../../typings/globals.types';
import {partnerLoading} from '../../redux/selectors/partner';


/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 * @appliesMixin UtilsMixin
 */
class RiskRating extends UtilsMixin(LocalizeMixin(ReduxConnectedElement)) {
  public static get template() {
    return html`
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

      <etools-content-panel panel-title="[[localize('financial_management')]]">
        <etools-loading active="[[loading]]"></etools-loading>

        <ul class="app-grid">
          <li class="item">
            <labelled-item label="[[localize('partner_risk')]]">
              <span class="field-value">[[_withDefault(partner.rating)]]</span>
            </labelled-item>
          </li>
          <li class="item">
            <labelled-item label="[[localize('date_assessment')]]">
              <span class="field-value">[[_withDefault(partner.last_assessment_date)]]</span>
            </labelled-item>
          </li>
          <li class="item">
            <labelled-item label="[[localize('basis_risk')]]">
              <span class="field-value">[[_withDefault(partner.basis_for_risk_rating)]]</span>
            </labelled-item>
          </li>
        </ul>
      </etools-content-panel>
    `;
  }

  @property({type: Object, computed: 'getReduxStateObject(rootState.partner.current)'})
  partner!: GenericObject;

  @property({type: Boolean, computed: 'partnerLoading(rootState)'})
  loading!: boolean;

}

window.customElements.define('risk-rating', RiskRating);
