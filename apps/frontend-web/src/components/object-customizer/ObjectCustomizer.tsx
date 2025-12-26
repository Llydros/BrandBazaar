import React, { useState } from "react";
import CustomizationEditor, { ChoicesState } from "./CustomizationEditor";
import ObjectViewerWrapper from "./ObjectViewerWrapper";
import { CustomizationConfig } from "./ConfigType";

export default function ObjectCustomizer({
    name,
    autoRotate,
    autoRotateSpeed,
    setChoicesState,
}: {
    name: string,
    autoRotate?: boolean,
    autoRotateSpeed?: number,
    setChoicesState?: React.Dispatch<React.SetStateAction<ChoicesState>>,
}) {
    // config only used for latest changes
    const [config, setConfig] = useState<CustomizationConfig[]>([]);

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
            <div style={{ flex: 1, minHeight: 0 }}>
                <ObjectViewerWrapper modelName={name} configs={config} autoRotate={autoRotate} autoRotateSpeed={autoRotateSpeed} />
            </div>
            <CustomizationEditor paletteName={name} onConfigChange={setConfig} setChoicesState={setChoicesState} />
        </div>
    );
}