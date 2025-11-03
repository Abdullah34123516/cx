// utils.ts
const MAX_WIDTH = 800;
const MAX_HEIGHT = 800;
const MIME_TYPE = "image/jpeg";
const QUALITY = 0.8;

export const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const blobURL = URL.createObjectURL(file);
        const img = new Image();
        img.src = blobURL;
        img.onerror = function () {
            URL.revokeObjectURL(blobURL);
            reject(new Error("Cannot load image"));
        };
        img.onload = function () {
            URL.revokeObjectURL(blobURL);
            const [newWidth, newHeight] = calculateSize(img, MAX_WIDTH, MAX_HEIGHT);
            const canvas = document.createElement("canvas");
            canvas.width = newWidth;
            canvas.height = newHeight;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                reject(new Error("Could not get canvas context"));
                return;
            }
            ctx.drawImage(img, 0, 0, newWidth, newHeight);
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error("Canvas to Blob failed"));
                    }
                },
                MIME_TYPE,
                QUALITY
            );
        };
    });
};

function calculateSize(img: HTMLImageElement, maxWidth: number, maxHeight: number) {
    let width = img.width;
    let height = img.height;

    if (width > height) {
        if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
        }
    } else {
        if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
        }
    }
    return [width, height];
}

export const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            // remove the header, e.g., "data:image/jpeg;base64,"
            resolve(result.substring(result.indexOf(',') + 1));
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
    });
};