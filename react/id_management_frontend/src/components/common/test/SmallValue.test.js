import React from 'react';
import {shallow} from 'enzyme';
import toJSON from 'enzyme-to-json';
import SmallValue from '../SmallValue';

describe('SmallValue component', () => {
    it('renders the component correctly', () => {
        const label = 'CoolText';
        const value = 'CoolValue';
    
        const wrapper = shallow(<SmallValue
            label={label}
            value={value}
        />);
    
        expect(toJSON(wrapper)).toMatchSnapshot();
    });
});