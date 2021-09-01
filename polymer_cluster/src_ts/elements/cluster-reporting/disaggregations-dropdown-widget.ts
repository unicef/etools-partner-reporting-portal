import {ReduxConnectedElement} from '../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-icon-button';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-input/paper-input';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@polymer/paper-item/paper-item';
import '@polymer/paper-tooltip/paper-tooltip';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import {buttonsStyles} from '../../etools-prp-common/styles/buttons-styles';
import {property} from '@polymer/decorators/lib/decorators';
import {PaperIconButtonElement} from '@polymer/paper-icon-button';
import {GenericObject} from '../../etools-prp-common/typings/globals.types';
import {PolymerElement} from '@polymer/polymer/polymer-element';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class DisaggregationsDropdownWidget extends UtilsMixin(LocalizeMixin(ReduxConnectedElement)) {
  public static get template() {
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

        etools-dropdown {
          width: 100%;
        }
      </style>

      <h2>[[localize('disaggregations')]] ([[value.length]])</h2>

      <template is="dom-repeat" items="[[value]]" as="dataDisagg">
        <div class="row layout horizontal">
          <template is="dom-if" if="[[!readonly]]" restamp="true">
            <div class="flex-none layout vertical center-center col-actions">
              <div>
                <paper-icon-button data-index$="[[index]]" class="remove-btn" on-tap="_remove" icon="icons:cancel">
                </paper-icon-button>
                <paper-tooltip offset="5">[[localize('remove')]]</paper-tooltip>
              </div>
            </div>
          </template>

          <div class="col-name flex">
            <template is="dom-if" if="[[readonly]]" restamp="true">
              <paper-input
                label="[[localize('disaggregation_by')]]"
                value="[[dataDisagg.name]]"
                always-float-label
                disabled
              >
              </paper-input>
            </template>

            <template is="dom-if" if="[[!readonly]]" restamp="true">
              <etools-dropdown
                class="dis-menu validate"
                id="disaggregationsDrop"
                data-index$="[[index]]"
                label="[[localize('disaggregation_by')]]"
                options="[[disaggregations]]"
                option-value="id"
                option-label="name"
                trigger-value-change-event
                on-etools-selected-item-changed="_setDisaggregation"
                disabled="[[readonly]]"
                hide-search
                always-float-label
                required
              >
              </etools-dropdown>
            </template>
          </div>

          <div class="col-values flex">
            <paper-input
              index$="[[index]]"
              label="[[localize('disaggregation_groups')]]"
              value="[[_formatChoices(dataDisagg)]]"
              always-float-label
              disabled
            >
            </paper-input>
          </div>
        </div>
      </template>

      <template is="dom-if" if="[[!readonly]]" restamp="true">
        <paper-button class="btn-primary add-disaggregation-btn" on-tap="_add" disabled="[[!_canAddMore]]">
          [[localize('add_disaggregation')]]
        </paper-button>
      </template>
    `;
  }

  @property({type: Number})
  threshold = 3;

  @property({type: Array, notify: true})
  value: any[] = [];

  @property({type: Array})
  disaggregations: any[] = [];

  @property({type: Boolean, notify: true})
  invalid = false;

  @property({type: Boolean})
  _canAddMore = true;

  @property({type: Boolean})
  readonly = false;

  static get observers() {
    return ['_setCanAddMore(value.splices)'];
  }

  _setCanAddMore() {
    this.set('_canAddMore', this.value.length < this.threshold);
  }

  _add() {
    this.push('value', {
      name: '',
      choices: []
    });
  }

  _remove(e: CustomEvent) {
    const toRemove = +(e.target! as PaperIconButtonElement).dataset.index!;
    this.splice('value', toRemove, 1);
  }

  _setDisaggregation(e: CustomEvent) {
    if (!e.detail.selectedItem) {
      return;
    }
    const index = +(e.target as EtoolsDropdownEl).dataset.index!;
    const id = e.detail.selectedItem.id;

    const selected = this.disaggregations.find(function (dis) {
      return dis.id === id;
    });

    if (selected) {
      const newSelectedDisaggregations = this.value.slice();
      newSelectedDisaggregations[index] = selected;
      this.set('value', newSelectedDisaggregations);
    }
  }

  _formatChoices(selected: GenericObject) {
    return selected.choices
      .map((choice: GenericObject) => {
        return choice.value;
      })
      .join(', ');
  }

  _validate(e: CustomEvent) {
    (e.target as any).validate();
  }

  validate() {
    this.set('invalid', false);
    const allMenus = this.shadowRoot!.querySelectorAll('.dis-menu');
    allMenus.forEach((menu: any) => {
      menu.set('invalid', false);
    });
    allMenus.forEach((menu: any) => {
      if (!menu.selected) {
        menu.set('invalid', true);
        this.set('invalid', true);
      }
    });
    if (allMenus.length < 2) {
      return;
    }
    const chosen = Array.from(allMenus).map((choice: any) => {
      return choice.selected;
    });

    for (let i = 0; i < chosen.length - 1; i++) {
      for (let j = i + 1; j < chosen.length; j++) {
        if (chosen[i] === chosen[j]) {
          (allMenus[i] as PolymerElement).set('invalid', true);
          (allMenus[j] as PolymerElement).set('invalid', true);
          this.set('invalid', true);
        }
      }
    }
  }
}

window.customElements.define('disaggregations-dropdown-widget', DisaggregationsDropdownWidget);
