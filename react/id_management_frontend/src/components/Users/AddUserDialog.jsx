import React, {Component} from 'react';
import Dialog from "../common/Dialog";
import DialogActions from "../common/DialogActions";
import TextFieldForm from "../form/TextFieldForm";
import {Grid, Button} from "@material-ui/core";
import {email} from "../../helpers/validation";
import {reduxForm} from 'redux-form';
import {api} from "../../infrastructure/api";
import {getLabels} from "../../labels";

const labels = getLabels({
    title: "Add new user",
    caption: "Message with invitation will be send at provided e-mail address",
    position: "Position (optional)",
    saveAndContinue: "Save and continue"
});

class AddUserDialog extends Component {
    constructor(props) {
        super(props);

        this.onClose = this.onClose.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit(values) {
        const {onSave} = this.props;

        return api.post("id-management/users/", values)
            .then(res => {
                this.onClose();
                onSave(res.data);
            })
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
                caption={labels.caption}
            >
                <form onSubmit={handleSubmit(this.onSubmit)} noValidate>
                    <Grid container spacing={24}>
                        <Grid item md={6}>
                            <TextFieldForm fieldName="first_name" label={labels.firstName}/>
                        </Grid>
                        <Grid item md={6}>
                            <TextFieldForm fieldName="last_name" label={labels.lastName}/>
                        </Grid>
                        <Grid item md={6}>
                            <TextFieldForm fieldName="email" label={labels.email} validation={[email]}/>
                        </Grid>
                        <Grid item md={6}>
                            <TextFieldForm fieldName="position" label={labels.position} optional/>
                        </Grid>
                    </Grid>

                    <DialogActions>
                        <Button onClick={this.onClose}>{labels.cancel}</Button>
                        <Button type="submit" variant="contained" color="primary">{labels.saveAndContinue}</Button>
                    </DialogActions>
                </form>
            </Dialog>
        );
    }
}

export default reduxForm({form: "addUserForm"})(AddUserDialog);