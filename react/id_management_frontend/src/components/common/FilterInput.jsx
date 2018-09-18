import PropTypes from 'prop-types'
import React, {Component} from 'react';
import {withStyles} from "@material-ui/core/styles";
import FormControl from "@material-ui/core/FormControl";

const styleSheet = () => ({
    formControl: {
        minWidth: '100%'
    }
});

class FilterInput extends Component {
    render() {
        const {children, classes} = this.props;

        return (
            <FormControl className={classes.formControl}>
                {children}
            </FormControl>
        )
    }
}

FilterInput.propTypes = {
    children: PropTypes.any.isRequired,
    classes: PropTypes.object.isRequired
};

export default withStyles(styleSheet)(FilterInput);

