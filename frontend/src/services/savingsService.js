import api from "./api";

const savingsService = {
  async getGoals() {
    const response = await api.get("/savings-goals");
    return response.data;
  },

  async getGoal(goalId) {
    const response = await api.get(
      `/savings-goals/${goalId}`
    );
    return response.data;
  },

  async createGoal(data) {
    const response = await api.post(
      "/savings-goals",
      data
    );
    return response.data;
  },

  async updateGoal(goalId, data) {
    const response = await api.put(
      `/savings-goals/${goalId}`,
      data
    );
    return response.data;
  },

  async deleteGoal(goalId) {
    const response = await api.delete(
      `/savings-goals/${goalId}`
    );
    return response.data;
  },

  async addContribution(goalId, data) {
    const response = await api.post(
      `/savings-goals/${goalId}/contributions`,
      data
    );
    return response.data;
  },

  async getContributions(goalId) {
    const response = await api.get(
      `/savings-goals/${goalId}/contributions`
    );
    return response.data;
  },
};

export default savingsService;