import {LitElement, html, css} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown';
import FilterMixin from '../../../etools-prp-common/mixins/filter-mixin';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';

@customElement('searchable-dropdown-filter')
export class SearchableDropdownFilter extends FilterMixin(LitElement) {
  static styles = css`
    :host {
      display: block;
    }
    #field {
      width: 100%;
    }
  `;

  @property({type: Object})
  selectedItem: any = {};

  @property({type: Boolean})
  disabled = false;

  @property({type: String})
  value = '-1';

  @property({type: String})
  name = '';

  @property({type: String})
  label = '';

  @property({type: String})
  optionLabel = 'title';

  @property({type: Array})
  data: any[] = [];

  render() {
    return html`
      <etools-dropdown
        id="field"
        .label="${this.label}"
        .options="${this.data}"
        option-value="id"
        .optionLabel="${this.optionLabel}"
        .selected="${this.value}"
        .disabled="${this.disabled}"
        .selectedItem="${this.selectedItem}"
        trigger-value-change-event
        @etools-selected-item-changed="${this._handleDropdownChange}"
      >
      </etools-dropdown>
    `;
  }

  updated(changedProperties) {
    if (changedProperties.has('data')) {
      this._handleData(this.data);
    }
  }

  _handleDropdownChange(event) {
    if (event.detail.selectedItem) {
      setTimeout(() => {
        fireEvent(this, 'filter-changed', {
          name: this.name,
          value: event.detail.selectedItem.id == -1 ? '' : String(event.detail.selectedItem.id)
        });
      });
    }
  }

  _handleData(data) {
    if (data.length) {
      this._filterReady();
    }
  }
}

export {SearchableDropdownFilter as SearchableDropdownFilterEl};
