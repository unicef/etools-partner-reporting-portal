import PropTypes from 'prop-types'
import React, {Component} from 'react';
import PageHeader from "../common/PageHeader";
import ButtonNew from "../common/ButtonNew";
import withDialogHandling from "../hoc/withDialogHandling";
import PartnerDialog from "./PartnerDialog";
import {api} from "../../infrastructure/api";
import {connect} from "react-redux";
import PageContent from "../common/PageContent";
import PartnersFilter from "./PartnersFilter";
import withSearch from "../hoc/withSearch";
import PartnersList from "./PartnersList";
import {append_partner} from '../../actions';
import {FETCH_OPTIONS, fetch, fetchInvalidate} from "../../fetch";

const header = "Partners";

class Partners extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedPartner: null
        };

        this.onEdit = this.onEdit.bind(this);
        this.onAdd = this.onAdd.bind(this);
        this.onSave = this.onSave.bind(this);
        this.openPartnerDialog = this.openPartnerDialog.bind(this);
        this.fetchPartnerDetailsForRows = this.fetchPartnerDetailsForRows.bind(this);
        this.fetchPartnerDetails = this.fetchPartnerDetails.bind(this);

        props.dispatchFetchOptions()
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

    onSave(responseData) {
        const {dispatchInvalidatePartnerDetails, dispatchAppendPartner, resetExpandedRows, reload, handleDialogClose} = this.props;

        handleDialogClose();

        if (this.state.selectedPartner) {
            const id = this.state.selectedPartner.id;

            this.setState({selectedPartner: null});

            dispatchInvalidatePartnerDetails(id);
            resetExpandedRows();
        } else {
            const { id, title, ocha_external_id } = responseData;
            const newPartner = {
                id,
                title,
                ocha_external_id
            }
            dispatchAppendPartner(newPartner)
        }

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
        const {dialogOpen, handleDialogClose, filterChange, getQuery, listProps, optionsLoading} = this.props;

        if (optionsLoading) {
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
        expandedRowIds: state.expandedRowIds,
        optionsLoading: state.fetch.pending[FETCH_OPTIONS.PARTNERS_OPTIONS]
    }
};

const mapDispatchToProps = dispatch => {
    return {
        dispatchFetchOptions: () => dispatch(fetch(FETCH_OPTIONS.PARTNERS_OPTIONS)),
        dispatchAppendPartner: (data) => dispatch(append_partner(data)),
        dispatchFetchPartnerDetails: (id) => dispatch(fetch(FETCH_OPTIONS.PARTNER_DETAILS, id)),
        dispatchInvalidatePartnerDetails: (id) => dispatch(fetchInvalidate(FETCH_OPTIONS.PARTNER_DETAILS, id))
    }
};

const getData = (request) => (
    new Promise((resolve) => {
        api.get("id-management/partners/", request)
            .then(res => {
                resolve(res.data);
            });
    })
);

Partners.propTypes = {
    dialogOpen: PropTypes.object.isRequired,
    dispatchFetchOptions: PropTypes.func.isRequired,
    dispatchFetchPartnerDetails: PropTypes.func.isRequired,
    dispatchInvalidatePartnerDetails: PropTypes.func.isRequired,
    dispatchAppendPartner: PropTypes.func.isRequired,
    expandedRowIds: PropTypes.array.isRequired,
    filterChange: PropTypes.func,
    getQuery: PropTypes.func.isRequired,
    handleDialogClose: PropTypes.func.isRequired,
    handleDialogOpen: PropTypes.func.isRequired,
    listProps: PropTypes.object.isRequired,
    optionsLoading: PropTypes.bool,
    reload: PropTypes.func.isRequired
};

export default withSearch(getData)(connect(mapStateToProps, mapDispatchToProps)(withDialogHandling(Partners)));

