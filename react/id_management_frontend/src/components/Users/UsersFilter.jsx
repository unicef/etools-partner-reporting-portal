import PropTypes from 'prop-types'
import React, {Component} from "react";
import GreyPanel from "../common/GreyPanel";
import Grid from "@material-ui/core/Grid";
import FilterButtons from "../common/FilterButtons";
import {reduxForm} from 'redux-form';
import TextFieldForm from "../form/TextFieldForm";
import SelectForm from "../form/SelectForm";
import {PORTALS} from "../../actions";
import {connect} from "react-redux";
import labels from "../../labels";
import {PRP_ROLE_IP_OPTIONS, PRP_ROLE_CLUSTER_OPTIONS, PRP_ROLE} from "../../constants";
import withProps from "../hoc/withProps";
import {clusterOptions, workspaceOptions, partnerOptions, portal, user} from "../../helpers/props";
import {hasAnyRole} from "../../helpers/user";

const searchPlaceholder = "Name or Email";

class UsersFilter extends Component {
    componentDidUpdate(prevProps) {
        if (prevProps.portal !== this.props.portal) {
            this.props.reset();
        }
    }

    canFilterPartners() {
        const {user} = this.props;

        return hasAnyRole(user, [PRP_ROLE.CLUSTER_SYSTEM_ADMIN, PRP_ROLE.CLUSTER_IMO]);
    }

    render() {
        const {portal, workspaceOptions, clusterOptions, partnerOptions, onReset} = this.props;

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

                        {portal === PORTALS.CLUSTER && this.canFilterPartners() &&
                        <Grid item md={4}>
                            <SelectForm fieldName="partners" label={labels.partner} values={partnerOptions}
                                        optional multiple/>
                        </Grid>}

                        {portal === PORTALS.IP &&
                        <Grid item md={4}>
                            <SelectForm fieldName="workspaces" label={labels.workspace} values={workspaceOptions}
                                        optional multiple/>
                        </Grid>}

                        <Grid item md={4}>
                            <SelectForm fieldName="roles" label={labels.role} values={roleOptions}
                                        optional multiple/>
                        </Grid>

                        {portal === PORTALS.CLUSTER && <Grid item md={12}>
                            <SelectForm fieldName="clusters" label={labels.cluster} values={clusterOptions}
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
    user: PropTypes.object.isRequired,
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
    user
)(reduxForm({form: 'usersFilter', enableReinitialize: true})(UsersFilter)));

