import React, {Component} from "react";
import {Button} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";

const styleSheet = theme => ({
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

export default withStyles(styleSheet)(PlainButton);
