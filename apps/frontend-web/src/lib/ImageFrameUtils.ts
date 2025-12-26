// Creates a new image URL with these adjustment:
// A transparent 1px border around the image to prevent texture bleeding in 3D models.
// Aspect ratio adjusted to be square by expanding the canvas size.
export async function AdjustImageFrame(imageUrl: string): Promise<string> {
    const img = new Image();
    img.src = imageUrl;

    await img.decode();

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new Error("Failed to get canvas context");
    }

    const size = Math.max(img.width, img.height) + 2; // +2 for 1px border on each side

    canvas.width = size;
    canvas.height = size;

    ctx.drawImage(img, (size - img.width) / 2, (size - img.height) / 2);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    ctx.putImageData(imgData, 0, 0);

    const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob(b => resolve(b!), "image/png")
    );

    const cleanUrl = URL.createObjectURL(blob);
    return cleanUrl;
}