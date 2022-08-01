import PropTypes from 'prop-types'
import React, {Component} from "react";
import {Button} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";

const styleSheet = () => ({
    button: {
        minWidth: 0,
        padding: 0,
        "&:hover": {
            backgroundColor: "transparent"
        }
    },

});

class PlainButton extends Component {
    render() {
        const {children, classes, ...props} = this.props;

        return (
            <Button {...props} className={classes.button}>
                {children}
            </Button>
        );
    }
}

PlainButton.propTypes = {
    children: PropTypes.any.isRequired,
    classes: PropTypes.object.isRequired
};

export default withStyles(styleSheet)(PlainButton);

