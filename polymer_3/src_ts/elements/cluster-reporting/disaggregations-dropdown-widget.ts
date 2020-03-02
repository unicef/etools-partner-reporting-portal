import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-icon-button';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-item';
import '@polymer/paper-tooltip/paper-tooltip';
import UtilsMixin from '../../mixins/utils-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import {buttonsStyles} from '../../styles/buttons-styles';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../typings/globals.types';


/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class DisaggregationsDropdownWidget extends UtilsMixin(LocalizeMixin(ReduxConnectedElement)){
  public static get template(){
    return html`
      ${buttonsStyles}
      <style include="iron-flex iron-flex-alignment">
        :host {
          display: block;
        }
  
        h2 {
          padding: 5px 10px;
          margin: 0 0 1em;
          font-size: 14px;
          background-color: var(--paper-grey-200);
        }
  
        .error,
        .remove-btn {
          color: var(--paper-deep-orange-a700);
        }
  
        .row {
          margin-bottom: 1em;
        }
  
        .remove-btn {
          width: 34px;
          height: 34px;
        }
  
        .add-disaggregation-btn {
          margin: 0;
        }
  
        .col-actions {
          width: 40px;
          border-right: 1px solid var(--paper-grey-400);
        }
  
        .col-name:not(:first-of-type),
        .col-values {
          padding-left: 24px;
        }
  
        paper-dropdown-menu {
          width: 100%;
        }
      </style>
      
      <h2>[[localize('disaggregations')]] ([[value.length]])</h2>
      
      <template is="dom-repeat" items="[[value]]" as="dataDisagg">
        <div class="row layout horizontal">
          <template
              is="dom-if"
              if="[[!readonly]]"
              restamp="true">
            <div class="flex-none layout vertical center-center col-actions">
              <div>
                <paper-icon-button
                    index="[[index]]"
                    class="remove-btn"
                    on-tap="_remove"
                    icon="icons:cancel">
                </paper-icon-button>
                <paper-tooltip offset="5">[[localize('remove')]]</paper-tooltip>
              </div>
            </div>
          </template>
  
          <div class="col-name flex">
            <template
                is="dom-if"
                if="[[readonly]]"
                restamp="true">
              <paper-input
                  label="[[localize('disaggregation_by')]]"
                  value="[[dataDisagg.name]]"
                  always-float-label
                  disabled>
              </paper-input>
            </template>
  
            <template
                is="dom-if"
                if="[[!readonly]]"
                restamp="true">
              <paper-dropdown-menu
                class="dis-menu validate"
                id="disaggregationsDrop"
                index="[[index]]"
                label="[[localize('disaggregation_by')]]"
                on-value-changed="_validate"
                on-selected-item-changed="_setDisaggregation"
                disabled="[[readonly]]"
                always-float-label
                required>
                <paper-listbox
                  slot="dropdown-content"
                  class="dropdown-content">
                  <template
                    is="dom-repeat"
                    items="[[disaggregations]]">
                    <paper-item name="[[item.id]]">[[item.name]]
                    </paper-item>
                  </template>
                </paper-listbox>
              </paper-dropdown-menu>
            </template>
          </div>
  
          <div class="col-values flex">
            <paper-input
              index="[[index]]"
              label="[[localize('disaggregation_groups')]]"
              value="[[_formatChoices(dataDisagg)]]"
              always-float-label
              disabled>
            </paper-input>
          </div>
  
        </div>
      </template>
      
      <template
          is="dom-if"
          if="[[!readonly]]"
          restamp="true">
        <paper-button
            class="btn-primary add-disaggregation-btn"
            on-tap="_add"
            disabled="[[!_canAddMore]]">
          [[localize('add_disaggregation')]]
        </paper-button>
      </template>
    `;
  }

  @property({type: Number})
  threshold: number = 3;

  @property({type: Array, notify: true})
  value: any[] = [];

  @property({type: Array})
  disaggregations: any[] = [];

  @property({type: Boolean, notify: true})
  invalid: boolean = false;

  @property({type: Boolean})
  _canAddMore: boolean = true;

  @property({type: Boolean})
  readonly: boolean = false;


  static get observers(){
    return ['_setCanAddMore(value.splices)'];
  }

  _setCanAddMore() {
    this.set('_canAddMore', this.value.length < this.threshold);
  }

  _add() {
    this.push('value', {
      name: '',
      choices: [],
    });
  }

  _remove(e: CustomEvent) {
    let toRemove = +e.target!.index;
    this.splice('value', toRemove, 1);
  }

  _setDisaggregation(e: CustomEvent, data: GenericObject) {
    let index = +e.target!.index;

    let id;
    if (data.value) {
      id = data.value.name;
    }

    let selected;

    if (id) {
      selected = this.disaggregations.find(function(dis) {
        return dis.id === id;
      });
    }

    let newSelectedDisaggregations;

    if (selected) {
      newSelectedDisaggregations = this.value.slice();

      newSelectedDisaggregations[index] = selected;

      this.set('value', newSelectedDisaggregations);
    }
  }

  _formatChoices(selected) {
    return selected.choices.map( (choice) => {
      return choice.value;
    }).join(', ');
  }

  _validate(e: CustomEvent) {
    e.target!.validate();
  }

  validate() {
    let self = this;
    this.set('invalid', false);
    let allMenus = this.shadowRoot!.querySelectorAll('.dis-menu');
    allMenus.forEach((menu) => {
      menu.set('invalid', false);
    });
    allMenus.forEach((menu) => {
      if (!menu.value) {
        menu.set('invalid', true);
        self.set('invalid', true);
      }
    });
    if (allMenus.length < 2) {
      return;
    }
    let chosen = allMenus.map((choice) => {
      return choice.value;
    });

    for (let i = 0; i < chosen.length - 1; i++) {
      for (let j = i + 1; j < chosen.length; j++) {
        if (chosen[i] === chosen[j]) {
          allMenus[i].set('invalid', true);
          allMenus[j].set('invalid', true);
          self.set('invalid', true);
        }
      }
    }
  }

}

window.customElements.define('disaggregations-dropdown-widget', DisaggregationsDropdownWidget);
