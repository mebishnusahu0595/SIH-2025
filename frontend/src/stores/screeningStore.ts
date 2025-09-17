import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ScreeningResult } from "@/types";
import { STORAGE_KEYS, PHQ9_QUESTIONS, GAD7_QUESTIONS } from "@/lib/constants";

interface ScreeningStore {
  results: ScreeningResult[];
  addResult: (type: "PHQ9" | "GAD7", responses: number[]) => void;
  getLatestResult: (type: "PHQ9" | "GAD7") => ScreeningResult | undefined;
  calculateScore: (responses: number[]) => number;
  interpretScore: (score: number, type: "PHQ9" | "GAD7") => {
    interpretation: string;
    recommendation: "self-care" | "counselor" | "emergency";
  };
}

export const useScreeningStore = create<ScreeningStore>()(
  persist(
    (set, get) => ({
      results: [],

      addResult: (type: "PHQ9" | "GAD7", responses: number[]) => {
        const score = get().calculateScore(responses);
        const { interpretation, recommendation } = get().interpretScore(score, type);

        const result: ScreeningResult = {
          id: Date.now().toString(),
          type,
          score,
          responses,
          date: new Date(),
          interpretation,
          recommendation,
        };

        set((state) => ({
          results: [result, ...state.results],
        }));
      },

      getLatestResult: (type: "PHQ9" | "GAD7") => {
        const { results } = get();
        return results.find((result) => result.type === type);
      },

      calculateScore: (responses: number[]) => {
        return responses.reduce((sum, response) => sum + response, 0);
      },

      interpretScore: (score: number, type: "PHQ9" | "GAD7") => {
        if (type === "PHQ9") {
          if (score <= 4) {
            return {
              interpretation: "Minimal depression symptoms",
              recommendation: "self-care",
            };
          } else if (score <= 9) {
            return {
              interpretation: "Mild depression symptoms",
              recommendation: "self-care",
            };
          } else if (score <= 14) {
            return {
              interpretation: "Moderate depression symptoms",
              recommendation: "counselor",
            };
          } else if (score <= 19) {
            return {
              interpretation: "Moderately severe depression symptoms",
              recommendation: "counselor",
            };
          } else {
            return {
              interpretation: "Severe depression symptoms",
              recommendation: "emergency",
            };
          }
        } else {
          // GAD7
          if (score <= 4) {
            return {
              interpretation: "Minimal anxiety symptoms",
              recommendation: "self-care",
            };
          } else if (score <= 9) {
            return {
              interpretation: "Mild anxiety symptoms",
              recommendation: "self-care",
            };
          } else if (score <= 14) {
            return {
              interpretation: "Moderate anxiety symptoms",
              recommendation: "counselor",
            };
          } else {
            return {
              interpretation: "Severe anxiety symptoms",
              recommendation: "counselor",
            };
          }
        }
      },
    }),
    {
      name: STORAGE_KEYS.screeningResults,
    }
  )
);