import React from 'react';
import {shallow} from 'enzyme';
import toJSON from 'enzyme-to-json';
import FieldsArrayPanel from '../FieldsArrayPanel';

describe('FieldsArrayPanel component', () => {
    const children = <p>Hello</p>;
    const classes = {panel: 'test'};

    it('renders the component', () => {
        const wrapper = shallow(<FieldsArrayPanel
            children={children}
            classes={classes}
        />);

        console.log(wrapper.debug());

        expect(wrapper.dive().length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });
});