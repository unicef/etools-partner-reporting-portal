import React, {Component} from 'react';
import Dialog from "../common/Dialog";
import DialogActions from "../common/DialogActions";
import TextFieldForm from "../form/TextFieldForm";
import {Grid, Button} from "@material-ui/core";
import {email, phoneNumber} from "../../helpers/validation";
import {reduxForm} from 'redux-form';
import {api} from "../../infrastructure/api";
import {getLabels} from "../../labels";
import ButtonSubmit from "../common/ButtonSubmit";
import SelectForm from "../form/SelectForm";
import SearchSelectForm from "../form/SearchSelectForm";
import {connect} from "react-redux";
import withProps from "../hoc/withProps";
import {clusterOptions, partnerTypeOptions} from "../../helpers/props";
import partnerLabels from "./partnerLabels";
import LoadingIndicator from "../common/LoadingIndicator";
import PropTypes from "prop-types";

const labels = getLabels(partnerLabels);

class PartnerDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            csoSelected: false
        };

        this.onClose = this.onClose.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    onSubmit(values) {
        const {onSave, partner} = this.props;

        this.setState({loading: true});

        const method = partner ?
            api.patch(`id-management/partners/${partner.id}/`, values) :
            api.post("id-management/partners/", values);

        return method
            .then(res => {
                this.onClose();
                onSave(res.data);
            })
            .finally(() => this.setState({loading: false}))
    }

    onClose() {
        const {reset, onClose} = this.props;

        onClose();
        reset();
    }

    handleChange(e) {
        console.log('e.target.value', e.target.value);
        if (e.target.value === 'CSO') {
            this.setState({ csoSelected: true });
        } else {
            this.setState({ csoSelected: false });
        }
    }

    render() {
        const {
            open,
            handleSubmit,
            sharedPartnerOptions,
            csoTypeOptions,
            partnerTypeOptions,
            clusterOptions,
            dataLoading,
            title
        } = this.props;

        return (
            <Dialog
                open={open}
                onClose={this.onClose}
                title={title}
                loading={this.state.loading || dataLoading}
                width="md"
            >
                {dataLoading &&
                <LoadingIndicator absolute/>}

                <form onSubmit={handleSubmit(this.onSubmit)} noValidate>
                    <Grid container spacing={24}>
                        <Grid item md={6}>
                            <TextFieldForm fieldName="ocha_external_id" label={labels.ocha_external_id} optional/>
                        </Grid>

                        <Grid item md={6}/>

                        <Grid item md={6}>
                            <TextFieldForm fieldName="external_id" label={labels.external_id}
                                           textFieldProps={{helperText: labels.externalIdHelper}} optional/>
                        </Grid>

                        <Grid item md={12}>
                            <TextFieldForm fieldName="external_source" label={labels.external_source} optional/>
                        </Grid>

                        <Grid item md={6}>
                            <TextFieldForm fieldName="title" label={labels.fullName}
                                           textFieldProps={{helperText: labels.fullNameHelper}}/>
                        </Grid>

                        <Grid item md={6}>
                            <TextFieldForm fieldName="short_title" label={labels.short_title} optional/>
                        </Grid>

                        <Grid item md={6}>
                            <TextFieldForm fieldName="alternate_title" label={labels.alternate_title} optional/>
                        </Grid>

                        <Grid item md={6}>
                            <SelectForm fieldName="shared_partner" label={labels.shared_partner}
                                        values={sharedPartnerOptions} optional/>
                        </Grid>

                        <Grid item md={6}>
                            <SelectForm fieldName="partner_type" label={labels.partnerType} values={partnerTypeOptions}
                                        onChange={this.handleChange} optional/>
                        </Grid>

                        <Grid item md={6}>
                            <SelectForm fieldName="cso_type" label={labels.cso_type} values={csoTypeOptions}
                                        selectFieldProps={{disabled: !this.state.csoSelected}} optional/>
                        </Grid>

                        <Grid item md={6}>
                            <TextFieldForm fieldName="email" label={labels.email} validation={[email]} optional/>
                        </Grid>

                        <Grid item md={6}>
                            <TextFieldForm fieldName="phone_number" label={labels.phone_number}
                                           validation={[phoneNumber]} optional/>
                        </Grid>

                        <Grid item md={6}>
                            <TextFieldForm fieldName="street_address" label={labels.street_address} optional/>
                        </Grid>

                        <Grid item md={6}>
                            <TextFieldForm fieldName="city" label={labels.city} optional/>
                        </Grid>

                        <Grid item md={6}>
                            <TextFieldForm fieldName="postal_code" label={labels.postal_code} optional/>
                        </Grid>

                        <Grid item md={6}>
                            <TextFieldForm fieldName="country_code" label={labels.country_code} optional/>
                        </Grid>

                        <Grid item md={6}>
                            <TextFieldForm fieldName="unicef_vendor_number" label={labels.unicef_vendor_number} optional/>
                        </Grid>

                        <Grid item md={6}>
                            <TextFieldForm fieldName="alternate_id" label={labels.alternate_id} optional/>
                        </Grid>

                        <Grid item md={6}/>

                        <Grid item md={12}>
                            <SearchSelectForm fieldName="clusters" label={labels.clusters} options={clusterOptions} multiple/>
                        </Grid>
                    </Grid>

                    <DialogActions>
                        <Button onClick={this.onClose}>{labels.cancel}</Button>
                        <ButtonSubmit loading={this.state.loading}/>
                    </DialogActions>
                </form>
            </Dialog>
        );
    }
}

PartnerDialog.propTypes = {
    clusterOptions: PropTypes.array,
    csoTypeOptions: PropTypes.array,
    dataLoading: PropTypes.bool,
    handleSubmit: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    open: PropTypes.bool,
    partner: PropTypes.object,
    partnerTypeOptions: PropTypes.array,
    reset: PropTypes.func.isRequired,
    sharedPartnerOptions: PropTypes.array,
    title: PropTypes.string
};

const title = {
    add: "Add new Partner",
    edit: "Edit Partner"
};

const mapStateToProps = (state, ownProps) => {
    const {partner} = ownProps;

    let initialValues = null;

    if (partner) {
        const partnerDetails = state.partnerDetails[partner.id];

        if (partnerDetails) {
            const clusters = partnerDetails.clusters.map(item => String(item.id));

            initialValues = Object.assign({}, partnerDetails, {clusters});
        }
    }

    return {
        sharedPartnerOptions: state.options.shared_partner || [],
        csoTypeOptions: state.options.cso_type || [],
        initialValues,
        dataLoading: !!(ownProps.partner && !initialValues),
        title: partner ? title.edit : title.add
    }
};

export default withProps(
    clusterOptions,
    partnerTypeOptions
)(connect(mapStateToProps)(reduxForm({form: "addPartnerForm", enableReinitialize: true})(PartnerDialog)));