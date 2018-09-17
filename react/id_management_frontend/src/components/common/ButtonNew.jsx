import PropTypes from 'prop-types'
import React, {Component} from "react";
import {Button} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";
import {Add} from "@material-ui/icons";

const styleSheet = theme => ({
    icon: {
        marginRight: theme.spacing.unit,
        marginLeft: theme.spacing.unit * (-1),
        color: theme.palette.common.whiteAlpha
    }
});

class ButtonNew extends Component {
    render() {
        const {classes, onClick} = this.props;

        return (
            <Button variant="contained" color="primary" onClick={onClick}>
                <Add className={classes.icon}/> New
            </Button>
        );
    }
}

ButtonNew.propTypes = {
    classes: PropTypes.object,
    onClick: PropTypes.func
};

export default withStyles(styleSheet)(ButtonNew);
