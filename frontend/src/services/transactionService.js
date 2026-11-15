import api from "./api";

const transactionService = {
  async getTransactions(params = {}) {
    const response = await api.get("/transactions", { params });
    return response.data;
  },

  async createTransaction(data) {
    const response = await api.post("/transactions", data);
    return response.data;
  },

  async updateTransaction(transactionId, data) {
    const response = await api.put(
      `/transactions/${transactionId}`,
      data
    );
    return response.data;
  },

  async deleteTransaction(transactionId) {
    const response = await api.delete(
      `/transactions/${transactionId}`
    );
    return response.data;
  },

  async getCategories() {
    const response = await api.get("/categories");
    return response.data;
  },
};

export default transactionService;