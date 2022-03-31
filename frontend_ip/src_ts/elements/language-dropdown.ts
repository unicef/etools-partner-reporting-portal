import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-item';
import '@polymer/polymer/lib/elements/dom-repeat';

import {GenericObject} from '../etools-prp-common/typings/globals.types';
import {ReduxConnectedElement} from '../etools-prp-common/ReduxConnectedElement';
import {localizeSet} from '../redux/actions/localize';
import {DomRepeat} from '@polymer/polymer/lib/elements/dom-repeat';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 */
class LanguageDropdown extends MatomoMixin(ReduxConnectedElement) {
  public static get template() {
    return html` <style>
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
          tracker="Language change"
          selected="[[selected]]"
        >
          <template id="repeat" is="dom-repeat" items="[[data]]">
            <paper-item>[[item]]</paper-item>
          </template>
        </paper-listbox>
      </paper-dropdown-menu>`;
  }

  @property({type: String, computed: '_computeLanguage(data, current)'})
  language!: string;

  @property({type: Object, computed: 'getReduxStateObject(rootState.localize.resources)'})
  availableLanguages!: GenericObject;

  @property({type: Number, computed: '_computeSelected(data, language)'})
  selected = 0;

  @property({type: String, computed: 'getReduxStateValue(rootState.localize.language)'})
  current!: string;

  @property({type: Array, computed: '_computeLanguages(availableLanguages)'})
  data!: any[];

  private defaultLanguage = 'en';

  _languageSelected(e: CustomEvent) {
    const allLanguages = Object.keys(this.availableLanguages);
    if (!allLanguages.includes(this.current)) {
      this._storeSelectedLanguage(this.defaultLanguage);
    }
    const newLanguage = (this.$.repeat as DomRepeat).itemForElement(e.detail.item);
    if (newLanguage === this.current) {
      return;
    }
    this.trackAnalytics(e);
    this._storeSelectedLanguage(newLanguage);
  }

  _storeSelectedLanguage(language: string) {
    localStorage.setItem('defaultLanguage', language);
    this.reduxStore.dispatch(localizeSet(language));
  }

  _computeLanguage(data: any[], current: string) {
    return data.filter(function (language: string) {
      return language === current;
    })[0];
  }

  _computeSelected(data: any[], language: string) {
    if (!data || !data.length || !language) {
      return;
    }
    return data.indexOf(language);
  }

  _computeLanguages(availableLanguages: GenericObject) {
    return Object.keys(availableLanguages).slice();
  }
}

window.customElements.define('language-dropdown', LanguageDropdown);
