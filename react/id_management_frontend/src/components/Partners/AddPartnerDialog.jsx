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
import {connect} from "react-redux";
import withPartnerTypeOptions from "../hoc/withPartnerTypeOptions";

const labels = getLabels({
    title: "Add new Partner",
    ochaId: "OCHA ID",
    externalId: "External ID",
    externalIdHelper: "An ID representing this instance in an external system",
    externalSource: "External source",
    fullName: "Full name",
    fullNameHelper: "Please make sure this matches the name you enter in VISION",
    shortTitle: "Short title",
    alternateTitle: "Alternate title",
    sharedPartner: "Shared partner",
    partnerType: "Partner type",
    csoType: "CSO Type",
    streetAddress: "Street address",
    city: "City",
    postalCode: "Postal code",
    countryCode: "Country code",
    totalCtCp: "Total ct cp",
    totalCtCpHelper: "Total Cash Transferred for Country Programme",
    totalCtCy: "Total ct cy",
    totalCtCyHelper: "Total Cash Transferred per Current Year",
    vendorNumber: "Vendor number",
    alternateId: "Alternate ID",
    riskRating: "Risk rating",
    typeOfAssessment: "Type of assessment",
    basisForRiskRating: "Basis for risk rating",
    clusters: "Clusters"
});

class AddUserDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false
        };

        this.onClose = this.onClose.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit(values) {
        const {onSave} = this.props;

        this.setState({loading: true});

        // TODO: Link to API endpoint
        return api.post("", values)
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

    render() {
        const {open, handleSubmit, sharedPartnerOptions, csoTypeOptions, partnerTypeOptions} = this.props;

        return (
            <Dialog
                open={open}
                onClose={this.onClose}
                title={labels.title}
                loading={this.state.loading}
            >
                <form onSubmit={handleSubmit(this.onSubmit)} noValidate>
                    <Grid container spacing={24}>
                        <Grid item md={6}>
                            <TextFieldForm fieldName="ocha_external_id" label={labels.ochaId}/>
                        </Grid>

                        <Grid item md={6}/>

                        <Grid item md={6}>
                            <TextFieldForm fieldName="external_id" label={labels.externalId}
                                           textFieldProps={{helperText: labels.externalIdHelper}}/>
                        </Grid>

                        <Grid item md={12}>
                            <TextFieldForm fieldName="external_source" label={labels.externalSource}/>
                        </Grid>

                        <Grid item md={6}>
                            <TextFieldForm fieldName="full_name" label={labels.fullName}
                                           textFieldProps={{helperText: labels.fullNameHelper}}/>
                        </Grid>

                        <Grid item md={6}>
                            <TextFieldForm fieldName="short_title" label={labels.shortTitle}/>
                        </Grid>

                        <Grid item md={6}>
                            <TextFieldForm fieldName="alternate_title" label={labels.alternateTitle}/>
                        </Grid>

                        <Grid item md={6}>
                            <SelectForm fieldName="shared_partner" label={labels.sharedPartner} values={sharedPartnerOptions}/>
                        </Grid>

                        <Grid item md={6}>
                            <SelectForm fieldName="partner_type" label={labels.partnerType} values={partnerTypeOptions}/>
                        </Grid>

                        <Grid item md={6}>
                            <SelectForm fieldName="cso_type" label={labels.csoType} values={csoTypeOptions}/>
                        </Grid>

                        <Grid item md={6}>
                            <TextFieldForm fieldName="email" label={labels.email} validation={[email]}/>
                        </Grid>

                        <Grid item md={6}>
                            <TextFieldForm fieldName="phone_number" label={labels.phoneNumber}
                                           validation={[phoneNumber]}/>
                        </Grid>

                        <Grid item md={6}>
                            <TextFieldForm fieldName="street_address" label={labels.streetAddress}/>
                        </Grid>

                        <Grid item md={6}>
                            <TextFieldForm fieldName="city" label={labels.city}/>
                        </Grid>

                        <Grid item md={6}>
                            <TextFieldForm fieldName="postal_code" label={labels.postalCode}/>
                        </Grid>

                        <Grid item md={6}>
                            <TextFieldForm fieldName="country_code" label={labels.countryCode}/>
                        </Grid>

                        <Grid item md={6}>
                            <TextFieldForm fieldName="total_ct_cp" label={labels.totalCtCp}
                                           textFieldProps={{helperText: labels.totalCtCpHelper}}/>
                        </Grid>

                        <Grid item md={6}>
                            <TextFieldForm fieldName="total_ct_cy" label={labels.totalCtCy}
                                           textFieldProps={{helperText: labels.totalCtCyHelper}}/>
                        </Grid>

                        <Grid item md={6}>
                            <TextFieldForm fieldName="vendor_number" label={labels.vendorNumber}/>
                        </Grid>

                        <Grid item md={6}>
                            <TextFieldForm fieldName="alternate_id" label={labels.alternateId}/>
                        </Grid>

                        <Grid item md={6}>
                            <TextFieldForm fieldName="risk_rating" label={labels.riskRating}/>
                        </Grid>

                        <Grid item md={6}>
                            <TextFieldForm fieldName="type_of_assessment" label={labels.typeOfAssessment}/>
                        </Grid>

                        <Grid item md={6}>
                            <TextFieldForm fieldName="basis_for_risk_rating" label={labels.basisForRiskRating}/>
                        </Grid>

                        <Grid item md={6}/>

                        <Grid item md={12}>
                            {/* TODO: add options */}
                            <SelectForm fieldName="clusters" label={labels.clusters} values={[]}/>
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

const mapStateToProps = (state) => {
    return {
        sharedPartnerOptions: state.options.shared_partner || [],
        csoTypeOptions: state.options.cso_type || []
    }
};

export default withPartnerTypeOptions(connect(mapStateToProps)(reduxForm({form: "addPartnerForm"})(AddUserDialog)));