import React from 'react';
import {shallow} from 'enzyme';
import toJSON from 'enzyme-to-json';
import DeleteButton from '../DeleteButton';

describe('DeleteButton component', () => {
    it('renders component properly and calls click', () => {
        const onClick = jest.fn();
        const classes = {};

        const wrapper = shallow(<DeleteButton
            onClick={onClick}
            className={classes}
        />);

        expect(toJSON(wrapper)).toMatchSnapshot();
        expect(wrapper.dive().length).toBe(1);
    });
});