import React, {Component} from 'react';
import Dialog from "../common/Dialog";
import DialogActions from "../common/DialogActions";
import {Button, Grid} from "@material-ui/core";
import {reduxForm} from 'redux-form';
import labels from "../../labels";
import {PRP_ROLE_OPTIONS} from "../../constants";
import TextFieldForm from "../form/TextFieldForm";
import SelectForm from "../form/SelectForm";
import {connect} from "react-redux";
import PropTypes from "prop-types";

const title = "Edit permission";

class EditPermissionDialog extends Component {
    constructor(props) {
        super(props);

        this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit(values) {
        console.log(values);
    }

    render() {
        const {open, handleSubmit, onClose} = this.props;

        return (
            <Dialog
                open={open}
                onClose={onClose}
                title={title}
            >
                <form onSubmit={handleSubmit(this.onSubmit)} noValidate>
                    <Grid container spacing={24}>
                        <Grid item md={6}>
                            <TextFieldForm fieldName="workspace" label={labels.workspace} readOnly/>
                        </Grid>
                        <Grid item md={6}>
                            <SelectForm fieldName="role" label={labels.role}
                                        values={PRP_ROLE_OPTIONS}/>
                        </Grid>
                    </Grid>

                    <DialogActions>
                        <Button onClick={onClose}>{labels.cancel}</Button>
                        <Button type="submit" variant="contained" color="primary">{labels.save}</Button>
                    </DialogActions>
                </form>
            </Dialog>
        );
    }
}

EditPermissionDialog.propTypes = {
    user: PropTypes.object.isRequired,
    permission: PropTypes.shape({
        workspace: PropTypes.any.isRequired,
        role: PropTypes.any.isRequired,
    })
};

const mapStateToProps = (state, ownProps) => {
    return {
        initialValues: {
            workspace: ownProps.permission.workspace,
            role: ownProps.permission.role
        }
    }
};

export default connect(mapStateToProps)(reduxForm({form: "editPermissionForm"})(EditPermissionDialog));