import { connect } from "react-redux";

export default function withPortal(WrappedComponent) {
    const mapStateToProps = state => {
        return {
            portal: state.portal
        };
    };

    return connect(mapStateToProps)(WrappedComponent);
}
