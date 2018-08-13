import React, {Component} from "react";
import {getLabels} from "../../labels";
import Dialog from "../common/Dialog";
import TextFieldForm from "../form/TextFieldForm";
import {reduxForm} from "redux-form";
import {connect} from "react-redux";
import {getLabelFromOptions, getRoleLabel} from "../../helpers/user";
import Grid from "@material-ui/core/Grid";
import withProps from "../hoc/withProps";
import {clusterOptions, workspaceOptions} from "../../helpers/props";

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
        const {workspaceOptions, clusterOptions} = this.props;

        const roles = prp_roles.map(item => {
            let result = "";

            if (item.cluster) {
                result += getLabelFromOptions(clusterOptions, item.cluster);
            }
            else if (item.workspace) {
                result += getLabelFromOptions(workspaceOptions, item.workspace);
            }

            if (result) {
                result += " / ";
            }

            return result + getRoleLabel(item.role);
        });

        return roles.length ? roles.join(", ") : '-';
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

export default connect(mapStateToProps)(withProps(workspaceOptions, clusterOptions)((reduxForm({form: "myProfile"})(MyProfileDialog))));
