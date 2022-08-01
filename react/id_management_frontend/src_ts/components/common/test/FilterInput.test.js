import React from 'react';
import {shallow} from 'enzyme';
import toJSON from 'enzyme-to-json';
import FilterInput from '../FilterInput';

describe('FilterInput component', () => {
    const children = <input value="test"/>;
    const classes = {};

    it('renders properly', () => {
        const wrapper = shallow(<FilterInput
            children={children}
            classes={classes}
        />);

        expect(wrapper.dive().length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });
});