import React, { Component } from "react";

export default function withMenu(WrappedComponent) {
    class WithMenu extends Component {
        constructor(props) {
            super(props);

            this.handleClick = this.handleClick.bind(this);
            this.handleClose = this.handleClose.bind(this);

            this.state = {
                anchorEl: null
            };
        }

        handleClick = event => {
            this.setState({ anchorEl: event.currentTarget });
        };

        handleClose = () => {
            this.setState({ anchorEl: null });
        };

        render() {
            return (
                <WrappedComponent
                    handleClick={this.handleClick}
                    handleClose={this.handleClose}
                    anchorEl={this.state.anchorEl}
                    {...this.props}
                />
            );
        }
    }

    WithMenu.displayName = `WithMenu(${getDisplayName(WrappedComponent)})`;

    return WithMenu;
}

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || "Component";
}
