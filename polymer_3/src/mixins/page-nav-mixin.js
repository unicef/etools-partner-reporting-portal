/**
 * @polymer
 * @mixinFunction
 */
function PageNavMixin(baseClass) {
    class PageNavClass extends baseClass {
        static get observers() {
            return ['_selectedChanged(selected)'];
        }
        // @ts-ignore
        _selectedChanged(selected) {
            const self = this;
            setTimeout(function () {
                const normalMenuItemOpened = self.shadowRoot.querySelectorAll(".nav-menu-item.iron-selected").length > 0;
                // @ts-ignore
                self.subMenuOpened = !normalMenuItemOpened;
            }, 200);
        }
    }
    return PageNavClass;
}
export default PageNavMixin;
