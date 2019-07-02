import React from 'react';
import {shallow} from 'enzyme';
import toJSON from 'enzyme-to-json';
import FieldsArrayItem from '../FieldsArrayItem';

describe('FieldsArrayItem component', () => {
    const children = <div></div>;
    const classes = {item: 'woo'};

    it('renders the component', () => {
        const wrapper = shallow(<FieldsArrayItem
            children={children}
            classes={classes}
        />);

        expect(wrapper.dive().length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });
});