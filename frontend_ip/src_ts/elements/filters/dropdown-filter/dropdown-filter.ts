import {html, css, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown';
import FilterMixin from '../../../etools-prp-common/mixins/filter-mixin';
import LocalizeMixin from '../../../etools-prp-common/mixins/localize-mixin';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';

@customElement('dropdown-filter')
export class DropdownFilter extends LocalizeMixin(FilterMixin(LitElement)) {
  static styles = css`
    :host {
      display: block;
    }
    #field {
      width: 100%;
    }
  `;

  @property({type: Boolean})
  disabled = false;

  @property({type: String})
  value = '';

  @property({type: Array})
  data: any[] = [];

  render() {
    return html`
      <etools-dropdown
        id="field"
        .label="${this.label}"
        .options="${this.data}"
        option-value="id"
        option-label="title"
        .selected="${this.value}"
        .disabled="${this.disabled}"
        trigger-value-change-event
        @etools-selected-item-changed="${this._handleFilterChange}"
      >
      </etools-dropdown>
    `;
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    
    if (changedProperties.has('data')) {
      this._handleData(this.data);
    }
  }

  _handleFilterChange(e) {
    if (!e.detail.selectedItem) {
      return;
    }
    const newValue = e.detail.selectedItem.id;

    fireEvent(this, 'filter-changed', {
      name: this.name,
      value: newValue == -1 ? '' : String(newValue)
    });
  }

  _handleData(data) {
    if (data) {
      this._filterReady();
    }
  }
}

export {DropdownFilter as DropdownFilterEl};
