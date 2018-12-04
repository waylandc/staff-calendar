import { getField, updateField } from 'vuex-map-fields';
import { User, createUser } from '../../../models/User';
import { ERROR, SUCCESS } from '../../mutation-types';
import { SUBMIT } from '../../action-types';
import { saveUser } from '../../../utils/dao';

const actions = {
  async [SUBMIT]({ commit, state }) {
    try {
      const customerData = createUser({
        email: state.user.email,
        isAdmin: state.user.isAdmin,
        isApprover: state.user.isApprover,
        password: state.user.password,
        daysAnnualLeave: state.user.daysAnnualLeave,
        daysCompLeave: state.user.daysCompLeave,
        daysCarryOver: state.user.daysCarryOver,
        daysBooked: state.user.daysBooked,
      });

      await saveUser(customerData);

      commit(SUCCESS);
    } catch (error) {
      commit(ERROR, error.message);
    }
  },
};

const mutations = {
  updateField,
};

const getters = {
  getField,
};

const state = () => ({
  user: [new User()],
});

export const user = {
  namespaced: true,
  actions,
  mutations,
  getters,
  state,
};
