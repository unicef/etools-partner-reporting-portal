import {connect} from "react-redux";

export default function withClusterOptions(WrappedComponent) {
    const mapStateToProps = state => {
        return {
            clusterOptions: state.clusters.map(item => ({value: String(item.id), label: item.full_title}))
        };
    };

    return connect(mapStateToProps)(WrappedComponent);
}
