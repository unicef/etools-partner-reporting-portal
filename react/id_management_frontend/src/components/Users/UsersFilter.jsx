import PropTypes from 'prop-types'
import React, {Component} from "react";
import GreyPanel from "../common/GreyPanel";
import Grid from "@material-ui/core/Grid";
import FilterButtons from "../common/FilterButtons";
import {reduxForm} from 'redux-form';
import TextFieldForm from "../form/TextFieldForm";
import {PORTALS} from "../../actions";
import {connect} from "react-redux";
import labels from "../../labels";
import {PRP_ROLE_IP_OPTIONS, PRP_ROLE_CLUSTER_OPTIONS, USER_STATUS_OPTIONS} from "../../constants";
import withProps from "../hoc/withProps";
import {clusterOptions, workspaceOptions, partnerOptions, portal, permissions} from "../../helpers/props";
import SearchSelectForm from "../form/SearchSelectForm";

const searchPlaceholder = "Name or Email";

class UsersFilter extends Component {
    componentDidUpdate(prevProps) {
        if (prevProps.portal !== this.props.portal) {
            this.props.reset();
        }
    }

    render() {
        const {portal, workspaceOptions, clusterOptions, partnerOptions, onReset, permissions} = this.props;

        const roleOptions = portal === PORTALS.CLUSTER ? PRP_ROLE_CLUSTER_OPTIONS : PRP_ROLE_IP_OPTIONS;

        return (
            <GreyPanel>
                <form noValidate>
                    <Grid container spacing={24}>
                        <Grid item md={4}>
                            <TextFieldForm fieldName="name_email" label={labels.search}
                                           placeholder={searchPlaceholder}
                                           margin="none" optional/>
                        </Grid>

                        {portal === PORTALS.CLUSTER && permissions.filterPartners &&
                        <Grid item md={4}>
                            <SearchSelectForm fieldName="partners" label={labels.partner} options={partnerOptions}
                                              optional multiple/>
                        </Grid>}

                        {portal === PORTALS.IP &&
                        <Grid item md={4}>
                            <SearchSelectForm fieldName="workspaces" label={labels.workspace} options={workspaceOptions}
                                              optional multiple/>
                        </Grid>}

                        <Grid item md={4}>
                            <SearchSelectForm fieldName="roles" label={labels.role} options={roleOptions}
                                              optional multiple/>
                        </Grid>

                        <Grid item md={4}>
                            <SearchSelectForm fieldName="status" label={labels.status} options={USER_STATUS_OPTIONS}
                                              optional multiple/>
                        </Grid>

                        {portal === PORTALS.CLUSTER && <Grid item md={12}>
                            <SearchSelectForm fieldName="clusters" label={labels.cluster} options={clusterOptions}
                                              optional multiple/>
                        </Grid>}
                    </Grid>

                    <FilterButtons onClear={onReset}/>
                </form>
            </GreyPanel>
        );
    }
}

UsersFilter.propTypes = {
    clusterOptions: PropTypes.array,
    onReset: PropTypes.func.isRequired,
    partnerOptions: PropTypes.array,
    portal: PropTypes.string,
    reset: PropTypes.func.isRequired,
    permissions: PropTypes.object.isRequired,
    workspaceOptions: PropTypes.array
};

const mapStateToProps = (state, ownProps) => {
    return {
        initialValues: ownProps.initialValues
    }
};

export default connect(mapStateToProps)(withProps(
    clusterOptions,
    workspaceOptions,
    partnerOptions,
    portal,
    permissions
)(reduxForm({form: 'usersFilter', enableReinitialize: true})(UsersFilter)));

