var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-item';
import '@polymer/polymer/lib/elements/dom-repeat';
import { ReduxConnectedElement } from '../etools-prp-common/ReduxConnectedElement';
import { localizeSet } from '../redux/actions/localize';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 */
class LanguageDropdown extends ReduxConnectedElement {
    constructor() {
        super(...arguments);
        this.selected = 0;
        this.defaultLanguage = 'en';
    }
    static get template() {
        return html ` <style>
        :host {
          display: block;
          position: relative;
          cursor: pointer;
          @apply --select-plan-languages-offset;
        }

        paper-dropdown-menu {
          width: 50px;
          padding-right: 36px;
          @apply --languages-dropdown-width;

          --paper-input-container-underline: {
            display: none;
            @apply --underline-shown;
          }

          --paper-input-container-underline-focus: {
            display: none;
          }

          --paper-input-container-underline-disabled: {
            display: none;
          }

          --paper-input-container-input: {
            color: var(--theme-primary-text-color-medium);
          }

          --paper-dropdown-menu-icon: {
            color: var(--theme-primary-text-color-medium);
          }

          --paper-input-container-label: {
            top: 4px;
            color: var(--theme-primary-text-color-medium);
          }

          --paper-input-container-input: {
            margin-bottom: 2px;
            color: var(--theme-primary-text-color-medium);
            @apply --language-dropdown-input;
          }
        }

        paper-item {
          font-size: 15px;
          white-space: nowrap;
          cursor: pointer;
          min-height: 48px;
          padding: 0px 16px;
        }
      </style>

      <paper-dropdown-menu label="[[language]]" noink no-label-float>
        <paper-listbox
          slot="dropdown-content"
          class="dropdown-content"
          on-iron-select="_languageSelected"
          selected="[[selected]]"
        >
          <template id="repeat" is="dom-repeat" items="[[data]]">
            <paper-item>[[item]]</paper-item>
          </template>
        </paper-listbox>
      </paper-dropdown-menu>`;
    }
    _languageSelected(e) {
        const allLanguages = Object.keys(this.availableLanguages);
        if (!allLanguages.includes(this.current)) {
            this._storeSelectedLanguage(this.defaultLanguage);
        }
        const newLanguage = this.$.repeat.itemForElement(e.detail.item);
        if (newLanguage === this.current) {
            return;
        }
        this._storeSelectedLanguage(newLanguage);
    }
    _storeSelectedLanguage(language) {
        localStorage.setItem('defaultLanguage', language);
        this.reduxStore.dispatch(localizeSet(language));
    }
    _computeLanguage(data, current) {
        return data.filter(function (language) {
            return language === current;
        })[0];
    }
    _computeSelected(data, language) {
        if (!data || !data.length || !language) {
            return;
        }
        return data.indexOf(language);
    }
    _computeLanguages(availableLanguages) {
        return Object.keys(availableLanguages).slice();
    }
}
__decorate([
    property({ type: String, computed: '_computeLanguage(data, current)' })
], LanguageDropdown.prototype, "language", void 0);
__decorate([
    property({ type: Object, computed: 'getReduxStateObject(rootState.localize.resources)' })
], LanguageDropdown.prototype, "availableLanguages", void 0);
__decorate([
    property({ type: Number, computed: '_computeSelected(data, language)' })
], LanguageDropdown.prototype, "selected", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.localize.language)' })
], LanguageDropdown.prototype, "current", void 0);
__decorate([
    property({ type: Array, computed: '_computeLanguages(availableLanguages)' })
], LanguageDropdown.prototype, "data", void 0);
window.customElements.define('language-dropdown', LanguageDropdown);
