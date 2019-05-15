import React from 'react';
import {shallow} from 'enzyme';
import toJSON from 'enzyme-to-json';
import DialogActions from '../DialogActions';

describe('DialogActions component', () => {
    it('renders properly', () => {
        const classes = {};
        const children = {};

        const wrapper = shallow(<DialogActions
            classes={classes}
            children={children}
        />);

        expect(wrapper.dive().length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });
});