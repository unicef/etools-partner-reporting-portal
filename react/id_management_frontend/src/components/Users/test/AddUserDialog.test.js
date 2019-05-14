import React from 'react';
import {shallow} from 'enzyme';
import toJSON from 'enzyme-to-json';
import 'babel-polyfill';
import {AddUserDialog, mapStateToProps} from '../AddUserDialog';

jest.mock('../../../infrastructure/api', () => ({
    api: {
        post: jest.fn(() => Promise.resolve({data: 'success!'}))
    }
}));

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

    beforeEach(() => {
        jest.clearAllMocks();
    })

    it('renders the component', () => {
        expect(wrapper.dive().length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });

    it('calls onClose method correctly', () => {
        wrapper.instance().onClose();

        const closeCalls = onClose.mock.calls;
        const resetCalls = reset.mock.calls;

        expect(closeCalls.length).toBe(1);
        expect(resetCalls.length).toBe(1);
    });

    it('calls onSubmit method correctly', () => {
        const saveCalls = onSave.mock.calls;
        const closeCalls = onClose.mock.calls;
        const state = wrapper.state();

        wrapper.instance().onSubmit({user_id: null})
            .then(res => {
                expect(saveCalls.length).toBe(1);
                expect(closeCalls.length).toBe(1);
                expect(state.loading).toBe(false);
            });
    });

    it('calls mapStateToProps correctly', () => {
        const state = {user_type: 'yay'};
        const map = mapStateToProps(state);

        // FIX: hard to test because it relies on global Redux store
        expect(map).toEqual({user_type: undefined});
    });
});