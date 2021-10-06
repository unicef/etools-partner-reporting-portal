/**
 * @polymer
 * @mixinFunction
 */
function OverlayHelperMixin(baseClass) {
    class OverlayHelperClass extends baseClass {
        connectedCallback() {
            super.connectedCallback();
            this._addEventListeners();
        }
        _addEventListeners() {
            this.addEventListener('iron-overlay-opened', this._dialogOpening);
            this.addEventListener('iron-overlay-closed', this._dialogClosing);
        }
        _dialogOpening() {
            const dialogOverlay = document.querySelector('iron-overlay-backdrop[opened]');
            if (!dialogOverlay) {
                return;
            }
            // dialogOverlay.classList.remove('opened');
            // dialogOverlay.removeAttribute('opened');
            const zIndex = dialogOverlay.style.zIndex;
            if (dialogOverlay.parentElement) {
                dialogOverlay.parentElement.removeChild(dialogOverlay);
            }
            this.$.drawer.zIndex = '-1';
            const pageOverlay = this.$.pageOverlay;
            if (!pageOverlay.classList.contains('opened')) {
                pageOverlay.style.zIndex = zIndex;
                pageOverlay.classList.add('opened');
            }
        }
        _dialogClosing(event) {
            // chrome
            const dialogOverlay = document.querySelector('iron-overlay-backdrop[opened]');
            if (dialogOverlay && dialogOverlay.parentElement) {
                dialogOverlay.parentElement.removeChild(dialogOverlay);
            }
            const paths = event.path || [];
            if (paths.length) {
                if ((paths[0].tagName.toLowerCase().indexOf('dropdown') > -1) ||
                    (paths.filter((x) => x.tagName === 'CHIP-DISAGG-VALUE' || x.tagName === 'CHIP-DATE-OF-REPORT').length)) {
                    return;
                }
            }
            // edge
            if (event.__target && event.__target.is && event.__target.is.toLowerCase().indexOf('dropdown') > -1) {
                return;
            }
            this.$.drawer.style.zIndex = '1';
            const pageOverlay = this.$.pageOverlay;
            pageOverlay.style.zIndex = '';
            pageOverlay.classList.remove('opened');
        }
    }
    return OverlayHelperClass;
}
export default OverlayHelperMixin;
