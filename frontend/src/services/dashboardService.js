import api from "./api";

const dashboardService = {
    async getOverview(startDate, endDate) {
        const response = await api.get("/dashboard/overview", {
            params: {
                start_date: startDate,
                end_date: endDate,
            },
        });

        return response.data;
    },

    async getRecentTransactions() {
        const response = await api.get("/transactions", {
            params: {
                page: 1,
                page_size: 100,
                sort_by: "transaction_date",
                sort_order: "desc",
            },
        });

        return response.data;
    },

    async getBudgets(month, year) {
        const response = await api.get("/budgets", {
            params: {
                month,
                year,
            },
        });

        return response.data;
    },

    async getSavingsGoals() {
        const response = await api.get("/savings-goals");

        return response.data;
    },
};

export default dashboardService;