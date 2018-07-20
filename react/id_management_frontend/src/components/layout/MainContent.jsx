import React, {Component} from 'react';
import {withStyles} from "@material-ui/core/styles";
import mainStyles from "../../styles/mainStyles";

const styleSheet = {
    mainContent: {
        marginTop: mainStyles.header.height,
        marginLeft: mainStyles.sideBar.width
    }
};

class MainContent extends Component {
    render() {
        const {children, classes} = this.props;

        return (
            <div className={classes.mainContent}>
                {children}
            </div>
        )
    }
}

export default withStyles(styleSheet)(MainContent);