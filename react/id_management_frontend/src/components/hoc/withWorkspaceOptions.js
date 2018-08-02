import {connect} from "react-redux";

export default function withWorkspaceOptions(WrappedComponent) {
    const mapStateToProps = state => {
        return {
            workspaceOptions: state.workspaces.map(item => ({value: String(item.id), label: item.title}))
        };
    };

    return connect(mapStateToProps)(WrappedComponent);
}
