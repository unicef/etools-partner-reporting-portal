import React, {Component} from 'react';
import Dialog from "../common/Dialog";
import DialogActions from "../common/DialogActions";
import {Button} from "@material-ui/core";
import {FieldArray, reduxForm} from 'redux-form';
import renderPermissionsFields from "./renderPermissionsFields";
import labels from "../../labels";
import ButtonSubmit from "../common/ButtonSubmit";
import {api} from "../../infrastructure/api";

const title = "Add permissions";

class AddPermissionsDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false
        };

        this.onClose = this.onClose.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit(values) {
        const {user: {id}, onSave} = this.props;

        let request = values;
        request.user_id = id;

        this.setState({loading: true});


        api.post("id-management/role-group/", request)
            .then(res => {
                onSave();
                this.onClose();
            })
            .finally(() => this.setState({loading: false}));
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
                loading={this.state.loading}
            >
                <form onSubmit={handleSubmit(this.onSubmit)} noValidate>
                    <FieldArray name="prp_roles" component={renderPermissionsFields}/>

                    <DialogActions>
                        <Button onClick={this.onClose}>{labels.cancel}</Button>
                        <ButtonSubmit loading={this.state.loading}/>
                    </DialogActions>
                </form>
            </Dialog>
        );
    }
}

export default reduxForm({form: "addPermissionsForm", initialValues: {prp_roles: [{}]}})(AddPermissionsDialog);