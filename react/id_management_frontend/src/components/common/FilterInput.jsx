import React, {Component} from 'react';
import {withStyles} from "@material-ui/core/styles";
import FormControl from "@material-ui/core/FormControl";

const styleSheet = theme => ({
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

export default withStyles(styleSheet)(FilterInput);