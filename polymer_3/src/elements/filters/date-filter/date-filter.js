var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, PolymerElement } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/paper-input/paper-input';
import '@polymer/iron-icons/iron-icons';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import FilterMixin from '../../../etools-prp-common/mixins/filter-mixin';
import DateMixin from '../../../mixins/date-mixin';
import { fireEvent } from '../../../etools-prp-common/utils/fire-custom-event';
import Settings from '../../../etools-prp-common/settings';
/**
 * @polymer
 * @customElement
 * @appliesMixin FilterMixin
 * @appliesMixin DateMixin
 */
class DateFilter extends FilterMixin(DateMixin(PolymerElement)) {
    constructor() {
        super(...arguments);
        this.format = Settings.dateFormat;
    }
    static get template() {
        return html `
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
__decorate([
    property({ type: String })
], DateFilter.prototype, "value", void 0);
__decorate([
    property({ type: String })
], DateFilter.prototype, "format", void 0);
window.customElements.define('date-filter', DateFilter);
