import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/iron-icons/iron-icons';
import {property} from '@polymer/decorators/lib/decorators';
import {fireEvent} from '../utils/fire-custom-event';

// <link rel="import" href="labelled-item.html">
// <link rel="import" href="../styles/shared-styles.html">


/**
 * @polymer
 * @customElement
 */
class EtoolsPrpChips extends PolymerElement{
  public static get template(){
    return html`
      <style include="iron-flex shared-styles">
        :host {
          display: block;
          padding: 8px 0;
        }
  
        .chips {
          font-size: 16px;
          line-height: 24px;
        }
  
        .chip {
          max-width: 100%;
          margin-right: .75em;
        }
  
        .chip__content {
          @apply --truncate;
        }
  
        .chip__content--disabled {
          color: var(--theme-primary-text-color-medium);
        }
  
        .chip__actions iron-icon {
          width: 18px;
          height: 18px;
          margin-left: 2px;
          position: relative;
          top: -2px;
          color: var(--paper-deep-orange-a700);
          cursor: pointer;
        }
      </style>
      
      <labelled-item label="[[label]]" invalid="[[_invalid]]">
        <div class="chips layout horizontal wrap">
          <template
              is="dom-repeat"
              items="[[value]]"
              as="chip">
            <div class="chip layout horizontal">
              <div class$="[[_chipContentClass]]">[[chip]]</div>
  
              <template
                  is="dom-if"
                  if="[[!disabled]]"
                  restamp="true">
                <div class="chip__actions">
                  <iron-icon
                      index="[[index]]"
                      on-tap="_onChipRemove"
                      icon="icons:clear">
                  </iron-icon>
                </div>
              </template>
            </div>
          </template>
  
          <slot></slot>
        </div>
      </labelled-item>
    
    `;
  }

  @property({type: String})
  label!: string;

  @property({type: String})
  name!: string;

  @property({type: Array, notify: true})
  value: any[] = [];

  @property({type: Boolean})
  required: boolean = false;

  @property({type: Boolean})
  disabled: boolean = false;

  @property({type: Boolean, notify: true, computed: '_computeInvalid(required, value)'})
  invalid: boolean = true;

  connectedCallback() {
    super.connectedCallback();
    this._addEventListeners();
  }

  validate() {
    this.set('_invalid', this.invalid);
  }

  _computeInvalid(required: boolean, value: any[]) {
    return required && !value.length;
  }

  _computeChipContentClass(disabled: boolean) {
    return 'chip__content' + (disabled ? ' chip__content--disabled' : '');
  }

  _onChipAdd(e) {
    e.stopPropagation();

    if (this.value.indexOf(e.detail) === -1) {
      this.set('value', this.value.concat(e.detail));
      fireEvent(this,'selected-chips-updated');
    }
  }

  _onChipRemove(e) {
    let value = this.value.slice();
    let toRemove = +e.target.index;

    value.splice(toRemove, 1);

    this.set('value', value);
    fireEvent(this, 'selected-chips-updated');
  }

  _addEventListeners() {
    this.addEventListener('chip-add', this._onChipAdd);
  }

  _removeEventListeners() {
    this.removeEventListener('chip-add', this._onChipAdd);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEventListeners();
    this.set('value', []);
  }

}

window.customElements.define('etools-prp-chips', EtoolsPrpChips);
