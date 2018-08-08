import React, {Component} from 'react';
import Dialog from "../common/Dialog";
import DialogActions from "../common/DialogActions";
import TextFieldForm from "../form/TextFieldForm";
import {Grid, Button} from "@material-ui/core";
import {email} from "../../helpers/validation";
import {reduxForm} from 'redux-form';
import {api} from "../../infrastructure/api";
import {getLabels} from "../../labels";
import ButtonSubmit from "../common/ButtonSubmit";
import {PORTAL_TYPE, USER_TYPE_OPTIONS} from "../../constants";
import withPortal from "../hoc/withPortal";
import SelectForm from "../form/SelectForm";
import {PORTALS} from "../../actions";

const labels = getLabels({
    title: "Add new user",
    caption: "Message with invitation will be send at provided e-mail address",
    position: "Position (optional)",
    saveAndContinue: "Save and continue",
});

class AddUserDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false
        };

        this.onClose = this.onClose.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit(values) {
        const {onSave, portal} = this.props;

        let request = values;

        request.portal = PORTAL_TYPE[portal];

        this.setState({loading: true});

        return api.post("id-management/users/", request)
            .then(res => {
                this.onClose();
                onSave(res.data);
            })
            .finally(() => this.setState({loading: false}))
    }

    onClose() {
        const {reset, onClose} = this.props;

        onClose();
        reset();
    }

    render() {
        const {open, handleSubmit, portal} = this.props;

        return (
            <Dialog
                open={open}
                onClose={this.onClose}
                title={labels.title}
                caption={labels.caption}
                loading={this.state.loading}
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

                        {portal === PORTALS.CLUSTER &&
                        <Grid item md={6}>
                            <SelectForm fieldName="user_type" label={labels.userType} values={USER_TYPE_OPTIONS}/>
                        </Grid>}
                    </Grid>

                    <DialogActions>
                        <Button onClick={this.onClose}>{labels.cancel}</Button>
                        <ButtonSubmit loading={this.state.loading} label={labels.saveAndContinue}/>
                    </DialogActions>
                </form>
            </Dialog>
        );
    }
}

export default withPortal(reduxForm({form: "addUserForm"})(AddUserDialog));