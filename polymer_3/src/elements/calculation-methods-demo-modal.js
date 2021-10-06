var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement, html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable';
import '@polymer/paper-button/paper-button';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/paper-styles/typography';
import ModalMixin from '../mixins/modal-mixin';
import UtilsMixin from '../mixins/utils-mixin';
import './calculation-methods-demo-locations.js';
import './calculation-methods-demo-periods.js';
import './etools-prp-number';
import { buttonsStyles } from '../styles/buttons-styles';
import { modalStyles } from '../styles/modal-styles';
/**
 * @polymer
 * @customElement
 * @appliesMixin ModalMixin
 * @appliesMixin UtilsMixin
 */
class CalculationMethodsDemoModal extends UtilsMixin(ModalMixin(PolymerElement)) {
    constructor() {
        super(...arguments);
        this.selectedType = 'sum';
        this.totals = [{ id: 1, value: 4000 },
            { id: 2, value: 6000 },
            { id: 3, value: 2000 }];
        this.descriptionsLocations = {
            value: {
                sum: 'Adds values as cumulative results for all locations. ' +
                    'Answers the question, what is total coverage for reporting ' +
                    'period across locations. Requires that indicator definition ' +
                    'does not count same case or event twice across locations, i.e. ' +
                    'reported values covering overlapping populations (e.g. for' +
                    'estimated catchment population for mass dissemination by ' +
                    'radio, total coverage must be calculated manually ' +
                    'discounting overlap).',
                max: 'Takes the top value for all locations. Answers the ' +
                    'question, ' +
                    'where is the  highest number of "x" reached at any one time. ' +
                    'Useful for identification of pattern of demand.  Not generally ' +
                    'a useful measure of overall performance of programme across ' +
                    'locations.',
                avg: 'Provides a measure of the typical value across the ' +
                    'locations. Answers the question, how many people does a ' +
                    'programme or service usually reach at any given location. ' +
                    'Does not reflect the best or worst or total picture. ',
            }
        };
        this.descriptionsReportingPeriods = {
            value: {
                sum: 'Sum adds all results for all reporting periods. Answers the ' +
                    'question: what is total coverage over time? Only valid ' +
                    'indicator counts the same case or event only once over time ' +
                    'e.g. sum of children admitted to SAM treatment (each child ' +
                    'registered once at programme start) is valid. Not valid to ' +
                    'aggregate sum of children participating in ongoing learning ' +
                    'programme each month as this counts each child multiple times. ',
                max: 'Max takes the top value for all reporting intervals. ' +
                    'Answers the question: what was the peak case load or highest ' +
                    'coverage at any one time?',
                avg: 'Average provides a measure of the typical value across ' +
                    'reporting periods. Answers the question: what is the usual ' +
                    'reach/coverage in ongoing programme. ',
            }
        };
    }
    static get template() {
        return html `
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

    <paper-dialog id="calculation-methods-demo-modal-dialog" with-backdrop opened="{{opened}}">
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
              Quality standard: requires agreed treatment protocol and duration
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
    _computeFinalTotal(selectedType, totals) {
        if (!totals) {
            return;
        }
        switch (selectedType) {
            case 'sum':
                return this._totalSum(totals);
            case 'max':
                return Math.max.apply(Math, totals.map(function (total) {
                    return total.value;
                }));
            case 'avg':
                return this._totalAvg(totals);
            default:
                return this._totalSum(totals);
        }
    }
    _computeTotals(totals, items) {
        return totals.slice(0, items);
    }
    _computeDescription(selectedType, domain, descriptionsLocations, descriptionsReportingPeriods) {
        return domain === 'locations' ? descriptionsLocations[selectedType] :
            descriptionsReportingPeriods[selectedType];
    }
    _onRadioChange(e) {
        this.selectedType = e.target.selected;
    }
    _totalSum(data) {
        return data.reduce(function (acc, next) {
            return acc + next.value;
        }, 0);
    }
    _totalAvg(data) {
        return data.reduce(function (acc, next) {
            return acc + next.value;
        }, 0) / data.length;
    }
}
__decorate([
    property({ type: String })
], CalculationMethodsDemoModal.prototype, "domain", void 0);
__decorate([
    property({ type: Number })
], CalculationMethodsDemoModal.prototype, "items", void 0);
__decorate([
    property({ type: String })
], CalculationMethodsDemoModal.prototype, "selectedType", void 0);
__decorate([
    property({ type: Array })
], CalculationMethodsDemoModal.prototype, "totals", void 0);
__decorate([
    property({ type: Array, computed: '_computeTotals(totals, items)' })
], CalculationMethodsDemoModal.prototype, "locationTotals", void 0);
__decorate([
    property({ type: Number, computed: '_computeFinalTotal(selectedType, locationTotals)' })
], CalculationMethodsDemoModal.prototype, "finalTotal", void 0);
__decorate([
    property({ type: Object })
], CalculationMethodsDemoModal.prototype, "descriptionsLocations", void 0);
__decorate([
    property({ type: Object })
], CalculationMethodsDemoModal.prototype, "descriptionsReportingPeriods", void 0);
__decorate([
    property({ type: String, computed: '_computeDescription(selectedType, domain, descriptionsLocations, descriptionsReportingPeriods)' })
], CalculationMethodsDemoModal.prototype, "description", void 0);
window.customElements.define('calculation-methods-demo-modal', CalculationMethodsDemoModal);
export { CalculationMethodsDemoModal as CalculationMethodsDemoModalEl };
