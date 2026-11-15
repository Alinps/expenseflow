export function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(amount || 0));
}

export function formatDate(date) {
    if (!date) return "-";

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(date));
}

export function getCurrentMonthRange() {
    const today = new Date();

    const startDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
    );

    const endDate = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
    );

    const toISODate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    return {
        startDate: toISODate(startDate),
        endDate: toISODate(endDate),
    };
}