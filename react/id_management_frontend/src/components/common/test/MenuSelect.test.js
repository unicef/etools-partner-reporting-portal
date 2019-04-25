import React from 'react';
import {shallow, mount} from 'enzyme';
import toJSON from 'enzyme-to-json';
import {MenuItem} from "@material-ui/core";
import MenuSelect from '../MenuSelect';

describe('MenuSelect component', () => {
    const label = 'test';
    const name = 'Florence';
    const options = [{value: 528, label: 'dreamy'}];
    const onChange = jest.fn();
    const value = 1138;

    it('renders properly', () => {
        const wrapper = shallow(<MenuSelect
            label={label}
            name={name}
            options={options}
            onChange={onChange}
            value={value}
        />);

        expect(wrapper.dive().length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });
});