import {LitElement, html, css} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown-multi';
import FilterMixin from '../../../etools-prp-common/mixins/filter-mixin';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';

@customElement('dropdown-filter-multi')
class DropdownFilterMulti extends FilterMixin(LitElement) {
  static styles = css`
    :host {
      display: block;
    }

    etools-dropdown-multi {
      width: 100%;
    }
  `;

  @property({type: String})
  value = '';

  @property({type: Boolean})
  disabled = false;

  @property({type: Boolean})
  hideSearch = false;

  @property({type: Array})
  data: any[] = [];

  @property({type: Array})
  selectedValues: string[] = [];

  @property({type: String})
  optionLabel = 'title';

  render() {
    return html`
      <etools-dropdown-multi
        label="${this.label}"
        .options="${this.data}"
        option-value="id"
        option-label="${this.optionLabel}"
        .selectedValues="${this.selectedValues}"
        trigger-value-change-event
        @etools-selected-items-changed="${this._handleChange}"
        .hideSearch="${this.hideSearch}"
        .disabled="${this.disabled}"
      >
      </etools-dropdown-multi>
    `;
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    
    if (changedProperties.has('value') || changedProperties.has('data')) {
      this._setSelectedValues(this.value, this.data);
    }
    if (changedProperties.has('data')) {
      this._handleData(this.data);
    }
  }

  _handleChange(e) {
    if (e.detail.selectedItems && this.data) {
      const newValue = e.detail.selectedItems?.map((item) => item['id']).join(',');
      if (newValue !== this.value) {
        fireEvent(this, 'filter-changed', {
          name: this.name,
          value: String(newValue || '')
        });
      }
    }
  }

  _handleData(data: any[]) {
    if (data) {
      this._filterReady();
    } else if (this.name === 'location' || this.name === 'locs') {
      this._filterReady();
    }
  }

  _setSelectedValues(value: string, _data: any[]) {
    if (typeof value === 'string' && value !== this.selectedValues.join(',')) {
      this.selectedValues = value.split(',').filter(Boolean);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this._handleData(this.data);
  }
}

export {DropdownFilterMulti as DropdownFilterMultiEl};
