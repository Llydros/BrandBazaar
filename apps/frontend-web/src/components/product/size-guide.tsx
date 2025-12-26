"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Ruler, Footprints, Info, CheckCircle } from "lucide-react";

export function SizeGuide() {
  // Size conversion chart for US shoe sizes
  const sizeChart = [
    { us: "5", uk: "3", eu: "35", cm: "22.5", inches: "8.9" },
    { us: "5.5", uk: "3.5", eu: "36", cm: "23.0", inches: "9.1" },
    { us: "6", uk: "4", eu: "37", cm: "23.5", inches: "9.3" },
    { us: "6.5", uk: "4.5", eu: "37.5", cm: "24.0", inches: "9.4" },
    { us: "7", uk: "5", eu: "38", cm: "24.5", inches: "9.6" },
    { us: "7.5", uk: "5.5", eu: "39", cm: "25.0", inches: "9.8" },
    { us: "8", uk: "6", eu: "39.5", cm: "25.5", inches: "10.0" },
    { us: "8.5", uk: "6.5", eu: "40", cm: "26.0", inches: "10.2" },
    { us: "9", uk: "7", eu: "41", cm: "26.5", inches: "10.4" },
    { us: "9.5", uk: "7.5", eu: "42", cm: "27.0", inches: "10.6" },
    { us: "10", uk: "8", eu: "42.5", cm: "27.5", inches: "10.8" },
    { us: "10.5", uk: "8.5", eu: "43", cm: "28.0", inches: "11.0" },
    { us: "11", uk: "9", eu: "44", cm: "28.5", inches: "11.2" },
    { us: "11.5", uk: "9.5", eu: "44.5", cm: "29.0", inches: "11.4" },
    { us: "12", uk: "10", eu: "45", cm: "29.5", inches: "11.6" },
    { us: "12.5", uk: "10.5", eu: "45.5", cm: "30.0", inches: "11.8" },
    { us: "13", uk: "11", eu: "46", cm: "30.5", inches: "12.0" },
  ];

  const tips = [
    "Measure your foot in the evening when feet are largest",
    "Stand on a piece of paper and trace your foot",
    "Measure from heel to longest toe",
    "Add 0.5-1cm for comfort room",
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-sm text-info font-mono hover:underline mt-1 flex items-center gap-1"
        >
          <Ruler className="w-3 h-3" />
          Need help with sizing? View Size Guide
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Footprints className="w-6 h-6 text-blue-600" />
            Sizing Guide
          </DialogTitle>
          <DialogDescription className="text-base pt-2"></DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Size Conversion Chart */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
              Size Conversion Chart
            </h3>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                        US
                      </th>
                      <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                        UK
                      </th>
                      <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                        EU
                      </th>
                      <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                        CM
                      </th>
                      <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                        Inches
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizeChart.map((size, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 font-medium text-gray-900 dark:text-gray-100">
                          {size.us}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-700 dark:text-gray-300">
                          {size.uk}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-700 dark:text-gray-300">
                          {size.eu}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-700 dark:text-gray-300">
                          {size.cm}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-700 dark:text-gray-300">
                          {size.inches}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* How to Measure Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
              <Info className="w-5 h-5" />
              How to Measure Your Foot
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tips.map((tip, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-sm text-blue-800 dark:text-blue-200"
                >
                  <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
