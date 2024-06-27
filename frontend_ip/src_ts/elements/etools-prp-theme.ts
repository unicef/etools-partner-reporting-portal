import {LitElement} from 'lit';
import {property, customElement, state} from 'lit/decorators.js';
import Constants from '../etools-prp-common/constants';
import {connect} from 'pwa-helpers';
import {store} from '../redux/store';

/**
 * @customElement
 */
@customElement('etools-prp-theme')
export class EtoolsPrpTheme extends connect(store)(LitElement) {
  @state()
  _app!: string;

  @property({type: String, reflect: true})
  primaryColor = Constants.THEME_PRIMARY_COLOR_IP;

  stateChanged(state: any) {
    if (this._app !== state.app.current) {
      this._app = state.app.current;
    }
  }
}

export {EtoolsPrpTheme as EtoolsPrpThemeEl};
