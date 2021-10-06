import Settings from '../etools-prp-common/settings';
/**
 * @polymer
 * @mixinFunction
 */
function ProgressReportUtilsMixin(baseClass) {
    class ProgressReportUtilsClass extends baseClass {
        _isReadOnlyReport(report) {
            return Settings.ip.readOnlyStatuses.indexOf(report.status) !== -1;
        }
        _getMode(report, permissions) {
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
        _canNavigateToReport() {
            return true;
        }
        _isFinalReport(report) {
            return report.is_final && report.report_type.toLowerCase() !== 'sr';
        }
    }
    return ProgressReportUtilsClass;
}
export default ProgressReportUtilsMixin;
