import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/communication-icons';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-loading/etools-loading';
import UtilsMixin from '../../mixins/utils-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import '../labelled-item';
import {partnerLoading} from '../../redux/selectors/partner';
import {GenericObject} from '../../typings/globals.types';
import {computePartnerType} from './js/partner-details-functions';
import {RootState} from '../../typings/redux.types';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PartnerDetails extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {

  static get template() {
    return html`
    <style include="app-grid-style">
      :host {
        display: block;
        margin-bottom: 25px;

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

      .field-value[has-icon] {
        position: relative;
        padding-left: 2em;
      }

      .field-value iron-icon {
        position: absolute;
        left: 0;
        top: 0;
        color: var(--paper-grey-600);
      }
    </style>

    <etools-content-panel panel-title="[[localize('partner_details')]]">
      <etools-loading active="[[loading]]"></etools-loading>

      <ul class="app-grid">
        <li class="item">
          <labelled-item label="[[localize('full_name')]]">
            <span class="field-value">[[_withDefault(partner.title)]]</span>
          </labelled-item>
        </li>
        <li class="item">
          <labelled-item label="[[localize('short_name')]]">
            <span class="field-value">[[_withDefault(partner.short_title)]]</span>
          </labelled-item>
        </li>
        <li class="item">
          <labelled-item label="[[localize('alternate_name')]]">
            <span class="field-value">[[_withDefault(partner.alternate_title)]]</span>
          </labelled-item>
        </li>
        <li class="item">
          <labelled-item label="[[localize('vendor_number')]]">
            <span class="field-value">[[_withDefault(partner.vendor_number)]]</span>
          </labelled-item>
        </li>
        <li class="item">
          <labelled-item label="[[localize('partner_type')]]">
            <span class="field-value">[[_computePartnerType(partner)]]</span>
          </labelled-item>
        </li>
        <li class="item">
          <labelled-item label="[[localize('shared_partners')]]">
            <span class="field-value">[[_withDefault(partner.shared_partner_display)]]</span>
          </labelled-item>
        </li>
        <li class="item">
          <labelled-item label="[[localize('date_last_assessed')]]">
            <span class="field-value">[[_withDefault(partner.core_values_assessment_date)]]</span>
          </labelled-item>
        </li>
      </ul>

      <ul class="app-grid">
        <li class="item">
          <labelled-item label="[[localize('address')]]">
            <span class="field-value" has-icon>
              <iron-icon icon="communication:location-on"></iron-icon>
              [[_withDefault(partner.street_address)]]
            </span>
          </labelled-item>
        </li>
        <li class="item">
          <labelled-item label="[[localize('phone_number')]]">
            <span class="field-value" has-icon>
              <iron-icon icon="communication:phone"></iron-icon>
              [[_withDefault(partner.phone_number)]]
            </span>
          </labelled-item>
        </li>
        <li class="item">
          <labelled-item label="[[localize('email_address')]]">
            <span class="field-value" has-icon>
              <iron-icon icon="communication:email"></iron-icon>
              [[_withDefault(partner.email)]]
            </span>
          </labelled-item>
        </li>
      </ul>
    </etools-content-panel>
  `;
  }


  @property({type: Object, computed: 'getReduxStateObject(rootState.partner.current)'})
  partner!: GenericObject;

  @property({type: Boolean, computed: '_partnerLoading(rootState)'})
  loading!: boolean;

  static get observers() {
    return ['_getDataByKey(dataDict)'];
  }

  _partnerLoading(rootState: RootState) {
    return partnerLoading(rootState);
  }

  _computePartnerType(partner: GenericObject) {
    return computePartnerType(partner, this._withDefault);
  }

}

window.customElements.define('partner-details', PartnerDetails);
