"use client";

import ObjectCustomizer from "@/components/object-customizer/ObjectCustomizer";

export default function Page() {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-center">
          <div className="relative aspect-square w-[90%] overflow-hidden">
            <ObjectCustomizer
              name="nike"
              autoRotate={true}
              autoRotateSpeed={0.1}
            />
          </div>
        </div>
      </div>
    );
}
