export const getThumbnail = (url: string) => {
    if (!url) return '';

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
        return `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`;
    }
    return '';
}