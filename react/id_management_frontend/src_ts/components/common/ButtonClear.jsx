import React, {Component} from "react";
import {Button} from "@material-ui/core";
import PropTypes from "prop-types";

class ButtonClear extends Component {
    render() {
        const {onClick} = this.props;

        return (
            <Button color="primary" onClick={onClick}>
                Clear
            </Button>
        );
    }
}

ButtonClear.propTypes = {
    onClick: PropTypes.func
};

export default ButtonClear;
