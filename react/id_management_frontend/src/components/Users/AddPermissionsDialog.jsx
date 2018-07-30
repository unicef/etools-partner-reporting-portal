import React, {Component} from 'react';
import Dialog from "../common/Dialog";
import DialogActions from "../common/DialogActions";
import {Button} from "@material-ui/core";
import {FieldArray, reduxForm} from 'redux-form';
import renderPermissionsFields from "./renderPermissionsFields";

const labels = {
    title: "Add permissions",
    label: "Role per Workspace",
    workspace: "Workspace",
    role: "Role",
    addNew: "Add new",
    cancel: "Cancel",
    save: "Save"
};

class AddPermissionsDialog extends Component {
    constructor(props) {
        super(props);

        this.onClose = this.onClose.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit(values) {
        console.log(values);
    }

    onClose() {
        const {reset, onClose} = this.props;

        onClose();
        reset();
    }

    render() {
        const {open, handleSubmit} = this.props;

        return (
            <Dialog
                open={open}
                onClose={this.onClose}
                title={labels.title}
            >
                <form onSubmit={handleSubmit(this.onSubmit)} noValidate>
                    <FieldArray name="prp_roles" component={renderPermissionsFields}/>

                    <DialogActions>
                        <Button onClick={this.onClose}>{labels.cancel}</Button>
                        <Button type="submit" variant="contained" color="primary">{labels.save}</Button>
                    </DialogActions>
                </form>
            </Dialog>
        );
    }
}

export default reduxForm({form: "addUserForm", initialValues: {prp_roles: [{}]}})(AddPermissionsDialog);