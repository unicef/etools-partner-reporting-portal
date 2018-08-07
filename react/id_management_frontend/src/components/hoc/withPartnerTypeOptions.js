import {connect} from "react-redux";

export default function withPartnerTypeOptions(WrappedComponent) {
    const mapStateToProps = state => {
        return {
            partnerTypeOptions: state.options.partner_type || []
        };
    };

    return connect(mapStateToProps)(WrappedComponent);
}
