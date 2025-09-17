import React from "react";
import * as Slider from "@radix-ui/react-slider";
import { MOOD_LEVELS } from "@/lib/constants";

interface MoodSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function MoodSlider({ value, onChange }: MoodSliderProps) {
  const currentMood = MOOD_LEVELS.find(mood => mood.value === value) || MOOD_LEVELS[2];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-4xl mb-2">{currentMood.emoji}</div>
        <div className="text-lg font-medium">{currentMood.label}</div>
      </div>
      
      <div className="px-4">
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          value={[value]}
          onValueChange={(values) => onChange(values[0])}
          max={5}
          min={1}
          step={1}
        >
          <Slider.Track className="bg-gray-200 relative grow rounded-full h-[3px]">
            <Slider.Range 
              className="absolute rounded-full h-full"
              style={{ backgroundColor: currentMood.color }}
            />
          </Slider.Track>
          <Slider.Thumb
            className="block w-5 h-5 bg-white border-2 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            style={{ borderColor: currentMood.color }}
          />
        </Slider.Root>
        
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          {MOOD_LEVELS.map((mood) => (
            <div key={mood.value} className="text-center">
              <div>{mood.emoji}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}