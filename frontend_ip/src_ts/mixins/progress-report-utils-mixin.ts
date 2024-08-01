import {Constructor} from '../etools-prp-common/typings/globals.types';
import Settings from '../etools-prp-common/settings';
import {LitElement} from 'lit';

/**
 * @mixinFunction
 */
function ProgressReportUtilsMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class ProgressReportUtilsClass extends baseClass {
    public _isReadOnlyReport(report: any) {
      return Settings.ip.readOnlyStatuses.indexOf(report.status) !== -1;
    }

    _getMode(report: any, permissions: any) {
      switch (true) {
        case this._isReadOnlyReport(report):
        case report.programme_document.status === 'Signed':
        case report.programme_document.status === 'Closed':
        case !permissions || !permissions.editProgressReport:
          return 'view';

        default:
          return 'edit';
      }
    }

    public _canNavigateToReport() {
      return true;
    }

    public _isFinalReport(report: any) {
      return report && report.is_final && report.report_type.toLowerCase() !== 'sr';
    }
  }
  return ProgressReportUtilsClass;
}

export default ProgressReportUtilsMixin;
