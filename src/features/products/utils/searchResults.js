export function groupProductsByCategory(products = []) {
    const groups = new Map();

    products.forEach((product) => {
        const category = product.category || "Khác";
        if (!groups.has(category)) {
            groups.set(category, {
                category,
                products: [],
            });
        }
        groups.get(category).products.push(product);
    });

    return Array.from(groups.values());
}

export function getNewsHref(news) {
    const slug = news?.slug || news?.id || news?._id;
    return slug ? `/news/${slug}` : "/news";
}
