import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import grey from "@material-ui/core/colors/grey";
import { Person, ArrowDropDown } from "@material-ui/icons";
import { Button } from "@material-ui/core";

const styleSheet = {
    button: {
        color: grey[400],
        margin: "0 20px"
    },
    arrow: {
        color: grey[500]
    }
};

class ProfileButton extends Component {
    render() {
        const { classes, onClick } = this.props;

        return (
            <Button className={classes.button} onClick={onClick}>
                <Person />
                <ArrowDropDown className={classes.arrow} />
            </Button>
        );
    }
}

export default withStyles(styleSheet)(ProfileButton);
