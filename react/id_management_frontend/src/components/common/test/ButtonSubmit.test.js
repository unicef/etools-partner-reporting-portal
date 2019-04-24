import React from 'react';
import {shallow} from 'enzyme';
import toJSON from 'enzyme-to-json';
import {Button, CircularProgress} from "@material-ui/core";
import ButtonSubmit from '../ButtonSubmit';

describe('ButtonSubmit component', () => {
    it('renders ButtonSubmit component and calls click properly', () => {
        const classes = {wrapper: 'wrapper', buttonProgress: 'buttonProgress'};
        const loading = false;
        const label = 'Submit';

        const wrapper = shallow(<ButtonSubmit
            className={classes.wrapper}
            disabled={loading}
            buttonLabel={label}
        />);

        wrapper.simulate('submit');

        expect(loading).toBe(false);
        expect(wrapper.dive().length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });

    it('renders Loading component when loading is true', () => {
        const classes = {wrapper: 'wrapper', buttonProgress: 'buttonProgress'};
        const loading = true;
        const label = false;

        const wrapper = shallow(<ButtonSubmit
            className={classes.wrapper}
            disabled={loading}
            buttonLabel={label}
        />);

        console.log(wrapper.prop('buttonLabel'))

        expect(loading).toBe(true);
        expect(wrapper.find('CircularProgress')).toBeTruthy();
        expect(wrapper.dive().length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });
});