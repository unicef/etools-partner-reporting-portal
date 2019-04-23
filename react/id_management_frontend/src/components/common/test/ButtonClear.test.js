import React from 'react';
import {shallow} from 'enzyme';
import toJSON from 'enzyme-to-json';
import ButtonClear from '../ButtonClear';

describe('Clear button component', () => {
    it('renders clear button', () => {
        const onClick = jest.fn();

        const wrapper = shallow(<ButtonClear
            onClick={onClick}
        />);

        expect(toJSON(wrapper)).toMatchSnapshot();
    });
});