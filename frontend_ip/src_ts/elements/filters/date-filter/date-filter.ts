import {html, PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/paper-input/paper-input';
import '@polymer/iron-icons/iron-icons';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import FilterMixin from '../../../etools-prp-common/mixins/filter-mixin';
import DateMixin from '../../../mixins/date-mixin';
import {fireEvent} from '../../../etools-prp-common/utils/fire-custom-event';
import Settings from '../../../etools-prp-common/settings';
declare const dayjs: any;

/**
 * @polymer
 * @customElement
 * @appliesMixin FilterMixin
 * @appliesMixin DateMixin
 */
class DateFilter extends FilterMixin(DateMixin(PolymerElement)) {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>
      <datepicker-lite
        id="field"
        label="[[label]]"
        value="[[value]]"
        input-date-format="[[format]]"
        selected-date-display-format="[[format]]"
        fire-date-has-changed
        on-date-has-changed="_filterDateHasChanged"
      >
      </datepicker-lite>
    `;
  }

  @property({type: String})
  value!: string;

  @property({type: String})
  format = Settings.dateFormat;

  _filterDateHasChanged(event: CustomEvent) {
    const newValue = event.detail.date ? dayjs(event.detail.date).format(this.format) : '';
    fireEvent(this, 'filter-changed', {
      name: this.name,
      value: newValue
    });
  }

  connectedCallback() {
    super.connectedCallback();

    this._filterReady();
  }
}

window.customElements.define('date-filter', DateFilter);
