import React, { useState, useEffect, ReactNode, Dispatch, SetStateAction } from "react";
import { CustomizationConfig } from "./ConfigType";
import { AdjustImageFrame } from "@/lib/ImageFrameUtils";

export type SectionConfig = {
  type: "color" | "texture" | "sticker";
  label: string;
  options: string[];
};

export type SectionsMap = Record<string, SectionConfig>;

type SimpleChoice = string;

type StickerChoice = {
  stickerPath: string;
  size: number;
  position: number;
};

type ChoiceValue = SimpleChoice | StickerChoice;

export type ChoicesState = {
  choices: Record<string, ChoiceValue>;
};

export default function CustomizationEditor({
  paletteName,
  onConfigChange,
  setChoicesState,
}: {
  paletteName: string;
  onConfigChange: (configs: CustomizationConfig[]) => void;
  setChoicesState?: Dispatch<SetStateAction<ChoicesState>>;
}) {
  const [sections, setSections] = useState<SectionsMap | null>(null);
  const [activeSectionName, setActiveSection] = useState<string | null>(null);

  // keep selection PER SECTION
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const [customStickers, setCustomStickers] = useState<Record<string, string>>({});
  const [stickerSizes, setStickerSizes] = useState<Record<string, number>>({});
  const [stickerPositions, setStickerPositions] = useState<Record<string, number>>({});

  // state update
  const updateChoicesState = (section: string, value: ChoiceValue) => {
    if (!setChoicesState) return;


    setChoicesState((prev) => ({
      choices: {
        ...prev.choices,
        [section]: value,
      },
    }));
  };

  // --- load palette ---
  useEffect(() => {
    let cancelled = false;

    fetch(`/palettes/${paletteName}.json`)
      .then((r) => {
        if (!r.ok) throw new Error("Palette not found at " + r.url);
        return r.json();
      })
      .then((data: SectionsMap) => {
        if (!cancelled) setSections(data);
      })
      .catch((err) => {
        console.error(err);
        setSections(null);
      });

    return () => {
      cancelled = true;
    };
  }, [paletteName]);

  // initialize selections + call update for each section
  useEffect(() => {
    if (!sections) return;

    const initial: Record<string, string> = {};

    const newConfigs: CustomizationConfig[] = [];
    Object.entries(sections).forEach(([name, section]) => {
      if (!section.options.length) return;

      const first = section.options[0];
      initial[name] = first;

      // push configs for threejs
      newConfigs.push({
        partName: name,
        type: section.type,
        value: first,
      });

      // set initial choices state
      updateChoicesState(name, section.type === "sticker" ? {
        stickerPath: first,
        size: 1,
        position: 0,
      } : first);

    });

    onConfigChange(newConfigs);

    setSelectedOptions(initial);
    setActiveSection(Object.keys(sections)[0] ?? null);
  }, [sections]);

  // cleanup blob urls on unmount
  useEffect(() => {
    return () => {
      Object.values(customStickers).forEach((sticker) => {
        if (sticker.startsWith("blob:")) {
          try {
            URL.revokeObjectURL(sticker);
          } catch {

          }
        }
      });
    };
  }, []);


  // --- RENDER ---

  if (!sections || !activeSectionName) {
    return <div>Customization Options are Loading...</div>;
  }

  const sectionEntries = Object.entries(sections);
  const activeSection = sections[activeSectionName];

  const stickerSize = stickerSizes[activeSectionName] ?? 1;
  const stickerPosition = stickerPositions[activeSectionName] ?? 0;

  const updateModel = (section: string, option: string): void => {

    // update state 
    const sectionType = sections[section].type;
    if (sectionType === "sticker") {
      updateChoicesState(section, {
        stickerPath: option,
        size: stickerSize,
        position: stickerPosition,
      });
    } else {
      updateChoicesState(section, option);
    }

    // send changes to threejs
    onConfigChange([{
      partName: section,
      type: sections[section].type,
      value: option,
    }]);
  };

  const updateSticker = (section: string, type: ("sticker-size" | "sticker-position")): void => {

    // update state
    const stickerPath = selectedOptions[section];
    updateChoicesState(section, {
      stickerPath: stickerPath,
      size: stickerSize,
      position: stickerPosition,
    });

    // send changes to threejs
    const adjustedValue = type === "sticker-size" ? stickerSize : stickerPosition;

    onConfigChange([{
      partName: section,
      type: type,
      value: adjustedValue.toString(),
    }]);

  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    const prevSticker = customStickers[activeSectionName];
    if (prevSticker && prevSticker.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(prevSticker);
      } catch { }
    }

    AdjustImageFrame(URL.createObjectURL(file)).then((url) => {
      setCustomStickers((prev) => {
        const newStickers = { ...prev };
        newStickers[activeSectionName] = url;
        return newStickers;
      });

      setSelectedOptions((prev) => ({
        ...prev,
        [activeSectionName]: url,
      }));

      updateModel(activeSectionName, url);
    });

  };

  type OptionBoxProps = {
    isSelected: boolean;
    onClick: () => void;
    children: ReactNode;
  };

  const OptionBox = ({ isSelected, onClick, children }: OptionBoxProps) => (
    <div
      onClick={onClick}
      className={`w-24 h-24 min-w-[48px] cursor-pointer p-1 transition-all duration-150 flex items-center justify-center ${isSelected
        ? "border-2 border-white"
        : "border border-white/60 hover:border-white"
        }`}
    >
      <div className={`w-full h-full p-1 ${isSelected ? "bg-white" : "bg-black"}`}>
        {children}
      </div>
    </div>
  );

  return (
    <div className="w-full p-4 text-sm text-white bg-black select-none border border-white/20">
      <div className="flex gap-6 pb-2 mb-4 border-b border-white">
        {sectionEntries.map(([name, section]) => (
          <div
            key={name}
            onClick={() => setActiveSection(name)}
            className={`cursor-pointer pb-1 transition-all duration-150 ${activeSectionName === name
              ? "border-b-2 border-white px-2"
              : "border-b-2 border-transparent hover:border-white"
              }`}
          >
            {section.label}
          </div>
        ))}
      </div>

      <div className="flex gap-3 overflow-x-auto items-start">
        {activeSection.type === "color" &&
          activeSection.options.map((c) => (
            <OptionBox
              key={c}
              isSelected={selectedOptions[activeSectionName] === c}
              onClick={() => {
                setSelectedOptions((prev) => ({
                  ...prev,
                  [activeSectionName]: c,
                }));
                updateModel(activeSectionName, c);
              }}
            >
              <div className="w-full h-full" style={{ background: c }} />
            </OptionBox>
          ))}

        {activeSection.type === "texture" &&
          activeSection.options.map((t) => (
            <OptionBox
              key={t}
              isSelected={selectedOptions[activeSectionName] === t}
              onClick={() => {
                setSelectedOptions((prev) => ({
                  ...prev,
                  [activeSectionName]: t,
                }));
                updateModel(activeSectionName, t);
              }}
            >
              <img src={t} alt="texture" className="w-full h-full object-cover" />
            </OptionBox>
          ))}

        {activeSection.type === "sticker" && (
          <div className="flex gap-6 w-full">
            {/* Sticker options */}
            <div className="flex gap-3 overflow-x-auto items-start flex-1">
              {activeSection.options.map((s) => (
                <OptionBox
                  key={s}
                  isSelected={selectedOptions[activeSectionName] === s}
                  onClick={() => {
                    setSelectedOptions((prev) => ({
                      ...prev,
                      [activeSectionName]: s,
                    }));
                    updateModel(activeSectionName, s);
                  }}
                >
                  <img src={s} alt="sticker" className="w-full h-full object-cover" />
                </OptionBox>
              ))}

              {customStickers[activeSectionName] && (
                <OptionBox
                  isSelected={selectedOptions[activeSectionName] === customStickers[activeSectionName]}
                  onClick={() => {
                    setSelectedOptions((prev) => ({
                      ...prev,
                      [activeSectionName]: customStickers[activeSectionName],
                    }));
                    updateModel(activeSectionName, customStickers[activeSectionName]);
                  }}
                >
                  <img src={customStickers[activeSectionName]} alt="custom" className="w-full h-full object-cover" />
                </OptionBox>
              )}

              {/* UPLOAD */}
              <div className="w-24 h-24 min-w-[96px]">
                <label className="w-full h-full block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="hidden"
                  />
                  <div className="w-full h-full cursor-pointer p-2 border border-dashed border-white/40 text-xs flex items-center justify-center hover:bg-white/5">
                    Upload
                  </div>
                </label>
              </div>

            </div>

            {/* Controls */}
            <div className="flex flex-col gap-4 min-w-[180px]">

              {/* Scale */}
              <div>
                <div className="flex flex-col gap-1 w-full overflow-hidden">
                  <span className="text-xs text-right text-white/70 leading-none whitespace-nowrap">Scale ({stickerSize})</span>
                  <input
                    type="range"
                    min="0.2"
                    max="3"
                    step="0.05"
                    value={stickerSize}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setStickerSizes(prev => ({
                        ...prev,
                        [activeSectionName]: v
                      }));
                      updateSticker(activeSectionName, "sticker-size");
                    }}
                  />
                </div>
              </div>

              {/* Position */}
              <div>
                <div className="flex flex-col gap-1 w-full overflow-hidden">
                  <span className="text-xs text-right text-white/70 leading-none whitespace-nowrap">Position ({stickerPosition})</span>
                  <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.01"
                    value={stickerPosition}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setStickerPositions(prev => ({
                        ...prev,
                        [activeSectionName]: v
                      }));
                      updateSticker(activeSectionName, "sticker-position");
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}