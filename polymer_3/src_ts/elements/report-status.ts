import {ReduxConnectedElement} from '../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import './status-badge';
import LocalizeMixin from '../mixins/localize-mixin';
import '@polymer/polymer/lib/elements/dom-if';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 */
class ReportStatus extends LocalizeMixin(ReduxConnectedElement) {
  public static get template() {
    return html`
      <style>
        :host {
          display: inline-block;
          margin-right: .5em;
        }

        status-badge {
          display: inline-block;
          vertical-align: middle;
          position: relative;
          top: -3px;
        }
      </style>

      <status-badge type="[[type]]"></status-badge>
      <template
          is="dom-if"
          if="[[!noLabel]]">
        [[label]]
      </template>`
    ;
  }

  @property({type: String})
  status!: string;

  @property({type: Boolean})
  noLabel = false;

  @property({type: String, computed: '_computeType(status)'})
  type!: string;

  @property({type: String, computed: '_computeLabel(status, final, app, reportType, localize)'})
  label!: string;

  @property({type: Boolean})
  final = false;

  @property({type: String, computed: 'getReduxStateValue(rootState.app.current)'})
  app!: string;

  @property({type: String})
  reportType = '';

  _computeType(status: string) {
    switch (status) {
      case '1':
      case 'Sub':
      case 'Met':
      case 'OnT':
      case 'Com':
      case 'Acc':
        return 'success';
      case '2':
      case 'Ove':
      case 'Sen':
        return 'error';
      case '3':
      case 'Due':
      case 'NoP':
      case 'Ong':
        return 'neutral';
      case 'Rej':
      case 'Con':
      case 'Pla':
        return 'warning';
      case 'NoS':
        return 'no-status';
    }
    return 'no-status';
  }

  _computeLabel(status: string, final: boolean, app: string, reportType: string, localize: any) {
    switch (status) {
      case '1':
        return localize('nothing_due');
      case '2':
      case 'Ove':
        return localize('overdue');
      case '3':
      case 'Due':
        return localize('due');
      case 'Sub':
        return localize('submitted');
      case 'Rej':
        return localize('rejected');
      case 'Met':
        return final ? localize('met_results') : localize('met');
      case 'OnT':
        return localize('on_track');
      case 'NoP':
        return localize('no_progress');
      case 'Con':
        return final ? localize('constrained_partially') : localize('constrained');
      case 'Ong':
        return localize('ongoing');
      case 'Pla':
        return localize('planned');
      case 'Com':
        return localize('completed');
      case 'NoS':
        return localize('no_status');
      case 'Sen':
        return localize('sent_back');
      case 'Acc':
        return app === 'ip-reporting' && reportType !== 'HR' ? localize('accepted') : localize('received');
    }
  }
}

window.customElements.define('report-status', ReportStatus);
