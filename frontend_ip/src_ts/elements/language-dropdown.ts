import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';
import {localizeSet} from '../redux/actions/localize';
import {store} from '../redux/store';

@customElement('language-dropdown')
export class LanguageDropdown extends MatomoMixin(connect(store)(LitElement)) {
  static styles = css`
    :host {
      display: block;
      position: relative;
      cursor: pointer;
      /* Apply custom styles if needed */
    }

    paper-dropdown-menu {
      /* Add your custom styles */
    }

    paper-item {
      /* Add your custom styles */
    }
  `;

  @property({type: String})
  language!: string;

  @property({type: Object})
  availableLanguages!: any;

  @property({type: Array})
  data!: any[];

  @property({type: Number})
  selected = 0;

  @property({type: String})
  current!: string;

  defaultLanguage = 'en';

  render() {
    return html`
      <paper-dropdown-menu label="${this.language}" noink no-label-float>
        <paper-listbox
          slot="dropdown-content"
          class="dropdown-content"
          @iron-select="${this._languageSelected}"
          tracker="Language change"
          .selected="${this.selected}"
        >
          ${this.data.map((item) => html` <paper-item>${item}</paper-item> `)}
        </paper-listbox>
      </paper-dropdown-menu>
    `;
  }

  stateChanged(state: any) {
    if (this.current !== state.localize.language) {
      this.current = state.localize.language;
    }

    if (this.availableLanguages !== state.localize.resources) {
      this.availableLanguages = state.localize.resources;
    }

    this.data = this._computeLanguages(this.availableLanguages);
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    if (changedProperties.has('data') || changedProperties.has('current')) {
      this.language = this._computeLanguage(this.data, this.language);
    }

    if (changedProperties.has('data') || changedProperties.has('language')) {
      this.selected = this._computeSelected(this.data, this.language);
      this._dispatchEvent('selected', this.selected);
    }
  }

  private _languageSelected(e: CustomEvent) {
    const allLanguages = Object.keys(this.availableLanguages);
    if (!allLanguages.includes(this.current)) {
      this._storeSelectedLanguage(this.defaultLanguage);
    }
    const newLanguage = e.detail.item.innerText; //Hack
    if (newLanguage === this.current) {
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

  private _computeLanguage(data: any[], current: string): string {
    return data.find((language) => language === current) || '';
  }

  private _computeSelected(data: any[], language: string): number {
    return data.indexOf(language);
  }

  private _computeLanguages(availableLanguages: any): any[] {
    return Object.keys(availableLanguages);
  }

  private _dispatchEvent(propName: string, value: any) {
    fireEvent(this, `${propName}-changed`, {value});
  }
}
