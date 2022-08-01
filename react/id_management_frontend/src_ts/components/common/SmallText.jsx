import React, {Component} from "react";
import {withStyles} from "@material-ui/core/styles";
import {Typography} from "@material-ui/core";
import PropTypes from "prop-types";

const styleSheet = () => ({
    text: {
        display: "inline-block",
    },
    block: {
        display: "block"
    }
});

class SmallText extends Component {
    render() {
        const {children, classes, block, label, gutterBottom} = this.props;

        return (
            <Typography variant="caption"
                        color={!label ? "inherit" : "default"}
                        className={block ? classes.block : classes.text} gutterBottom={gutterBottom}>
                {children}
            </Typography>
        );
    }
}

SmallText.propTypes = {
    block: PropTypes.bool,
    label: PropTypes.bool,
    gutterBottom: PropTypes.bool,
    children: PropTypes.node.isRequired,
    classes: PropTypes.object.isRequired
};

export default withStyles(styleSheet)(SmallText);
