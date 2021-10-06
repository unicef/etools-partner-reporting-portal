/**
 * @polymer
 * @mixinFunction
 */
function DataTableMixin(baseClass) {
    class DataTableClass extends baseClass {
        _pageSizeChanged(e) {
            const change = {
                page_size: e.detail.value
            };
            // @ts-ignore
            if (this._pageNumberInitialized) {
                change.page = 1;
            }
            // @ts-ignore
            this.set('queryParams', Object.assign({}, this.queryParams, change));
        }
        _colapseExpandedDetails() {
            setTimeout(() => {
                // @ts-ignore
                const openedDetails = this.openedDetails || [];
                if (openedDetails.length > 0) {
                    const tempList = openedDetails.slice();
                    tempList.forEach((detail) => detail.detailsOpened = false);
                }
            }, 100);
        }
        _pageNumberChanged(e) {
            this._colapseExpandedDetails();
            // @ts-ignore
            this.set('queryParams', Object.assign({}, this.queryParams, {
                page: e.detail.value
            }));
            setTimeout(() => {
                this.set('_pageNumberInitialized', true);
            });
        }
    }
    return DataTableClass;
}
export default DataTableMixin;
