import api from "./api";

const budgetService = {
  async getBudgets(month, year) {
    const response = await api.get("/budgets", {
      params: { month, year },
    });

    return response.data;
  },

  async getBudget(budgetId) {
    const response = await api.get(`/budgets/${budgetId}`);
    return response.data;
  },

  async createBudget(data) {
    const response = await api.post("/budgets", data);
    return response.data;
  },

  async updateBudget(budgetId, data) {
    const response = await api.put(
      `/budgets/${budgetId}`,
      data
    );

    return response.data;
  },

  async deleteBudget(budgetId) {
    const response = await api.delete(
      `/budgets/${budgetId}`
    );

    return response.data;
  },

  async getExpenseCategories() {
    const response = await api.get("/categories", {
      params: { type: "EXPENSE" },
    });

    return response.data;
  },
};

export default budgetService;