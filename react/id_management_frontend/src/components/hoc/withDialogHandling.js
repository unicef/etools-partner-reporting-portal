import { jsx as _jsx } from "react/jsx-runtime";
import { Component } from 'react';
export default WrappedComponent => class WithDialogHandling extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dialogOpen: {},
        };
        this.handleDialogOpen = this.handleDialogOpen.bind(this);
        this.handleDialogClose = this.handleDialogClose.bind(this);
    }
    handleDialogOpen(id) {
        this.setState({ dialogOpen: { [id]: true } });
    }
    handleDialogClose() {
        this.setState({ dialogOpen: {} });
    }
    render() {
        return (_jsx(WrappedComponent, { dialogOpen: this.state.dialogOpen, handleDialogOpen: this.handleDialogOpen, handleDialogClose: this.handleDialogClose, ...this.props }, void 0));
    }
};
