import PropTypes from 'prop-types'
import React, {Component} from 'react';
import Dialog from "../common/Dialog";
import DialogActions from "../common/DialogActions";
import TextFieldForm from "../form/TextFieldForm";
import {Grid, Button} from "@material-ui/core";
import {email} from "../../helpers/validation";
import {reduxForm, formValueSelector} from 'redux-form';
import {api} from "../../infrastructure/api";
import {getLabels} from "../../labels";
import ButtonSubmit from "../common/ButtonSubmit";
import {EDITABLE_USER_TYPE_OPTIONS, PORTAL_TYPE, PRP_ROLE, USER_TYPE, USER_TYPE_OPTIONS} from "../../constants";
import SelectForm from "../form/SelectForm";
import {PORTALS} from "../../actions";
import withProps from "../hoc/withProps";
import {partnerOptions, portal, user} from "../../helpers/props";
import {connect} from "react-redux";
import {hasAnyRole} from "../../helpers/user";
import SearchSelectForm from "../form/SearchSelectForm";


const formName = "addUserForm";
const selector = formValueSelector(formName);

const labels = getLabels({
    title: "Add new user",
    caption: "Message with invitation will be send at provided e-mail address",
    position: "Position (optional)",
    saveAndContinue: "Save and continue",
});

export class AddUserDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false
        };

        this.onClose = this.onClose.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit(values) {
        const {onSave, portal, user_type} = this.props;

        this.setState({loading: true});

        return api.post("id-management/users/", values, {portal: PORTAL_TYPE[portal]})
            .then(res => {
                this.onClose();

                if (res && res.data) {
                    onSave(Object.assign({}, res.data, {user_type}));
                }
            })
            .finally(() => this.setState({loading: false}))
    }

    onClose() {
        const {reset, onClose} = this.props;

        onClose();
        reset();
    }

    render() {
        const {open, handleSubmit, portal, user_type, partnerOptions, user} = this.props;

        const userTypeOptions = hasAnyRole(user, [PRP_ROLE.CLUSTER_SYSTEM_ADMIN]) ?
            USER_TYPE_OPTIONS : EDITABLE_USER_TYPE_OPTIONS["RESTRICTED"];

        const submitLabel = user_type === USER_TYPE.CLUSTER_ADMIN ? labels.save : labels.saveAndContinue;

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
                            <SelectForm fieldName="user_type" label={labels.userType} values={userTypeOptions}/>
                        </Grid>}

                        {user_type === USER_TYPE.PARTNER &&
                        <Grid item md={6}>
                            <SearchSelectForm fieldName="partner" label={labels.partner} options={partnerOptions}/>
                        </Grid>}
                    </Grid>

                    <DialogActions>
                        <Button onClick={this.onClose}>{labels.cancel}</Button>
                        <ButtonSubmit loading={this.state.loading} label={submitLabel}/>
                    </DialogActions>
                </form>
            </Dialog>
        );
    }
}

AddUserDialog.propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    open: PropTypes.bool,
    partnerOptions: PropTypes.array,
    portal: PropTypes.string,
    reset: PropTypes.func.isRequired,
    user: PropTypes.object,
    user_type: PropTypes.string
};

const mapStateToProps = (state) => {
    return {
        user_type: selector(state, "user_type")
    }
};

export default connect(mapStateToProps)(withProps(portal, partnerOptions, user)(reduxForm({form: formName})(AddUserDialog)));

