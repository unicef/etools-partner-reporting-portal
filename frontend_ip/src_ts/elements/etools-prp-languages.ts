import {LitElement, html} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import {store} from '../redux/store';
import {RootState} from '../typings/redux.types';

@customElement('etools-prp-languages')
export class EtoolsPrpLanguages extends connect(store)(LitElement) {
  @property({type: String})
  _current!: string;

  @property({type: Object})
  _all!: any;

  @property({type: String, reflect: true})
  current!: string;

  @property({type: Array, reflect: true})
  all!: any[];

  stateChanged(state: RootState) {
    if (this._current !== state.localize.language) {
      this._current = state.localize.language;
    }

    if (this._all !== state.localize.resources) {
      this._all = state.localize.resources;
    }
  }

  updated(changedProperties: any) {
    super.updated(changedProperties);
    
    if (changedProperties.has('_current')) {
      this.current = this._current;
    }
    if (changedProperties.has('_all')) {
      this.all = Object.keys(this._all).slice();
    }
  }

  render() {
    return html``;
  }
}

export {EtoolsPrpLanguages as EtoolsPrpLanguagesEl};
