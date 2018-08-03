import React, {Component} from "react";
import {getLabels} from "../../labels";
import {withStyles} from "@material-ui/core/styles";
import Dialog from "../common/Dialog";
import TextFieldForm from "../form/TextFieldForm";
import {reduxForm} from "redux-form";
import {connect} from "react-redux";
import {getRoleLabel, getWorkspaceLabel} from "../../helpers/user";
import Grid from "@material-ui/core/Grid";
import withWorkspaceOptions from "../hoc/withWorkspaceOptions";

const title = "My Profile";

const labels = getLabels({
    myWorkspacesRoles: "My workspaces / roles"
});

const styleSheet = (theme) => ({});

class MyProfileDialog extends Component {
    constructor(props) {
        super(props);

        this.formatPrpRoles = this.formatPrpRoles.bind(this);
    }

    formatPrpRoles(prp_roles) {
        const {workspaceOptions} = this.props;

        const roles = prp_roles.map(role => `${getWorkspaceLabel(workspaceOptions, role.workspace)} / ${getRoleLabel(role.role)}`);

        return roles.length ? roles.join(", ") : '-';
    }

    render() {
        const {open, onClose, classes} = this.props;

        const textFieldProps = {
            disabled: true
        };

        return (
            <Dialog
                open={open}
                onClose={onClose}
                title={title}
            >
                <Grid container spacing={24}>
                    <Grid item xs={12}>
                        <TextFieldForm fieldName="first_name" label={labels.firstName} textFieldProps={textFieldProps}/>

                    </Grid>
                    <Grid item xs={12}>
                        <TextFieldForm fieldName="last_name" label={labels.lastName} textFieldProps={textFieldProps}/>

                    </Grid>
                    <Grid item xs={12}>
                        <TextFieldForm fieldName="email" label={labels.email} textFieldProps={textFieldProps}/>

                    </Grid>
                    <Grid item xs={12}>
                        <TextFieldForm fieldName="prp_roles" label={labels.myWorkspacesRoles}
                                       textFieldProps={textFieldProps} format={this.formatPrpRoles}/>
                    </Grid>
                    <Grid item xs={12}>
                        <TextFieldForm fieldName="partner" label={labels.partner} textFieldProps={textFieldProps}/>
                    </Grid>
                </Grid>
            </Dialog>
        );
    }
}

const mapStateToProps = (state) => {
    const {first_name, last_name, email, partner, prp_roles} = state.user;

    return {
        initialValues: {
            first_name,
            last_name,
            email,
            partner: partner.title,
            prp_roles
        }
    }
};

export default connect(mapStateToProps)(withWorkspaceOptions((reduxForm({form: "myProfile"})(withStyles(styleSheet)(MyProfileDialog)))));
