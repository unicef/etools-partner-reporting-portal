import {PolymerElement, html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable';
import '@polymer/paper-button/paper-button';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/paper-styles/typography';
import {GenericObject} from '../typings/globals.types';
import ModalMixin from '../mixins/modal-mixin';
import UtilsMixin from '../mixins/utils-mixin';
import './calculation-methods-demo-locations';
import './calculation-methods-demo-periods';
import './etools-prp-number';
import {buttonsStyles} from '../styles/buttons-styles';
import {modalStyles} from '../styles/modal-styles';

/**
 * @polymer
 * @customElement
 * @appliesMixin ModalMixin
 * @appliesMixin UtilsMixin
 */
class CalculationMethodsDemoModal extends UtilsMixin(ModalMixin(PolymerElement)) {
  static get template() {
    return html`
    ${buttonsStyles} ${modalStyles}
    <style include="app-grid-style iron-flex iron-flex-alignment iron-flex-reverse">
      :host {
        display: block;
        --paper-dialog: {
          width: 750px;

          &>* {
            margin: 0;
          }
        }
        ;
      }

      .flex-2 {
        @apply --layout-flex-2;
      }

      .content-box {
        padding: 25px;
        background: var(--paper-grey-200);
      }

      .total-box {
        padding: 5px 5px 5px 50px;
        min-width: 75px;
        background: var(--paper-grey-400);
        text-align: end;
      }

      .bold-text {
        font-weight: bold;
        font-size: 1.17em;
      }

      .total-label {
        margin-right: 50px;
      }
    </style>

    <paper-dialog id="calculation-methods-demo-modal-dialog" modal opened="{{opened}}">
      <div class="header layout horizontal justified">
        <h2>Calculation method across [[domain]]</h2>

        <paper-icon-button class="self-center" on-tap="close"
          icon="icons:close">
        </paper-icon-button>
      </div>

      <br />

      <paper-dialog-scrollable>
        <div class="content-box">
          <labelled-item label="Sample indicator">
            <span class="bold-text">
              # of children aged 6-59 months affected by severe acute
              malnutrition who are admitted into treatment.
            </span>
          </labelled-item>

          <labelled-item
            label="Guidance on measurement (for each reporting period)">
            <span>
              Quality standard: requires agreed treatment protocol and duration
              (usually 2 mo); Measurement/reporting clarification: measures
              newly admitted cases for an ongoing service, therefore requires
              agreement to consistently report NEW admissions for an agreed
              reporting period (set dates) to avoid double counting.
            </span>
          </labelled-item>
        </div>

        <br />

        <labelled-item label="Choose calculation method to read description
          and observe the impact on data presented below:">
          <paper-radio-group on-paper-radio-group-changed="_onRadioChange"
            selected=[[selectedType]]>
            <paper-radio-button name="sum">SUM</paper-radio-button>
            <paper-radio-button name="max">MAX</paper-radio-button>
            <paper-radio-button name="avg">AVG</paper-radio-button>
          </paper-radio-group>
          <div>[[description]]</div>
        </labelled-item>

        <br />
        <template is="dom-if" if="[[_equals(domain, 'locations')]]">
          <calculation-methods-demo-locations totals=[[locationTotals]]>
          </calculation-methods-demo-locations>
        </template>
        <template is="dom-if" if="[[_equals(domain, 'reporting periods')]]">
          <calculation-methods-demo-periods totals=[[locationTotals]]>
            </calculation-methods-demo-locations>
        </template>

        <div class="content-box layout horizontal justified center-center">
          <div class="flex-2"></div>
          <div class="total-label bold-text">Total progress:</div>
          <div class="total-box bold-text">
            <etools-prp-number value=[[finalTotal]]></etools-prp-number>
          </div>
        </div>

        <br />

      </paper-dialog-scrollable>

      <div class="buttons layout horizontal-reverse">
        <paper-button class="btn-primary" dialog-dismiss raised>
          Close
        </paper-button>
      </div>
    </paper-dialog>
  `;
  }

  @property({type: String})
  domain!: string;

  @property({type: Number})
  items!: number;

  @property({type: String})
  selectedType = 'sum';

  @property({type: Array})
  totals = [
    {id: 1, value: 4000},
    {id: 2, value: 6000},
    {id: 3, value: 2000}
  ];

  @property({type: Array, computed: '_computeTotals(totals, items)'})
  locationTotals!: any[];

  @property({type: Number, computed: '_computeFinalTotal(selectedType, locationTotals)'})
  finalTotal!: number;

  @property({type: Object})
  descriptionsLocations = {
    value: {
      sum:
        'Adds values as cumulative results for all locations. ' +
        'Answers the question, what is total coverage for reporting ' +
        'period across locations. Requires that indicator definition ' +
        'does not count same case or event twice across locations, i.e. ' +
        'reported values covering overlapping populations (e.g. for' +
        'estimated catchment population for mass dissemination by ' +
        'radio, total coverage must be calculated manually ' +
        'discounting overlap).',
      max:
        'Takes the top value for all locations. Answers the ' +
        'question, ' +
        'where is the  highest number of "x" reached at any one time. ' +
        'Useful for identification of pattern of demand.  Not generally ' +
        'a useful measure of overall performance of programme across ' +
        'locations.',
      avg:
        'Provides a measure of the typical value across the ' +
        'locations. Answers the question, how many people does a ' +
        'programme or service usually reach at any given location. ' +
        'Does not reflect the best or worst or total picture. '
    }
  };

  @property({type: Object})
  descriptionsReportingPeriods = {
    value: {
      sum:
        'Sum adds all results for all reporting periods. Answers the ' +
        'question: what is total coverage over time? Only valid ' +
        'indicator counts the same case or event only once over time ' +
        'e.g. sum of children admitted to SAM treatment (each child ' +
        'registered once at programme start) is valid. Not valid to ' +
        'aggregate sum of children participating in ongoing learning ' +
        'programme each month as this counts each child multiple times. ',
      max:
        'Max takes the top value for all reporting intervals. ' +
        'Answers the question: what was the peak case load or highest ' +
        'coverage at any one time?',
      avg:
        'Average provides a measure of the typical value across ' +
        'reporting periods. Answers the question: what is the usual ' +
        'reach/coverage in ongoing programme. '
    }
  };

  @property({
    type: String,
    computed: '_computeDescription(selectedType, domain, descriptionsLocations, descriptionsReportingPeriods)'
  })
  description!: string;

  _computeFinalTotal(selectedType: string, totals: GenericObject[]) {
    if (!totals) {
      return;
    }

    switch (selectedType) {
      case 'sum':
        return this._totalSum(totals);
      case 'max':
        return Math.max(
          ...totals.map(function (total) {
            return total.value;
          })
        );
      case 'avg':
        return this._totalAvg(totals);
      default:
        return this._totalSum(totals);
    }
  }

  _computeTotals(totals: GenericObject[], items: number) {
    return totals.slice(0, items);
  }

  _computeDescription(
    selectedType: string,
    domain: string,
    descriptionsLocations: GenericObject,
    descriptionsReportingPeriods: GenericObject
  ) {
    return domain === 'locations' ? descriptionsLocations[selectedType] : descriptionsReportingPeriods[selectedType];
  }

  _onRadioChange(e: CustomEvent) {
    this.selectedType = (e.target! as any).selected;
  }

  _totalSum(data: GenericObject[]) {
    return data.reduce(function (acc, next) {
      return acc + next.value;
    }, 0);
  }

  _totalAvg(data: GenericObject[]) {
    return (
      data.reduce(function (acc, next) {
        return acc + next.value;
      }, 0) / data.length
    );
  }
}
window.customElements.define('calculation-methods-demo-modal', CalculationMethodsDemoModal);

export {CalculationMethodsDemoModal as CalculationMethodsDemoModalEl};
