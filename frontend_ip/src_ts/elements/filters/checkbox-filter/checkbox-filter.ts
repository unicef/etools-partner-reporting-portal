import {LitElement, html, css} from 'lit';
import '@unicef-polymer/etools-unicef/src/etools-checkbox/etools-checkbox';
import {property, customElement} from 'lit/decorators.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import FilterMixin from '../../../etools-prp-common/mixins/filter-mixin';

@customElement('checkbox-filter')
export class CheckboxFilter extends FilterMixin(LitElement) {
  static styles = css`
    :host {
      display: block;
    }

    ::slotted() .checkbox-label {
      font-size: 12px;
    }
  `;

  @property({type: Boolean, reflect: true})
  checked = false;

  @property({type: String})
  value = '';

  render() {
    return html`
      <etools-checkbox id="field" name="${this.name}" ?checked="${this.checked}" @sl-change="${this._handleInput}"
        ><slot></slot
      ></etools-checkbox>
    `;
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('value')) {
      this.checked = this._computeChecked(this.value);
    }
  }

  _handleInput(e: any) {
    const newValue = e.target.checked;

    if (newValue.toString() !== this.lastValue) {
      fireEvent(this, 'filter-changed', {
        name: this.name,
        value: newValue.toString()
      });
    }
  }

  _computeChecked(value) {
    return (typeof value === 'boolean' && value) || value === 'true' ? true : false;
  }

  connectedCallback() {
    super.connectedCallback();
    this._filterReady();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }
}

export {CheckboxFilter as CheckboxFilterEl};
