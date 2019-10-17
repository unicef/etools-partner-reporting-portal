import PropTypes from 'prop-types'
import React, {Component} from 'react';
import Dialog from "../common/Dialog";
import DialogActions from "../common/DialogActions";
import {Button, Typography} from "@material-ui/core";
import {FieldArray, reduxForm} from 'redux-form';
import renderPermissionsFields from "./renderPermissionsFields";
import labels from "../../labels";
import ButtonSubmit from "../common/ButtonSubmit";
import {api} from "../../infrastructure/api";
import {fetch, FETCH_OPTIONS} from "../../fetch";
import {connect} from "react-redux";

const title = "Add permissions";

export class AddPermissionsDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false
        };

        this.onClose = this.onClose.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        props.dispatchFetchClustersForPartner(props.user.partner.id)
    }

    onSubmit(values) {
        const {user: {id}, onSave} = this.props;

        let request = values;
        request.user_id = id;

        this.setState({loading: true});

        return api.post("id-management/role-group/", request)
            .then(() => {
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
        const {open, handleSubmit, error, user, width} = this.props;

        return (
            <Dialog
                open={open}
                onClose={this.onClose}
                title={title}
                loading={this.state.loading}
                width={width}
            >
                <form onSubmit={handleSubmit(this.onSubmit)} noValidate>
                    <FieldArray name="prp_roles" props={{selectedUser: user}} component={renderPermissionsFields}/>

                    {error && <Typography color="error" variant="body2">{error}</Typography>}

                    <DialogActions>
                        <Button onClick={this.onClose}>{labels.cancel}</Button>
                        <ButtonSubmit loading={this.state.loading}/>
                    </DialogActions>
                </form>
            </Dialog>
        );
    }
}

const mapStateToProps = (state) => {
    return {
    }
};

const mapDispatchToProps = dispatch => {
    return {
        dispatchFetchClustersForPartner: (partner_id) => dispatch(fetch(FETCH_OPTIONS.CLUSTERS_FOR_PARTNER, partner_id)),
    }
};

AddPermissionsDialog.propTypes = {
    error: PropTypes.string,
    handleSubmit: PropTypes.func.isRequired,
    dispatchFetchClustersForPartner: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    open: PropTypes.bool,
    reset: PropTypes.func.isRequired,
    user: PropTypes.object,
    width: PropTypes.string
};

export default connect(mapStateToProps, mapDispatchToProps)(reduxForm({
    form: "addPermissionsForm",
    initialValues: {prp_roles: [{}]}
})(AddPermissionsDialog));

