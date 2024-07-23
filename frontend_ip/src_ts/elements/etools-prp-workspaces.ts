import {LitElement, html, css} from 'lit';
import {property, customElement, state} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import {store} from '../redux/store';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';

@customElement('etools-prp-workspaces')
export class EtoolsPrpWorkspaces extends connect(store)(LitElement) {
  static styles = css`
    :host {
      display: block;
    }
  `;

  @state()
  _current!: string;

  @state()
  _all!: any[];

  @property({type: String, reflect: true})
  current!: string;

  @property({type: Array, reflect: true})
  all!: any[];

  stateChanged(state: any) {
    if ((this._current = state.workspaces.current)) {
      this._current = state.workspaces.current;
    }

    if ((this._all = state.workspaces.all)) {
      this._all = state.workspaces.all;
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    
    if (changedProperties.has('_current')) {
      this.current = this._current;
      this._dispatchEvent('current', this.current);
    }

    if (changedProperties.has('_all')) {
      this.all = this._all?.slice();
      this._dispatchEvent('all', this.all);
    }
  }

  _dispatchEvent(propName: string, value: any) {
    fireEvent(this, `${propName}-changed`, {value});
  }

  render() {
    return html``;
  }
}
