import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/paper-styles/typography.js';
import '@polymer/app-layout/app-grid/app-grid-style.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '../../elements/etools-prp-currency';
import UtilsMixin from '../../mixins/utils-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import ModalMixin from '../../mixins/modal-mixin';
import {buttonsStyles} from '../../styles/buttons-styles';
import {modalStyles} from '../../styles/modal-styles';
import {GenericObject} from '../../typings/globals.types';
import {currentProgrammeDocument} from '../../redux/selectors/programmeDocuments';
import {RootState} from '../../typings/redux.types';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin ModalMixin
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PdModal extends LocalizeMixin(UtilsMixin(ModalMixin(ReduxConnectedElement))) {

  public static get template() {
    return html`
    ${buttonsStyles} ${modalStyles}
    <style include="app-grid-style iron-flex iron-flex-alignment iron-flex-reverse">
      :host {
        display: block;

        --app-grid-columns: 6;
        --app-grid-gutter: 25px;
        --app-grid-item-height: auto;
        --app-grid-expandible-item-columns: 2;

        --paper-dialog: {
          width: 900px;
        }

      }

      .app-grid {
        padding: 0;
        margin: 0;
        list-style: none;
      }

      .item-2-col {
        @apply --app-grid-expandible-item;
      }

      h3 {
        @apply --paper-font-title;
      }
    </style>

    <paper-dialog
        id="dialog"
        with-backdrop no-cancel-on-outside-click
        opened="{{opened}}">
      <div class="header layout horizontal justified">
        <h2>[[pd.title]]</h2>

        <paper-icon-button
            class="self-center"
            on-tap="close"
            icon="icons:close">
        </paper-icon-button>
      </div>

      <paper-dialog-scrollable>
        <h3>[[localize('partnership_info')]]</h3>
        <ul class="app-grid">
          <li class="item item-2-col">
            <labelled-item label="[[localize('agreement')]]">
              <span class="field-value">[[_withDefault(pd.agreement)]]</span>
            </labelled-item>
          </li>
          <li class="item item-2-col">
            <labelled-item label="[[localize('document_type')]]">
              <span class="field-value">[[_withDefault(pd.document_type_display)]]</span>
            </labelled-item>
          </li>
          <li class="item item-2-col">
            <labelled-item label="[[localize('reference_number')]]">
              <span class="field-value">[[_withDefault(pd.reference_number)]]</span>
            </labelled-item>
          </li>
        </ul>

        <labelled-item label="[[localize('title')]]">
          <span class="field-value">[[_withDefault(pd.title)]]</span>
        </labelled-item>

        <br />

        <ul class="app-grid">
          <li class="item item-2-col">
            <labelled-item label="[[localize('unicef_offices')]]">
              <span class="field-value">[[_withDefault(pd.unicef_office)]]</span>
            </labelled-item>
          </li>
          <li class="item item-2-col">
            <labelled-item label="[[localize('unicef_points')]]">
              <span class="field-value">[[_formatFocalPoint(pd.unicef_focal_point)]]</span>
            </labelled-item>
          </li>
          <li class="item item-2-col">
            <labelled-item label="[[localize('partner_points')]]">
              <span class="field-value">[[_formatFocalPoint(pd.partner_focal_point)]]</span>
            </labelled-item>
          </li>
        </ul>

        <h3>[[localize('pd_ssfa_details')]]</h3>
        <ul class="app-grid">
          <li class="item">
            <labelled-item label="In response to an HRP">
              - <!-- TODO -->
            </labelled-item>
          </li>
          <li class="item">
            <labelled-item label="[[localize('start_date')]]">
              <span class="field-value">[[_withDefault(pd.start_date)]]</span>
            </labelled-item>
          </li>
          <li class="item">
            <labelled-item label="[[localize('end_date')]]">
              <span class="field-value">[[_withDefault(pd.end_date)]]</span>
            </labelled-item>
          </li>
          <li class="item">
            <labelled-item label="[[localize('cso_contribution')]]n">
              <span class="field-value">
                <etools-prp-currency
                    value="[[pd.cso_contribution]]"
                    currency="[[pd.cso_contribution_currency]]">
                </etools-prp-currency>
              </span>
            </labelled-item>
          </li>
          <li class="item">
            <labelled-item label="[[localize('total_unicef_cash')]]">
              <span class="field-value">
                <etools-prp-currency
                    value="[[pd.total_unicef_cash]]"
                    currency="[[pd.total_unicef_cash_currency]]">
                </etools-prp-currency>
              </span>
            </labelled-item>
          </li>
          <li class="item">
            <labelled-item label="[[localize('total_unicef_supplies')]]">
              <span class="field-value">
                <etools-prp-currency
                    value="[[pd.total_unicef_supplies]]"
                    currency="[[pd.total_unicef_supplies_currency]]">
                </etools-prp-currency>
              </span>
            </labelled-item>
          </li>
          <li class="item">
            <labelled-item label="[[localize('total_budget')]]">
              <span class="field-value">
                <etools-prp-currency
                    value="[[pd.budget]]"
                    currency="[[pd.budget_currency]]">
                </etools-prp-currency>
              </span>
            </labelled-item>
          </li>
          <li class="item item-2-col">
            <labelled-item label="[[localize('disbursements')]]">
              <span class="field-value">[[pd.funds_received_to_date]] [[pd.cso_contribution_currency]]</span>
              <etools-prp-progress-bar
                number="[[_computeFunds(pd.funds_received_to_date_percentage)]]">
              </etools-prp-progress-bar>
            </labelled-item>
          </li>
        </ul>
        <labelled-item label="[[localize('locations')]]">
          <span class="field-value">[[_commaSeparatedDictValues(pd.locations, 'title')]]</span>
        </labelled-item>
      </paper-dialog-scrollable>

      <div class="buttons layout horizontal-reverse">
        <paper-button dialog-dismiss>[[localize('cancel')]]</paper-button>
      </div>
    </paper-dialog>
  `;
  }

  @property({type: Object, computed: '_currentProgrammeDocument(rootState)'})
  pd!: GenericObject;

  _computeFunds(num: number) {
    if (num === null || num === -1) {
      return 'N/A';
    } else {
      return num / 100;
    }
  }

  _currentProgrammeDocument(rootState: RootState) {
    return currentProgrammeDocument(rootState);
  }

  _formatFocalPoint(items: any[]) {
    // need to be checked (dci)
    return this._withDefault(this._commaSeparatedDictValues(items, 'name'), null, this.localize);
  }

}
window.customElements.define('pd-modal', PdModal);

export {PdModal as PdModalEl};
