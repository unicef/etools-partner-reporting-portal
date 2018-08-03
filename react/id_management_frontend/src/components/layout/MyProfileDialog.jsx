import React, {Component} from "react";
import {getLabels} from "../../labels";
import Dialog from "../common/Dialog";
import TextFieldForm from "../form/TextFieldForm";
import {reduxForm} from "redux-form";
import {connect} from "react-redux";
import {getRoleLabel, getWorkspaceLabel} from "../../helpers/user";
import Grid from "@material-ui/core/Grid";
import withWorkspaceOptions from "../hoc/withWorkspaceOptions";

const title = "My Profile";

const labels = getLabels({
    myRoles: "My roles"
});

class MyProfileDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            roleLabel: ''
        };

        this.formatPrpRoles = this.formatPrpRoles.bind(this);
    }

    formatPrpRoles(prp_roles) {
        const {workspaceOptions} = this.props;

        const _role = prp_roles.filter(item => !item.workspace && !item.cluster);
        let result = _role.length ? getRoleLabel(_role[0].role) : null;

        if (!result) {
            const workspaceRoles = prp_roles.filter(role => !!role.workspace);
            const roles = workspaceRoles.map(role => `${getWorkspaceLabel(workspaceOptions, role.workspace)} / ${getRoleLabel(role.role)}`);

            result = roles.length ? roles.join(", ") : '-';
        }

        return result;
    }

    render() {
        const {open, onClose} = this.props;

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
                        <TextFieldForm fieldName="prp_roles" label={labels.myRoles}
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
            partner: partner ? partner.title : '-',
            prp_roles
        }
    }
};

export default connect(mapStateToProps)(withWorkspaceOptions((reduxForm({form: "myProfile"})(MyProfileDialog))));
