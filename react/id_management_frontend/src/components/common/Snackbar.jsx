import React, {Component} from "react";
import SnackbarContentWrapper from "./SnackbarContentWrapper";
import MSnackbar from "@material-ui/core/Snackbar";

class Snackbar extends Component {
    render() {
        const {variant, message, open, onClose} = this.props;

        return (
            <div>
                <MSnackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    open={open}
                    autoHideDuration={6000}
                    onClose={onClose}
                >
                    <SnackbarContentWrapper
                        onClose={onClose}
                        variant={variant}
                        message={message}
                    />
                </MSnackbar>
            </div>
        );
    }
}

export default Snackbar;