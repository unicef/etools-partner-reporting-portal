import PropTypes from 'prop-types'
import React, {Component} from 'react';
import {withStyles} from "@material-ui/core/styles";

const styleSheet = (theme) => ({
    panel: {
        backgroundColor: theme.palette.grey[100],
    }
});

class FieldsArrayPanel extends Component {
    render() {
        const {children, classes} = this.props;

        return (
            <div className={classes.panel}>
                {children}
            </div>
        )
    }
}

FieldsArrayPanel.propTypes = {
    children: PropTypes.any.isRequired,
    classes: PropTypes.object.isRequired
};

export default withStyles(styleSheet)(FieldsArrayPanel);

