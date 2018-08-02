import React, {Component} from "react";
import {withStyles} from "@material-ui/core/styles";
import {Typography} from "../../../node_modules/@material-ui/core";

const styleSheet = theme => ({
    text: {
        fontSize: 12,
        lineHeight: '24px',
        display: "inline-block",
    }
});

class UserRowExpandedText extends Component {
    render() {
        const {children, classes} = this.props;

        return (
            <Typography className={classes.text}>{children}</Typography>
        );
    }
}

export default withStyles(styleSheet)(UserRowExpandedText);
