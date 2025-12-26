// This type defines the single configuration for customizing 3D objects
// It does not represent the state of the entire customization
// It is just for passing single customization changes
export type CustomizationConfig = {
        type: "color" | "texture" | "sticker" | "sticker-size" | "sticker-position";
        partName: string,
        value: string;
    };