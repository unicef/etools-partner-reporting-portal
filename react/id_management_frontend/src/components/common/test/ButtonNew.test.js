import React from 'react';
import {shallow} from 'enzyme';
import toJSON from 'enzyme-to-json';
import ButtonNew from '../ButtonNew';

describe('ButtonNew component', () => {
    it('renders ButtonNew component and calls click', () => {
        const onClick = jest.fn();
        const classes = {};

        const wrapper = shallow(<ButtonNew
            onClick={onClick}
            classes={classes}
        />);

        wrapper.simulate('click');
        const calls = onClick.mock.calls;

        expect(calls.length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    })
})