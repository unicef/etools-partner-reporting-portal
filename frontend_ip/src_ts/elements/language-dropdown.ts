import {LitElement, html, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';
import {localizeSet} from '../redux/actions/localize';
import {store} from '../redux/store';

@customElement('language-dropdown')
export class LanguageDropdown extends MatomoMixin(connect(store)(LitElement)) {
  @property({type: Object})
  availableLanguages!: any;

  @property({type: Array})
  languageOptions: any[] = [];

  @property({type: String})
  currentLanguage!: string;

  defaultLanguage = 'en';

  render() {
    return html`
    <style>
    etools-dropdown {
      --sl-input-color: var(--light-secondary-text-color);
      --etools-icon-fill-color: var(--light-secondary-text-color);
      --sl-input-border-color: var(--light-secondary-text-color);
    }
    </style>
       <etools-dropdown
        id="dpLanguage"
        placeholder="&#8212;"
        .selected="${this.currentLanguage}"
        .options="${this.languageOptions}"
        option-value="id"
        option-label="name"
        @etools-selected-item-changed="${this._languageSelected}"
        trigger-value-change-event
        hide-search
      >
      </etools-dropdown>   
    `;
  }

  stateChanged(state: any) {
    if (this.currentLanguage !== state.localize.language) {
      this.currentLanguage = state.localize.language;
    }

    if (this.availableLanguages !== state.localize.resources) {
      this.availableLanguages = state.localize.resources;
      this.languageOptions = this._computeLanguages(this.availableLanguages);
    }    
  }

  updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);
    // if (changedProperties.has('data') || changedProperties.has('current')) {
    //   this.language = this._computeLanguage(this.languageOptions, this.language);
    // }

    // if (changedProperties.has('data') || changedProperties.has('language')) {
    //   this.selected = this._computeSelected(this.languageOptions, this.language);
    //   this._dispatchEvent('selected', this.selected);
    // }
  }

  private _languageSelected(e: CustomEvent) {
    if (!e.detail || e.detail.selectedItem == undefined) {
      return;
    }

    const newLanguage = e.detail.selectedItem.id;
    if (newLanguage === this.currentLanguage) {
      return;
    }
    this.trackAnalytics(e);
    this._storeSelectedLanguage(newLanguage);
    fireEvent(this, 'language-changed', {language: newLanguage});
  }

  private _storeSelectedLanguage(language: string) {
    localStorage.setItem('defaultLanguage', language);
    console.log(language);
    store.dispatch(localizeSet(language));
  }

  private _computeLanguages(availableLanguages: any): any[] {
    return Object.keys(availableLanguages).map((x) => ({id: x, name: x}));
  }
}
