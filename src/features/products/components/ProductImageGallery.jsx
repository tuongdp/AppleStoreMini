import ImageGallery from "@/components/shared/ImageGallery";

export default function ProductImageGallery({ product }) {
    const images = product?.images || [];

    return <ImageGallery images={images} productName={product?.name || ""} />;
}
