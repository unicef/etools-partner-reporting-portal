import PropTypes from 'prop-types'
import React, {Component} from "react";
import GreyPanel from "../common/GreyPanel";
import Grid from "@material-ui/core/Grid";
import FilterButtons from "../common/FilterButtons";
import {reduxForm} from 'redux-form';
import TextFieldForm from "../form/TextFieldForm";
import SearchSelectForm from "../form/SearchSelectForm";
import {connect} from "react-redux";
import labels from "../../labels";
import withProps from "../hoc/withProps";
import {clusterOptions, partnerTypeOptions} from "../../helpers/props";

class PartnersFilter extends Component {
    reset() {
        const {destroy, initialize} = this.props;

        destroy();
        initialize({});
    }

    render() {
        const {partnerTypeOptions, clusterOptions} = this.props;

        return (
            <GreyPanel>
                <form noValidate>
                    <Grid container spacing={24}>
                        <Grid item md={4}>
                            <TextFieldForm fieldName="title" label={labels.search}
                                           placeholder={labels.search}
                                           margin="none" optional/>
                        </Grid>

                        <Grid item md={4}>
                            <SearchSelectForm fieldName="partner_type" label={labels.partnerType} options={partnerTypeOptions}
                                        optional/>
                        </Grid>

                        <Grid item md={12}>
                            <SearchSelectForm fieldName="clusters" label={labels.cluster} options={clusterOptions}
                                        optional multiple/>
                        </Grid>

                    </Grid>

                    <FilterButtons onClear={() => this.reset()}/>
                </form>
            </GreyPanel>
        );
    }
}

PartnersFilter.propTypes = {
    clusterOptions: PropTypes.array,
    destroy: PropTypes.func.isRequired,
    initialize: PropTypes.func.isRequired,
    partnerTypeOptions: PropTypes.array
};

const mapStateToProps = (state, ownProps) => {
    return {
        initialValues: ownProps.initialValues
    }
};

export default connect(mapStateToProps)(reduxForm({form: 'partnersFilter'})(withProps(
    partnerTypeOptions,
    clusterOptions
)(PartnersFilter)));

