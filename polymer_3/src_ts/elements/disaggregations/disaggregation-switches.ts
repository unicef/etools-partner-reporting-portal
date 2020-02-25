import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {property} from '@polymer/decorators/lib/decorators';
import {html} from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/paper-checkbox';
import '@polymer/polymer/lib/elements/dom-if';
import UtilsMixin from '../../mixins/utils-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import DisaggregationMixin from '../../mixins/disaggregations-mixin';
import '../message-box';
import {GenericObject} from '../../typings/globals.types';
import {fireEvent} from '../../utils/fire-custom-event';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';


/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 * @appliesMixin DisaggregationMixin
 */
class DisaggregationSwitches extends UtilsMixin(LocalizeMixin(DisaggregationMixin(ReduxConnectedElement))) {
  public static get template() {
    return html`
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
                on-iron-form-element-register="_initField"
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

  @property({type: Object})
  mapping!: GenericObject;

  @property({type: Number})
  editable!: number;

  @property({type: Boolean})
  warning: boolean = true;

  @property({type: Array})
  reportedOn: string[] = [];

  @property({type: Object, notify: true})
  formattedData!: GenericObject;

  @property({type: Object, observer: '_cloneData'})
  data!: GenericObject;

  @property({type: Boolean, computed: '_computeEditableBool(editable)'})
  editableBool!: boolean;

  fieldValueChanged !: Debouncer | null;

  static get observers() {
    return ['_computeWarning(data.num_disaggregation, reportedOn.length)']
  }

  _computeEditableBool(editable: number) {
    return editable === 1;
  }

  _cloneData(data: GenericObject) {
    this.set('formattedData', this._clone(data));
  }

  _computeChecked(id: string) {
    return this.formattedData.disaggregation_reported_on.indexOf(id) !== -1;
  }

  _formatFieldName(name: string) {
    return this._capitalizeFirstLetter(name);
  }

  _fieldValueChanged(e: CustomEvent) {
    let field = e.target;

    this.fieldValueChanged = Debouncer.debounce(this.fieldValueChanged,
      timeOut.after(100),
      () => {
        this._recordField(field);

        this._confirmIntent(field)
          .then(this._commit.bind(this))
          .catch(this._revert.bind(this));
      });

  }

  _confirmIntent(field: GenericObject) {
    let deferred = this._deferred();

    fireEvent(this, 'disaggregation-modal-confirm', deferred);

    return deferred.promise.catch(function() {
      return Promise.reject(field);
    });
  }

  _commit() {
    this.set('formattedData', Object.assign({}, this.formattedData, {
      disaggregation: {},
      level_reported: this.reportedOn.length,
      disaggregation_reported_on: this.reportedOn,
    }));
  }

  _revert(field: GenericObject) {
    field.checked = !field.checked;

    this._recordField(field);
  }

  _computeWarning(numDisagg: number, reportedOnLength: number) { // jshint ignore:line
    this.set('warning', !!numDisagg && reportedOnLength < numDisagg);
  }

  _recordField(field: GenericObject) {
    let id = Number(field.id);
    let checked = field.checked;

    if (checked) {
      this.push('reportedOn', id);
    } else if (this.reportedOn.indexOf(id) !== -1) {
      this.splice('reportedOn', this.reportedOn.indexOf(id), 1);
    }
  }

  _initField(e: CustomEvent) {
    this._recordField(e.target);
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

window.customElements.define('disaggregation-switches', DisaggregationSwitches);
