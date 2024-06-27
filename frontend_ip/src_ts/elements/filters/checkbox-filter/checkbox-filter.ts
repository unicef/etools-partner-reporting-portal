import {LitElement, html, css} from 'lit';
import '@polymer/paper-checkbox/paper-checkbox';
import {property, customElement} from 'lit/decorators.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {debounce} from '@unicef-polymer/etools-utils/dist/debouncer.util';
import UtilsMixin from '../../../etools-prp-common/mixins/utils-mixin';
import FilterMixin from '../../../etools-prp-common/mixins/filter-mixin';

@customElement('checkbox-filter')
export class CheckboxFilter extends UtilsMixin(FilterMixin(LitElement)) {
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
      <paper-checkbox id="field" name="${this.name}" .checked="${this.checked}" @tap="${this._handleInput}">
        <slot></slot>
      </paper-checkbox>
    `;
  }

  updated(changedProperties) {
    if (changedProperties.has('value')) {
      this.checked = this._computeChecked(this.value);
    }
  }

  _handleInput() {
    debounce(() => {
      const newValue = (this.shadowRoot?.getElementById('field') as any)?.checked;

      if (newValue.toString() !== this.lastValue) {
        fireEvent(this, 'filter-changed', {
          name: this.name,
          value: newValue.toString()
        });
      }
    }, 250);
  }

  _computeChecked(value) {
    return value ? !!this._toNumber(value) : false;
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
