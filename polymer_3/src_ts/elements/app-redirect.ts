import {ReduxConnectedElement} from '../ReduxConnectedElement';
import {property} from '@polymer/decorators';
import RoutingMixin from '../mixins/routing-mixin';
import {GenericObject} from '../typings/globals.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin RoutingMixin
 */
class AppRedirect extends RoutingMixin(ReduxConnectedElement) {
  @property({type: String, computed: 'getReduxStateValue(rootState.app.current)'})
  app!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.workspaces.current)'})
  workspace!: string;

  @property({type: Array, computed: 'getReduxStateArray(rootState.workspaces.all)'})
  workspaces!: any[];

  @property({type: Object, computed: 'getReduxStateObject(rootState.userProfile.profile)'})
  profile!: GenericObject;

  public static get observers() {
    return ['_redirectIfNeeded(app, workspaces, workspace, profile)'];
  }

  _redirectIfNeeded(app: string, workspaces: any[], workspace: string, profile: GenericObject) {
    if (workspaces && !workspaces.length) {
      // user has no workspaces
      location.href = '/unauthorized';
    }
    if (app === undefined || workspace === undefined || !profile) {
      return;
    }

    if (!profile.access || !profile.access.length) {
      location.href = '/unauthorized';
    } else if (app && profile.access.indexOf(app) === -1) {
      location.href = this.buildBaseUrl(workspace, profile.access[0]);
    }
  }
}

window.customElements.define('app-redirect', AppRedirect);

export {AppRedirect as AppRedirectEl};
