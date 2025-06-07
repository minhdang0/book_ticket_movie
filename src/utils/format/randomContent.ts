const randomContent = () => {
    const prefixes = ['BIGC', 'PAY', 'DONHANG', 'MUAHANG', 'TT'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let suffix = '';
    for (let i = 0; i < 5; i++) {
        suffix += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return `${randomPrefix}${suffix}`;
};

export default randomContent