import React from 'react';
import {shallow} from 'enzyme';
import toJSON from 'enzyme-to-json';
import {AddUserDialog} from '../AddUserDialog';

describe('AddUserDialog component', () => {
    const handleSubmit = jest.fn();
    const onClose = jest.fn();
    const onSave = jest.fn();
    const open = false;
    const partnerOptions = [];
    const portal = 'portal';
    const reset = jest.fn();
    const user = {prp_roles: [{is_active: true, role: 'CLUSTER_SYSTEM_ADMIN'}]};
    const user_type = 'type';

    const wrapper = shallow(<AddUserDialog
        handleSubmit={handleSubmit}
        onClose={onClose}
        onSave={onSave}
        open={open}
        partnerOptions={partnerOptions}
        portal={portal}
        reset={reset}
        user={user}
        user_type={user_type}
    />);

    it('renders the component', () => {
        expect(wrapper.dive().length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });
});