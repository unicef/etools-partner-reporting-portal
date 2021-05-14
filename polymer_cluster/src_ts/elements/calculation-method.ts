import {ReduxConnectedElement} from '../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/paper-radio-group/paper-radio-group.js';
import '@polymer/paper-radio-button/paper-radio-button.js';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/polymer/lib/elements/dom-repeat';
import LocalizeMixin from '../mixins/localize-mixin';
import UtilsMixin from '../mixins/utils-mixin';

/**
 * @polymer
 * @appliesMixin LocalizeMixin
 * @appliesMixin UtilsBehavior
 */
class CalculationMethod extends UtilsMixin(LocalizeMixin(ReduxConnectedElement)) {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }

        paper-radio-group {
          margin-left: -12px;
        }

        paper-radio-button,
        .read-only-label {
          text-transform: uppercase;
        }

        .read-only-label {
          display: inline-block;
          padding: 12px 0;
          line-height: 16px;
          color: var(--theme-secondary-text-color);
        }
      </style>

      <template is="dom-if" if="[[!readonly]]" restamp="true">
        <paper-radio-group selected="{{value}}">
          <template is="dom-repeat" items="[[choices]]">
            <paper-radio-button name="[[item.id]]" disabled="[[disabled]]">
              [[_localizeLowerCased(item.title, localize)]]
            </paper-radio-button>
          </template>
        </paper-radio-group>
      </template>

      <template is="dom-if" if="[[readonly]]" restamp="true">
        <span class="read-only-label">[[_localizeLowerCased(readOnlyLabel, localize)]]</span>
      </template>
    `;
  }

  @property({type: Boolean})
  disabled = false;

  @property({type: Boolean})
  readonly = false;

  @property({type: String, notify: true})
  value!: string;

  @property({type: Array})
  choices = [
    {
      id: 'sum',
      title: 'Sum'
    },
    {
      id: 'max',
      title: 'Max'
    },
    {
      id: 'avg',
      title: 'Avg'
    }
  ];

  @property({type: String, computed: '_computeReadonlyLabel(value, choices)'})
  readOnlyLabel!: string;

  _computeReadonlyLabel(value: any, choices: any[]) {
    const method = choices.find(function (choice) {
      return choice.id === value;
    });

    return method ? method.title : 'Invalid method';
  }

  // TODO: Might also need validation at some point
}

window.customElements.define('calculation-method', CalculationMethod);

export {CalculationMethod as CalculationMethodEl};
