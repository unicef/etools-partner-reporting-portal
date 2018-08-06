import React, {Component} from "react";
import GreyPanel from "../common/GreyPanel";
import Grid from "@material-ui/core/Grid";
import FilterButtons from "../common/FilterButtons";
import {reduxForm} from 'redux-form';
import TextFieldForm from "../form/TextFieldForm";
import SelectForm from "../form/SelectForm";
import withPortal from "../hoc/withPortal";
import {PORTALS} from "../../actions";
import { connect } from "react-redux";
import labels from "../../labels";
import {PRP_ROLE_IP_OPTIONS, PRP_ROLE_CLUSTER_OPTIONS} from "../../constants";
import withWorkspaceOptions from "../hoc/withWorkspaceOptions";
import withClusterOptions from "../hoc/withClusterOptions";

const searchPlaceholder = "Name or Email";

const partnerOptions = [
    {
        label: "Partner 1",
        value: 1
    },
    {
        label: "Partner 2",
        value: 2
    }
];

class UsersFilter extends Component {
    componentDidUpdate(prevProps) {
        if (prevProps.portal !== this.props.portal) {
            this.props.reset();
        }
    }

    reset() {
        const {destroy, initialize} = this.props;

        destroy();
        initialize({});
    }

    render() {
        const {portal, workspaceOptions, clusterOptions} = this.props;

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

                        {portal === PORTALS.CLUSTER &&
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

                    <FilterButtons onClear={() => this.reset()}/>
                </form>
            </GreyPanel>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        initialValues: ownProps.initialValues
    }
};

export default connect(mapStateToProps)(reduxForm({form: 'usersFilter'})(withClusterOptions(withWorkspaceOptions(withPortal(UsersFilter)))));
