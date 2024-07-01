import {LitElement, html, css} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '@polymer/paper-input/paper-input';
import '@polymer/iron-icons/iron-icons';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import FilterMixin from '../../../etools-prp-common/mixins/filter-mixin';
import DateMixin from '../../../mixins/date-mixin';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import Settings from '../../../etools-prp-common/settings';
import dayjs from 'dayjs';

@customElement('date-filter')
export class DateFilter extends FilterMixin(DateMixin(LitElement)) {
  static styles = css`
    :host {
      display: block;
    }
  `;

  @property({type: String})
  value = '';

  @property({type: String})
  format = Settings.dateFormat;

  render() {
    return html`
      <datepicker-lite
        id="field"
        label="${this.label}"
        .value="${this.value}"
        .inputDateFormat="${this.format}"
        .selectedDateDisplayFormat="${this.format}"
        fire-date-has-changed
        @date-has-changed="${this._filterDateHasChanged}"
      >
      </datepicker-lite>
    `;
  }

  _filterDateHasChanged(event) {
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

export {DateFilter as DateFilterEl};
