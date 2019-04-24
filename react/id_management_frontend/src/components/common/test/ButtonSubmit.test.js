import React from 'react';
import {shallow} from 'enzyme';
import toJSON from 'enzyme-to-json';
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

        expect(toJSON(wrapper)).toMatchSnapshot();
    });
});