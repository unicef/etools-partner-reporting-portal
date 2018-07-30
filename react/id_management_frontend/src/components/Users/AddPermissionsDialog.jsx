import React, {Component} from 'react';
import Dialog from "../common/Dialog";
import DialogActions from "../common/DialogActions";
import {Button} from "@material-ui/core";
import {FieldArray, reduxForm} from 'redux-form';
import renderPermissionsFields from "./renderPermissionsFields";
import labels from "../../labels";
import ButtonSubmit from "../common/ButtonSubmit";

const title = "Add permissions";

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
                title={title}
            >
                <form onSubmit={handleSubmit(this.onSubmit)} noValidate>
                    <FieldArray name="prp_roles" component={renderPermissionsFields}/>

                    <DialogActions>
                        <Button onClick={this.onClose}>{labels.cancel}</Button>
                        <ButtonSubmit/>
                    </DialogActions>
                </form>
            </Dialog>
        );
    }
}

export default reduxForm({form: "addPermissionsForm", initialValues: {prp_roles: [{}]}})(AddPermissionsDialog);