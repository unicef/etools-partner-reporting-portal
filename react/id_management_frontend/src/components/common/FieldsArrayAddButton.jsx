import React, {Component} from 'react';
import {withStyles} from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";

const styleSheet = (theme) => ({
    button: {
        padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px`
    }
});

class FieldsArrayPanel extends Component {
    render() {
        const {classes, onClick} = this.props;

        return (
            <Button className={classes.button} color="primary" onClick={onClick}>+ ADD NEW</Button>
        )
    }
}

export default withStyles(styleSheet)(FieldsArrayPanel);