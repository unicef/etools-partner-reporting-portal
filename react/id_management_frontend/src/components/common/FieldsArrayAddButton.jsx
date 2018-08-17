import PropTypes from 'prop-types'
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

FieldsArrayPanel.propTypes = {
    classes: PropTypes.object.isRequired,
    onClick: PropTypes.func
};

export default withStyles(styleSheet)(FieldsArrayPanel);

