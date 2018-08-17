import React, {Component} from "react";
import {withStyles} from "@material-ui/core/styles";
import PlainButton from "./PlainButton";
import Delete from "@material-ui/icons/Delete";
import PropTypes from "prop-types";

const styleSheet = theme => ({
    icon: {
        color: theme.palette.grey[600]
    },
});

class DeleteButton extends Component {
    render() {
        const {onClick, classes} = this.props;

        return (
            <PlainButton onClick={onClick}><Delete className={classes.icon}/></PlainButton>
        );
    }
}

DeleteButton.propTypes = {
    classes: PropTypes.object.isRequired,
    onClick: PropTypes.func
};

export default withStyles(styleSheet)(DeleteButton);
