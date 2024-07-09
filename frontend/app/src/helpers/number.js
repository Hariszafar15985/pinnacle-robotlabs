export function numberWithCommas(x) {
    if (!x) return 0;
    return x.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

export const formatUsNumber = (n) => {
    if (n == null) return 'N/A';
    return n.toLocaleString('en-US');
}

export const formatFloatWithDollarSign = (floatNum, numberOfDecimals = 2) => {
    if (floatNum != null) {
        const formatter = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: numberOfDecimals,
        });
        const text = formatUsNumber(formatter.format(Math.abs(floatNum)));
        if (floatNum < 0) return '-$' + text;
        return '$' + text;
    }

    return 'N/A';
};