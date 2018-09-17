import React, {Component} from "react";
import Dialog from "./Dialog";
import labels from "../../labels";
import DialogActions from "./DialogActions";
import {Button, Typography} from "@material-ui/core";
import PropTypes from 'prop-types';
import {withStyles} from "@material-ui/core/styles";

const title = "Confirm";
const confirmLabel = "Yes, I confirm";

const styleSheet = (theme) => ({
    text: {
        color: theme.palette.grey[600]
    }
});

class ConfirmDialog extends Component {
    render() {
        const {open, onConfirm, onClose, message, classes} = this.props;

        return (
            <Dialog
                open={open}
                onClose={onClose}
                title={title}
            >
                <Typography variant="subheading" className={classes.text}>
                    {message}
                </Typography>

                <DialogActions>
                    <Button onClick={onClose}>{labels.cancel}</Button>
                    <Button variant="contained" color="primary" onClick={onConfirm}>{confirmLabel}</Button>
                </DialogActions>
            </Dialog>
        );
    }
}

ConfirmDialog.propTypes = {
    classes: PropTypes.object.isRequired,
    message: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    open: PropTypes.bool
};

export default withStyles(styleSheet)(ConfirmDialog);
