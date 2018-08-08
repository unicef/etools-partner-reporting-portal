import React, {Component} from 'react';
import Dialog from "../common/Dialog";
import DialogActions from "../common/DialogActions";
import {Button, Grid} from "@material-ui/core";
import {reduxForm} from 'redux-form';
import labels from "../../labels";
import {EDITABLE_PRP_ROLE_OPTIONS, PRP_ROLE} from "../../constants";
import TextFieldForm from "../form/TextFieldForm";
import SelectForm from "../form/SelectForm";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import ButtonSubmit from "../common/ButtonSubmit";
import {api} from "../../infrastructure/api";
import withPortal from "../hoc/withPortal";
import {getUserRole} from "../../helpers/user";
import {PORTALS} from "../../actions";

const title = "Edit permission";

class EditPermissionDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false
        };

        this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit(values) {
        const {permission: {id}, onSave, onClose} = this.props;

        this.setState({loading: true});

        api.patch(`id-management/role-group/${id}/`, {role: values.role})
            .then(res => {
                onClose();
                onSave();
            })
            .finally(() => this.setState({loading: false}));
    }

    render() {
        const {open, handleSubmit, onClose, roleOptions, portal} = this.props;

        return (
            <Dialog
                open={open}
                onClose={onClose}
                title={title}
                loading={this.state.loading}
            >
                <form onSubmit={handleSubmit(this.onSubmit)} noValidate>
                    <Grid container spacing={24}>
                        <Grid item md={6}>
                            {portal === PORTALS.IP &&
                            <TextFieldForm fieldName="workspace" label={labels.workspace} readOnly/>}

                            {portal === PORTALS.CLUSTER &&
                            <TextFieldForm fieldName="cluster" label={labels.cluster} readOnly/>}
                        </Grid>
                        <Grid item md={6}>
                            <SelectForm fieldName="role" label={labels.role}
                                        values={roleOptions}/>
                        </Grid>
                    </Grid>

                    <DialogActions>
                        <Button onClick={onClose}>{labels.cancel}</Button>
                        <ButtonSubmit loading={this.state.loading}/>
                    </DialogActions>
                </form>
            </Dialog>
        );
    }
}

EditPermissionDialog.propTypes = {
    permission: PropTypes.shape({
        workspace: PropTypes.any.isRequired,
        role: PropTypes.any.isRequired,
    })
};

const mapStateToProps = (state, ownProps) => {
    const userRole = getUserRole(state.user, ownProps.permission);

    return {
        roleOptions: EDITABLE_PRP_ROLE_OPTIONS[userRole],
        initialValues: {
            workspace: ownProps.permission.workspace ? ownProps.permission.workspace.title : null,
            role: ownProps.permission.role,
            cluster: ownProps.permission.cluster ? ownProps.permission.cluster.full_title : null
        }
    }
};

export default withPortal(connect(mapStateToProps)(reduxForm({
    form: "editPermissionForm",
    enableReinitialize: true
})(EditPermissionDialog)));