import PropTypes from 'prop-types'
import React, {Component} from 'react';
import {withStyles} from "@material-ui/core/styles";
import mainStyles from "../../styles/mainStyles";

const styleSheet = {
    mainContent: {
        marginTop: mainStyles.header.height,
        marginLeft: mainStyles.sideBar.width,
        backgroundColor: '#F1F1F1',
        minHeight: 'calc(100vh - ' + mainStyles.header.height + 'px)',
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

MainContent.propTypes = {
    children: PropTypes.any.isRequired,
    classes: PropTypes.object.isRequired
};

export default withStyles(styleSheet)(MainContent);

