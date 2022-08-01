import React, {Component} from 'react';
import {AppBar, IconButton, Typography, Dialog as MDialog, DialogContent, Toolbar} from "@material-ui/core/";
import Close from "@material-ui/icons/Close";
import {withStyles} from "@material-ui/core/styles";
import PropTypes from "prop-types";

const styleSheet = (theme) => ({
    appBar: {
        boxShadow: 'none'
    },
    toolbar: {
        display: 'flex',
        justifyContent: 'space-between'
    },
    close: {
        color: theme.palette.common.whiteAlpha,
        marginRight: -14
    },
    content: {
        padding: theme.spacing.unit * 3
    },
    caption: {
        padding: `${theme.spacing.unit}px ${theme.spacing.unit * 3}px`,
        backgroundColor: theme.palette.common.grey,
    },
    dialogLoading: {
        pointerEvents: 'none',
    }
});

class Dialog extends Component {
    render() {
        const {open, onClose, title, children, classes, caption, loading, width} = this.props;
        const maxWidth = width || 'sm';

        return (
            <MDialog
                open={!!open}
                onClose={onClose}
                fullWidth
                disableBackdropClick={loading}
                disableEscapeKeyDown={loading}
                className={loading ? classes.dialogLoading : ''}
                maxWidth={maxWidth}
            >
                <AppBar position="static" className={classes.appBar}>
                    <Toolbar className={classes.toolbar}>
                        <Typography variant="title" color="inherit">
                            {title}
                        </Typography>
                        {!loading && <IconButton className={classes.close} onClick={onClose} aria-label="Close">
                            <Close/>
                        </IconButton>}
                    </Toolbar>
                </AppBar>
                {caption && <div className={classes.caption}>
                    <Typography variant="caption">
                        {caption}
                    </Typography>
                </div>}
                <DialogContent className={classes.content}>
                    {children}
                </DialogContent>
            </MDialog>
        );
    }
}

Dialog.propTypes = {
    caption: PropTypes.string,
    children: PropTypes.any.isRequired,
    classes: PropTypes.object.isRequired,
    loading: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool,
    title: PropTypes.string.isRequired,
    width: PropTypes.oneOf(['xs', 'sm', 'md', 'lg'])
};

export default withStyles(styleSheet)(Dialog);