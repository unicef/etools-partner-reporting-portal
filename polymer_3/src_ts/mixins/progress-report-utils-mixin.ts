import {PolymerElement} from '@polymer/polymer';
import {Constructor} from '../typings/globals.types';
import Settings from '../settings';


/**
 * @polymer
 * @mixinFunction
 */
function ProgressReportUtilsMixin<T extends Constructor<PolymerElement>>(baseClass: T) {

  class ProgressReportUtilsClass extends baseClass {

    public _isReadOnlyReport(report: any) {
      return Settings.ip.readOnlyStatuses.indexOf(report.status) !== -1;
    }

    _getMode(report: any, permissions: any) {
      switch (true) {
        case this._isReadOnlyReport(report):
        case report.programme_document.status === 'Signed':
        case report.programme_document.status === 'Closed':
        case !permissions.editProgressReport:
          return 'view';

        default:
          return 'edit';
      }
    }

    public _canNavigateToReport() {
      return true;
    }

    public _isFinalReport(report: any) {
      return report.is_final && report.report_type.toLowerCase() !== 'sr';
    }
  }
  return ProgressReportUtilsClass;
}

export default ProgressReportUtilsMixin;
