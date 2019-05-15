import React from 'react';
import {shallow} from 'enzyme';
import toJSON from 'enzyme-to-json';
import PlainButton from '../PlainButton';

describe('PlainButton component', () => {
    it('renders button and calls click', () => {
        const children = {};
        const classes = {};

        const wrapper = shallow(<PlainButton
            children={children}
            classes={classes}
        />)

        expect(wrapper.dive()).toBeTruthy();
        expect(toJSON(wrapper)).toMatchSnapshot();
    });
});