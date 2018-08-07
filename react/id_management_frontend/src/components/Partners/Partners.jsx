import React, {Component} from 'react';
import PageHeader from "../common/PageHeader";
import ButtonNew from "../common/ButtonNew";
import withDialogHandling from "../hoc/withDialogHandling";
import AddPartnerDialog from "./AddPartnerDialog";
import {api} from "../../infrastructure/api";
import {options} from "../../actions";
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
            initialLoading: true
        };

        api.options("id-management/partners/")
            .then(res => {
                props.dispatchOptions(res.data, [
                    "shared_partner",
                    "partner_type",
                    "cso_type"
                ]);
            })
            .finally(() => {this.setState({initialLoading: false})});
    }

    render() {
        const {dialogOpen, handleDialogOpen, handleDialogClose, filterChange, getQuery, listProps} = this.props;

        if (this.state.initialLoading) {
            return null;
        }

        return (
            <div>
                <PageHeader>
                    {header} <ButtonNew onClick={() => handleDialogOpen('addPartner')}/>
                </PageHeader>

                <PageContent>
                    <PartnersFilter onChange={filterChange} initialValues={getQuery()}/>
                    <PartnersList {...listProps}/>
                </PageContent>

                <AddPartnerDialog open={dialogOpen.addPartner} onClose={handleDialogClose}/>
            </div>
        )
    }
}

const mapDispatchToProps = dispatch => {
    return {
        dispatchOptions: (data, fields) => dispatch(options(data, fields))
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

export default withSearch(getData)(connect(null, mapDispatchToProps)(withDialogHandling(Partners)));