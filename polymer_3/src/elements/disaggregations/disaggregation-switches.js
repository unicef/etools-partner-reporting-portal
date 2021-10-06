var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../ReduxConnectedElement';
import { property } from '@polymer/decorators/lib/decorators';
import { html } from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/paper-checkbox/paper-checkbox';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/polymer/lib/elements/dom-repeat';
import UtilsMixin from '../../mixins/utils-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import DisaggregationMixin from '../../mixins/disaggregations-mixin';
import '../message-box';
import { fireEvent } from '../../utils/fire-custom-event';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 * @appliesMixin DisaggregationMixin
 */
class DisaggregationSwitches extends UtilsMixin(LocalizeMixin(DisaggregationMixin(ReduxConnectedElement))) {
    constructor() {
        super(...arguments);
        this.warning = true;
        this.reportedOn = [];
    }
    static get template() {
        return html `
      <style>
        :host {
          display: block;
        }

        .container {
          padding: 10px 24px;
          margin: 0 -24px;
          background: var(--paper-grey-100);
        }

        .container h4 {
          margin: 0 0 10px;
          font-size: 12px;
          line-height: 1;
        }

        paper-checkbox:not(:first-of-type) {
          margin-left: 24px;
        }

        message-box {
          margin-top: 10px;
        }
      </style>

      <template
          is="dom-if"
          if="[[editableBool]]"
          restamp>
        <div class="container">
          <h4>[[localize('enter_data_by_disaggregation')]]</h4>
          <template
              is="dom-repeat"
              items="[[mapping]]"
              as="field">
            <paper-checkbox
                id="[[field.id]]"
                checked="[[_computeChecked(field.id)]]"
                on-change="_fieldValueChanged">
              [[_formatFieldName(field.name)]]
            </paper-checkbox>
          </template>

          <template
              is="dom-if"
              if="[[warning]]"
              restamp="true">
            <message-box
                type="warning">
              If one or more disaggregation box is unchecked, the reporting table will be simplified however the report will not be in line with the disaggregation agreed in the PD/SSFA.
            </message-box>
          </template>
        </div>
      </template>
    `;
    }
    static get observers() {
        return ['_computeWarning(data.num_disaggregation, reportedOn.length)'];
    }
    _computeEditableBool(editable) {
        return editable === 1;
    }
    _cloneData(data) {
        this.set('formattedData', this._clone(data));
    }
    _computeChecked(id) {
        const checked = this.formattedData.disaggregation_reported_on.indexOf(id) !== -1;
        this._updateReportedOn(id, checked);
        return checked;
    }
    _formatFieldName(name) {
        return this._capitalizeFirstLetter(name);
    }
    _fieldValueChanged(e) {
        const field = e.target;
        this.fieldValueChanged = Debouncer.debounce(this.fieldValueChanged, timeOut.after(100), () => {
            this._recordField(field);
            this._confirmIntent(field)
                .then(this._commit.bind(this))
                .catch((_err) => { this._revert.bind(this); });
        });
    }
    _confirmIntent(field) {
        const deferred = this._deferred();
        fireEvent(this, 'disaggregation-modal-confirm', deferred);
        return deferred.promise.catch(function () {
            return Promise.reject(field);
        });
    }
    _commit() {
        this.set('formattedData', Object.assign({}, this.formattedData, {
            disaggregation: {},
            level_reported: this.reportedOn.length,
            disaggregation_reported_on: this.reportedOn
        }));
    }
    _revert(field) {
        field.checked = !field.checked;
        this._recordField(field);
    }
    _computeWarning(numDisagg, reportedOnLength) {
        this.set('warning', !!numDisagg && reportedOnLength < numDisagg);
    }
    _recordField(field) {
        this._updateReportedOn(field.id, field.checked);
    }
    _updateReportedOn(ctrlId, checked) {
        const id = Number(ctrlId);
        if (checked) {
            this.push('reportedOn', id);
        }
        else if (this.reportedOn.indexOf(id) !== -1) {
            this.splice('reportedOn', this.reportedOn.indexOf(id), 1);
        }
    }
    connectedCallback() {
        super.connectedCallback();
        this.set('reportedOn', []);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.fieldValueChanged && this.fieldValueChanged.isActive()) {
            this.fieldValueChanged.cancel();
        }
    }
}
__decorate([
    property({ type: Object })
], DisaggregationSwitches.prototype, "mapping", void 0);
__decorate([
    property({ type: Number })
], DisaggregationSwitches.prototype, "editable", void 0);
__decorate([
    property({ type: Boolean })
], DisaggregationSwitches.prototype, "warning", void 0);
__decorate([
    property({ type: Array })
], DisaggregationSwitches.prototype, "reportedOn", void 0);
__decorate([
    property({ type: Object, notify: true })
], DisaggregationSwitches.prototype, "formattedData", void 0);
__decorate([
    property({ type: Object, observer: '_cloneData' })
], DisaggregationSwitches.prototype, "data", void 0);
__decorate([
    property({ type: Boolean, computed: '_computeEditableBool(editable)' })
], DisaggregationSwitches.prototype, "editableBool", void 0);
window.customElements.define('disaggregation-switches', DisaggregationSwitches);
