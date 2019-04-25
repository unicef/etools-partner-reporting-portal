import React from 'react';
import {shallow, mount} from 'enzyme';
import toJSON from 'enzyme-to-json';
import {CircularProgress} from "@material-ui/core";
import ButtonSubmit from '../ButtonSubmit';

describe('ButtonSubmit component', () => {
    it('renders ButtonSubmit component and calls click properly', () => {
        const classes = {wrapper: 'wrapper', buttonProgress: 'buttonProgress'};
        const loading = false;
        const label = 'Submit';

        const wrapper = mount(<ButtonSubmit
            classes={classes}
            loading={loading}
            buttonLabel={label}
        />);

        wrapper.simulate('submit');

        const node = wrapper.exists(CircularProgress);

        expect(node).toBeFalsy();
        expect(toJSON(wrapper)).toMatchSnapshot();
    });

    it('renders Loading component when loading is true', () => {
        const classes = {wrapper: 'wrapper', buttonProgress: 'buttonProgress'};
        const loading = true;
        const label = null;

        const wrapper = mount(<ButtonSubmit
            classes={classes}
            label={label}
            loading={loading}
        />);

        const node = wrapper.exists(CircularProgress);

        expect(node).toBe(true);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });
});