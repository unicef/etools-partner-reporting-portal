import React, { Component } from "react";
import { Button } from "@material-ui/core";

class ButtonClear extends Component {
    render() {
        const { onClick } = this.props;

        return (
            <Button color="primary" onClick={onClick}>
                Clear
            </Button>
        );
    }
}

export default ButtonClear;
