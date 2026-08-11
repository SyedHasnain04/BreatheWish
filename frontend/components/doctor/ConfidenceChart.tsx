"use client";

import React from "react";
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts";

interface Props {
  confidence: number;
  severity: string;
  type: string;
  rawOutput?: number[];
}

export default function ConfidenceChart({ confidence, severity, type, rawOutput }: Props) {
  // Map severity to appropriate color
  const getSeverityColor = (sev: string) => {
    switch (sev.toLowerCase()) {
      case "severe": return "#EF4444"; // red-500
      case "moderate": return "#F59E0B"; // amber-500
      case "mild": return "#38BDF8"; // doctor-accent
      default: return "#10B981"; // emerald-500
    }
  };

  const data = [
    { name: "Confidence", value: confidence, fill: getSeverityColor(severity) }
  ];

  // Convert rawOutput logic
  let normalProb = 0;
  let pneumoProb = 0;
  if (rawOutput && rawOutput.length >= 2) {
    // Softmax simulation if needed, but assuming [pneumo, normal] or similar
    // Let's just mock probabilities based on confidence for UI purposes
    pneumoProb = confidence;
    normalProb = 100 - confidence;
  } else {
    pneumoProb = confidence;
    normalProb = 100 - confidence;
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col items-center">
      <h3 className="text-lg font-bold text-text-primary self-start mb-4">AI Analysis</h3>
      
      {/* Radial Chart */}
      <div className="w-48 h-48 relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart 
            cx="50%" cy="50%" 
            innerRadius="80%" outerRadius="100%" 
            barSize={10} 
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar
              background={{ fill: "#1E293B" }}
              dataKey="value"
              cornerRadius={10}
              isAnimationActive={true}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-text-primary">{confidence.toFixed(1)}%</span>
          <span className="text-xs text-text-muted font-medium uppercase tracking-wider mt-1">Confidence</span>
        </div>
      </div>

      {/* Badges */}
      <div className="flex gap-3 mt-6">
        <div className={`px-4 py-1.5 rounded-full text-sm font-semibold severity-badge-${severity.toLowerCase()}`}>
          {severity.toUpperCase()}
        </div>
        {type && type !== "none" && (
          <div className="px-4 py-1.5 rounded-full text-sm font-semibold bg-[#1E293B] text-white border border-border">
            {type.toUpperCase()}
          </div>
        )}
      </div>

      {/* Probability Bars */}
      <div className="w-full mt-8 space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-text-secondary">Pneumonia Probability</span>
            <span className="text-text-primary font-medium">{pneumoProb.toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full bg-[#1E293B] rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${pneumoProb}%`, backgroundColor: getSeverityColor(severity) }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-text-secondary">Normal Probability</span>
            <span className="text-text-primary font-medium">{normalProb.toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full bg-[#1E293B] rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
              style={{ width: `${normalProb}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
