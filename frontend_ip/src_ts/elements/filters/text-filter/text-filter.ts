import {html, css, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import {store} from '../../../redux/store';
import '@polymer/paper-input/paper-input';
import FilterMixin from '../../../etools-prp-common/mixins/filter-mixin';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {PaperInputElement} from '@polymer/paper-input/paper-input';
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
  type = 'text';

  render() {
    return html`
      <paper-input
        id="field"
        .type="${this.type}"
        .label="${this.label}"
        .value="${this.value}"
        @value-changed="${this._filterValueChanged}"
        always-float-label
      >
      </paper-input>
    `;
  }

  _filterValueChanged() {
    debounce(() => {
      const newValue = (this.shadowRoot!.getElementById('field') as PaperInputElement).value!.trim();

      if (newValue !== this.lastValue) {
        fireEvent(this, 'filter-changed', {
          name: this.name,
          value: newValue
        });
      }
    }, 250)();
  }

  connectedCallback() {
    super.connectedCallback();
    this._filterReady();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }
}

export {TextFilter as TextFilterEl};
