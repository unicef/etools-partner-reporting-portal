import {html, css, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils.js';
import {store} from '../../../redux/store';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import FilterMixin from '../../../etools-prp-common/mixins/filter-mixin';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {debounce} from '@unicef-polymer/etools-utils/dist/debouncer.util';

@customElement('text-filter')
class TextFilter extends FilterMixin(connect(store)(LitElement)) {
  static styles = css`
    :host {
      display: block;
    }
  `;

  @property({type: String})
  properties = '';

  @property({type: String})
  value = '';

  render() {
    return html`
      <etools-input
        id="field"
        .label="${this.label}"
        .value="${this.value}"
        @value-changed="${this._filterValueChanged}"
        always-float-label
      >
      </etools-input>
    `;
  }

  _filterValueChanged() {
    const newValue = (this.shadowRoot!.getElementById('field') as any).value!.trim(); // PaperInputElement

    if (newValue !== this.lastValue) {
      fireEvent(this, 'filter-changed', {
        name: this.name,
        value: newValue
      });
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this._filterReady();
    this._filterValueChanged = debounce(this._filterValueChanged.bind(this), 250);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }
}

export {TextFilter as TextFilterEl};
