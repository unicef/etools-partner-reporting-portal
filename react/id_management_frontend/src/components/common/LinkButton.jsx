import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import classnames from "classnames";
import PropTypes from "prop-types";

const styleSheet = theme => ({
    button: {
        display: 'inline-block',
        margin: `0 ${theme.spacing.unit}px`,
        textDecoration: "underline",
        color: theme.palette.primary.main,
        cursor: 'pointer'
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

LinkButton.propTypes = {
    onClick: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    variant: PropTypes.oneOf(["danger"])
}

export default withStyles(styleSheet)(LinkButton);
