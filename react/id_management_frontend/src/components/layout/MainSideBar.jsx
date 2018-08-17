import PropTypes from 'prop-types'
import React, {Component} from 'react';
import MainBackButton from "./MainBackButton";
import {withStyles} from "@material-ui/core/styles";
import mainStyles from '../../styles/mainStyles';
import MainMenu from "./MainMenu";

const styleSheet = (theme) => ({
    sideBar: {
        width: mainStyles.sideBar.width,
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 10,
        backgroundColor: 'white',
        boxShadow: '1px 0 2px 1px rgba(0, 0, 0, .1)',
        height: '100%'
    },
    appHeader: Object.assign({}, mainStyles.header, {
        backgroundColor: theme.palette.primary.main,
        padding: 16,
        color: 'white',
        fontSize: 16,
        fontWeight: 500,
        textAlign: 'left',
        wordSpacing: mainStyles.sideBar.width,
        zIndex: 9,
        position: 'relative',
    })
});

class MainSideBar extends Component {
    render() {
        const {classes, portalName, match} = this.props;

        return (
            <div className={classes.sideBar}>
                <div className={classes.appHeader}>
                    {portalName}
                </div>
                <MainBackButton/>
                <MainMenu match={match}/>
            </div>
        )
    }
}

MainSideBar.propTypes = {
    classes: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    portalName: PropTypes.string
};

export default withStyles(styleSheet)(MainSideBar);

