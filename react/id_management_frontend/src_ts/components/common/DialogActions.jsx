import PropTypes from 'prop-types'
import React, {Component} from 'react';
import {DialogActions as MDialogActions} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";

const styleSheet = (theme) => ({
    actions: {
        marginTop: theme.spacing.unit * 3
    }
});

class DialogActions extends Component {
    render() {
        const {classes, children} = this.props;

        return (
            <MDialogActions className={classes.actions}>
                {children}
            </MDialogActions>
        );
    }
}

DialogActions.propTypes = {
    children: PropTypes.any.isRequired,
    classes: PropTypes.object.isRequired
};

export default withStyles(styleSheet)(DialogActions);

