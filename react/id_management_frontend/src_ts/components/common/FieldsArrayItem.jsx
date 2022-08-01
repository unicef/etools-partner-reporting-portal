import PropTypes from 'prop-types'
import React, {Component} from 'react';
import {withStyles} from "@material-ui/core/styles";

const styleSheet = (theme) => ({
    item: {
        padding: theme.spacing.unit * 3,
        borderBottom: `1px solid ${theme.palette.grey[300]}`
    }
});

class FieldsArrayItem extends Component {
    render() {
        const {children, classes} = this.props;

        return (
            <div className={classes.item}>
                {children}
            </div>
        )
    }
}

FieldsArrayItem.propTypes = {
    children: PropTypes.any.isRequired,
    classes: PropTypes.object.isRequired
};

export default withStyles(styleSheet)(FieldsArrayItem);

