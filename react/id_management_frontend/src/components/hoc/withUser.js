import { connect } from "react-redux";

export default function withUser(WrappedComponent) {
    const mapStateToProps = state => {
        return {
            user: state.user
        };
    };

    return connect(mapStateToProps)(WrappedComponent);
}
