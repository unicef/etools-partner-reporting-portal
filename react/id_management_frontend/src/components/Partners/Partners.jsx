import React, {Component} from 'react';
import PageHeader from "../common/PageHeader";
import ButtonNew from "../common/ButtonNew";
import withDialogHandling from "../hoc/withDialogHandling";
import PartnerDialog from "./PartnerDialog";
import {api} from "../../infrastructure/api";
import {fetchPartnerDetails, invalidatePartnerDetails, options} from "../../actions";
import {connect} from "react-redux";
import PageContent from "../common/PageContent";
import PartnersFilter from "./PartnersFilter";
import withSearch from "../hoc/withSearch";
import PartnersList from "./PartnersList";

const header = "Partners";

class Partners extends Component {
    constructor(props) {
        super(props);

        this.state = {
            initialLoading: true,
            selectedPartner: null
        };

        this.onEdit = this.onEdit.bind(this);
        this.onAdd = this.onAdd.bind(this);
        this.onSave = this.onSave.bind(this);
        this.openPartnerDialog = this.openPartnerDialog.bind(this);
        this.fetchPartnerDetailsForRows = this.fetchPartnerDetailsForRows.bind(this);
        this.fetchPartnerDetails = this.fetchPartnerDetails.bind(this);

        api.options("id-management/partners/")
            .then(res => {
                props.dispatchOptions(res.data, [
                    "shared_partner",
                    "partner_type",
                    "cso_type"
                ]);
            })
            .finally(() => {
                this.setState({initialLoading: false})
            });
    }

    fetchPartnerDetails(id) {
        const {dispatchFetchPartnerDetails} = this.props;
        dispatchFetchPartnerDetails(id);
    }

    onEdit(row) {
        this.fetchPartnerDetails(row.id);
        this.setState({selectedPartner: row});
        this.openPartnerDialog();
    }

    onSave() {
        const {dispatchInvalidatePartnerDetails, expandedRowIds, reload} = this.props;
        dispatchInvalidatePartnerDetails(this.state.selectedPartner.id);
        this.fetchPartnerDetailsForRows(expandedRowIds);
        reload();
    }

    onAdd() {
        this.setState({selectedPartner: null});
        this.openPartnerDialog();
    }

    openPartnerDialog() {
        const {handleDialogOpen} = this.props;
        handleDialogOpen('addPartner');
    }

    fetchPartnerDetailsForRows(ids) {
        const {listProps: {data: {results}}} = this.props;

        ids.forEach(idx => {
            this.fetchPartnerDetails(results[idx].id)
        });
    }

    render() {
        const {dialogOpen, handleDialogClose, filterChange, getQuery, listProps} = this.props;

        if (this.state.initialLoading) {
            return null;
        }

        return (
            <div>
                <PageHeader>
                    {header} <ButtonNew onClick={this.onAdd}/>
                </PageHeader>

                <PageContent>
                    <PartnersFilter onChange={filterChange} initialValues={getQuery()}/>
                    <PartnersList {...listProps} onEdit={this.onEdit}
                                  onExpandedRowIdsChange={this.fetchPartnerDetailsForRows}/>
                </PageContent>

                <PartnerDialog open={dialogOpen.addPartner} partner={this.state.selectedPartner}
                               onClose={handleDialogClose} onSave={this.onSave}/>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        expandedRowIds: state.expandedRowIds
    }
};

const mapDispatchToProps = dispatch => {
    return {
        dispatchOptions: (data, fields) => dispatch(options(data, fields)),
        dispatchFetchPartnerDetails: (id) => dispatch(fetchPartnerDetails(id)),
        dispatchInvalidatePartnerDetails: (id) => dispatch(invalidatePartnerDetails(id))
    }
};

const getData = (request) => (
    new Promise((resolve, reject) => {
        api.get("id-management/partners/", request)
            .then(res => {
                resolve(res.data);
            });
    })
);

export default withSearch(getData)(connect(mapStateToProps, mapDispatchToProps)(withDialogHandling(Partners)));