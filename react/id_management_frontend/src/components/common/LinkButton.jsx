import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import classnames from "classnames";

const styleSheet = theme => ({
    button: {
        display: 'inline-block',
        margin: `0 ${theme.spacing.unit}px`,
        textDecoration: "underline",
        color: theme.palette.primary.main
    },
    danger: {
        color: theme.palette.error.main
    }
});

class LinkButton extends Component {
    render() {
        const { classes, onClick, label, variant } = this.props;

        const className = classnames(
            classes.button,
            {
                [classes.danger]: variant === "danger"
            }
        );

        return (
            <div onClick={onClick} className={className}>
                {label}
            </div>
        );
    }
}

export default withStyles(styleSheet)(LinkButton);
