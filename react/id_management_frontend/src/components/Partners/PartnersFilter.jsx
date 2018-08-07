import React, {Component} from "react";
import GreyPanel from "../common/GreyPanel";
import Grid from "@material-ui/core/Grid";
import FilterButtons from "../common/FilterButtons";
import {reduxForm} from 'redux-form';
import TextFieldForm from "../form/TextFieldForm";
import SelectForm from "../form/SelectForm";
import {connect} from "react-redux";
import labels from "../../labels";
import withPartnerTypeOptions from "../hoc/withPartnerTypeOptions";
import withClusterOptions from "../hoc/withClusterOptions";

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
                            <TextFieldForm fieldName="full_name" label={labels.search}
                                           placeholder={labels.search}
                                           margin="none" optional/>
                        </Grid>

                        <Grid item md={4}>
                            <SelectForm fieldName="partner_type" label={labels.partnerType} values={partnerTypeOptions}
                                        optional/>
                        </Grid>

                        <Grid item md={12}>
                            <SelectForm fieldName="clusters" label={labels.cluster} values={clusterOptions}
                                        optional multiple/>
                        </Grid>

                    </Grid>

                    <FilterButtons onClear={() => this.reset()}/>
                </form>
            </GreyPanel>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        initialValues: ownProps.initialValues
    }
};

export default connect(mapStateToProps)(reduxForm({form: 'partnersFilter'})(withPartnerTypeOptions(withClusterOptions(PartnersFilter))));
