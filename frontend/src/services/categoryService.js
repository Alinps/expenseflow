import api from "./api";

const categoryService = {
  async getCategories(type = "") {
    const params = type ? { type } : {};
    const response = await api.get("/categories", { params });
    return response.data;
  },

  async createCategory(data) {
    const response = await api.post("/categories", data);
    return response.data;
  },

  async updateCategory(categoryId, data) {
    const response = await api.put(
      `/categories/${categoryId}`,
      data
    );
    return response.data;
  },

  async deleteCategory(categoryId) {
    const response = await api.delete(
      `/categories/${categoryId}`
    );
    return response.data;
  },
};

export default categoryService;