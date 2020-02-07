import {PolymerElement, html} from '@polymer/polymer';
import {property} from "@polymer/decorators/lib/decorators";
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-item';
import '@polymer/app-localize-behavior/app-localize-behavior';

import LocalizeMixin from '../mixins/localize-mixin';
import { GenericObject } from '../typings/globals.types';
// <link rel="import" href="../redux/actions/localize.html">

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 */
class LanguageDropdown extends LocalizeMixin(PolymerElement){
    public static get template() {
        return html`
        <style>
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
          };

          --paper-input-container-underline-focus: {
            display: none;
          };

          --paper-input-container-underline-disabled: {
            display: none;
          };

          --paper-input-container-input: {
            color: var(--theme-primary-text-color-medium);
          };

          --paper-dropdown-menu-icon: {
            color: var(--theme-primary-text-color-medium);
          };

          --paper-input-container-label: {
            top: 4px;
            color: var(--theme-primary-text-color-medium);
          };

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
        }
      </style>

      <paper-dropdown-menu label="[[language]]" noink no-label-float>
        <paper-listbox
            class="dropdown-content"
            on-iron-select="_languageSelected"
            selected="[[selected]]">
          <template id="repeat" is="dom-repeat" items="[[data]]">
            <paper-item>[[item]]</paper-item>
          </template>
        </paper-listbox>
      </paper-dropdown-menu>
    `};
    // behaviors: [
    //     App.Behaviors.ReduxBehavior,
    //     App.Behaviors.LocalizeBehavior,
    //     Polymer.AppLocalizeBehavior,
    //   ],

    // statePath: 'localize.language',
    @property({type: String, computed: '_computeLanguage(data, current)'})
    language!: string;

    // statePath: 'localize.resources',
    @property({type: Object})
    availableLanguages!: GenericObject;

    @property({type: Number, computed: '_computeSelected(data, language)'})
    selected = 0;

    //needs to be checked if it is OK, originals bellow
    // current: String,
    // data: Array,
    @property({type: String})
    current!: string;

    @property({type: Array})
    data!: any[];

    //I believe I did not quite do this correctly.....
    //please review it
    _languageSelected(e: CustomEvent) {
        var allLanguages = Object.keys(this.availableLanguages);

        if (allLanguages.includes(this.current) === false) {
          this.dispatch(App.Actions.Localize.set('en'));
        }

        var newLanguage = this.$.repeat.itemForElement(e.detail.item);

        if (newLanguage === this.current) {
          return;
        }

        this.dispatch(App.Actions.Localize.set(newLanguage));
      }

      _computeLanguage(data: any[], current: String) {
        return data.filter(function (language: string) {
          return language === current;
        })[0];
      }

      _computeSelected(data: any[], language: String) {
        return data.indexOf(language);
      }
}

window.customElements.define('language-dropdown', LanguageDropdown);

