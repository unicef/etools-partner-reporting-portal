import {ReduxConnectedElement} from '../../../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-icon-button';
import '@polymer/paper-input/paper-input';
import {buttonsStyles} from '../../../../etools-prp-common/styles/buttons-styles';
import {sharedStyles} from '../../../../etools-prp-common/styles/shared-styles';
import LocalizeMixin from '../../../../etools-prp-common/mixins/localize-mixin';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../../../etools-prp-common/typings/globals.types';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 */
class CustomFieldsWidget extends LocalizeMixin(ReduxConnectedElement) {
  public static get template() {
    return html`
      ${buttonsStyles} ${sharedStyles}
      <style include="iron-flex iron-flex-alignment app-grid-style">
        :host {
          display: block;

          --app-grid-columns: 3;
          --app-grid-gutter: 12px;
          --app-grid-item-height: auto;
          --app-grid-expandible-item-columns: 2;
        }

        .app-grid {
          padding-top: 0;
          margin: 0 -var(--app-grid-gutter);
        }

        .item-2-col {
          @apply --app-grid-expandible-item;
        }

        header {
          background-color: var(--paper-grey-200);
          padding: 5px 10px;
          margin: 0 0 1em;
        }

        h3 {
          margin: 0;
          font-size: 14px;
        }

        .col-actions {
          width: 40px;
          margin-right: 24px;
          border-right: 1px solid var(--paper-grey-400);
        }

        .row {
          margin-bottom: 1em;
        }

        .remove-btn {
          width: 34px;
          height: 34px;
          color: var(--paper-deep-orange-a700);
        }

        labelled-item {
          padding: 8px 0;
        }
      </style>

      <template is="dom-repeat" items="[[customFields]]" as="field">
        <div class="row layout horizontal">
          <div class="flex-none layout vertical center-center col-actions">
            <paper-icon-button
              id="[[field.id]]"
              class="remove-btn"
              data-id$="[[field.id]]"
              on-tap="_remove"
              icon="icons:cancel"
            >
            </paper-icon-button>
          </div>
          <div class="flex">
            <div class="app-grid">
              <paper-input
                class="item"
                nameid="[[field.id]]"
                name="customFieldTitle[[index]]"
                value="[[field.name]]"
                label="[[localize('fields_title')]]"
                on-input="_updateCustomFieldTitle"
              >
              </paper-input>

              <paper-input
                class="item-2-col"
                valueid="[[field.id]]"
                name="customFieldDescription[[index]]"
                value="[[field.value]]"
                label="[[localize('fields_value')]]"
                on-input="_updateCustomFieldDescription"
              >
              </paper-input>
            </div>
          </div>
        </div>
      </template>

      <paper-button class="btn-primary" on-tap="_add"> [[localize('add_custom_field')]] </paper-button>
    `;
  }

  @property({type: Number})
  fieldId = 0;

  @property({type: Number})
  editFieldId = 0;

  @property({type: Array, notify: true})
  customFields: any[] = [];

  @property({type: Boolean, observer: '_setCustomFields'})
  edit = false;

  _add() {
    this.set('fieldId', this.get('fieldId') + 1);
    this.push('customFields', {
      id: this.fieldId,
      name: '',
      value: ''
    });
  }

  _remove(e: CustomEvent) {
    const value = this.get('customFields');
    const toRemove = value.findIndex((field: GenericObject) => {
      return String(field.id) === String((e.target as any).id);
    });
    this.splice('customFields', toRemove, 1);
  }

  _updateCustomFieldTitle(e: CustomEvent) {
    const field = this.customFields.find((field) => {
      return Number(field.id) === Number((e.target as any).nameid);
    });
    field.name = (e.target as any).value;
  }

  _updateCustomFieldDescription(e: CustomEvent) {
    const field = this.customFields.find((field) => {
      return Number(field.id) === Number((e.target as any).valueid);
    });
    field.value = (e.target as any).value;
  }

  _updateVisibleCustomFields() {
    const newCustomFields = this.customFields.map((field) => {
      return field;
    });
    this.customFields = newCustomFields;
  }

  _setCustomFields(edit: boolean) {
    if (edit) {
      let editFields = 0;
      const newCustomFields = this.customFields.map((field) => {
        editFields += 1;
        field.id = editFields - 1;
        return field;
      });
      this.set('customFields', newCustomFields);
      this.set('editFieldId', editFields - 1);
    } else {
      this.set('customFields', []);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.editFieldId > 0) {
      this.set('fieldId', this.editFieldId);
    } else {
      this.set('fieldId', 0);
    }
  }
}

window.customElements.define('custom-fields-widget', CustomFieldsWidget);
