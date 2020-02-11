import {ReduxConnectedElement} from '../ReduxConnectedElement';
import {property} from '@polymer/decorators';
import RoutingMixin from '../mixins/routing-mixin';
import {GenericObject} from '../typings/globals.types';
import {getDomainByEnv} from '../config';

/**
 * @polymer
 * @customElement
 * @appliesMixin RoutingMixin
 */
class AppRedirect extends RoutingMixin(ReduxConnectedElement) {

  @property({type: String, computed: 'getReduxStateValue(state.app.current)'})
  app!: string;

  @property({type: String, computed: 'getReduxStateValue(state.workspaces.current)'})
  workspace!: string;

  @property({type: Object, computed: 'getReduxStateObject(state.userProfile.profile)'})
  profile!: GenericObject;


  public static get observers() {
    return [
      '_redirectIfNeeded(app, workspace, profile.access)',
    ]
  }

  _redirectIfNeeded(app: string, workspace: string, access: string[]) {
    if (!access || !access.length) {
      location.href = getDomainByEnv() + '/src/pages/unauthorized';
    } else if (access.indexOf(app) === -1) {
      location.href = this.buildBaseUrl(workspace, access[0]);
    }
  }
}

window.customElements.define('app-redirect', AppRedirect);

export {AppRedirect as AppRedirectEl};
