import React, {Component} from "react";
import {withStyles} from "@material-ui/core/styles";


const styleSheet = (theme) => ({
    container: {
        padding: `${theme.spacing.unit}px 0`
    }
});

class PartnerRowExpanded extends Component {
    render() {
        const {classes} = this.props;

        return (
            <div className={classes.container}>
                TODO
            </div>
        );
    }
}

export default withStyles(styleSheet)(PartnerRowExpanded);
