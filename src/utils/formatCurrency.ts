export const formatCurrency = (value: number | string) => {
    const digits = typeof value === 'number'
        ? Math.round(value * 100).toString()
        : value.replace(/\D/g, "");

    const amount = Number(digits) / 100;

    return new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};