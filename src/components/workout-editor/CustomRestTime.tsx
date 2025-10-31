"use client";

import React, { useState } from "react";
import { WorkoutExercise } from "@/types";
import { Clock, Zap, Target, Pause } from "lucide-react";

interface CustomRestTimeProps {
  exercise: WorkoutExercise;
  onUpdate: (exercise: WorkoutExercise) => void;
}

const restTimePresets = [
  { duration: 30, label: "30s", type: "quick", description: "Cardio/endurance", icon: Zap },
  { duration: 60, label: "1m", type: "moderate", description: "Light weights", icon: Target },
  { duration: 90, label: "1.5m", type: "standard", description: "Moderate weights", icon: Clock },
  { duration: 120, label: "2m", type: "strength", description: "Heavy compounds", icon: Pause },
  { duration: 180, label: "3m", type: "power", description: "Max effort", icon: Target },
  { duration: 300, label: "5m", type: "recovery", description: "Between exercises", icon: Pause }
];

export default function CustomRestTime({ exercise, onUpdate }: CustomRestTimeProps) {
  const [customTime, setCustomTime] = useState(exercise.restTime || 120);
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  const handlePresetSelect = (duration: number) => {
    onUpdate({
      ...exercise,
      restTime: duration
    });
    setCustomTime(duration);
    setShowCustomInput(false);
  };
  
  const handleCustomTimeChange = (value: number) => {
    setCustomTime(value);
    onUpdate({
      ...exercise,
      restTime: value
    });
  };
  
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 120) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 60)}m`;
  };
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case "quick": return "bg-red-500 text-white";
      case "moderate": return "bg-yellow-500 text-white";
      case "standard": return "bg-blue-500 text-white";
      case "strength": return "bg-green-500 text-white";
      case "power": return "bg-purple-500 text-white";
      case "recovery": return "bg-gray-500 text-white";
      default: return "bg-gray-400 text-white";
    }
  };
  
  const getRecommendation = () => {
    const weight = exercise.weight || 0;
    const reps = typeof exercise.reps === 'number' ? exercise.reps : parseInt(exercise.reps);
    
    // High intensity (heavy weight, low reps) = longer rest
    if (reps <= 5 && weight > 0) {
      return { recommended: 180, reason: "Heavy compound movement" };
    }
    // Moderate intensity = standard rest
    if (reps <= 12) {
      return { recommended: 120, reason: "Strength training" };
    }
    // High reps = shorter rest
    return { recommended: 60, reason: "Endurance/conditioning" };
  };
  
  const recommendation = getRecommendation();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-linear-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Rest Time</h3>
          <p className="text-sm text-gray-600">Customize recovery between sets</p>
        </div>
      </div>
      
      {/* Current Setting */}
      <div className="bg-blue-50 rounded-xl p-4 mb-6 text-center">
        <div className="text-3xl font-bold text-blue-600 mb-1">
          {formatTime(exercise.restTime || 120)}
        </div>
        <div className="text-sm text-blue-600 font-medium">Current Rest Time</div>
      </div>
      
      {/* AI Recommendation */}
      <div className="bg-linear-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-semibold text-purple-700">AI Recommendation</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-purple-700">
              {formatTime(recommendation.recommended)}
            </div>
            <div className="text-xs text-purple-600">{recommendation.reason}</div>
          </div>
          <button
            onClick={() => handlePresetSelect(recommendation.recommended)}
            className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
      
      {/* Preset Options */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Presets</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {restTimePresets.map((preset) => {
            const Icon = preset.icon;
            const isSelected = (exercise.restTime || 120) === preset.duration;
            
            return (
              <button
                key={preset.duration}
                onClick={() => handlePresetSelect(preset.duration)}
                className={`p-3 rounded-xl border-2 transition-all text-left ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${getTypeColor(preset.type)}`}>
                    <Icon className="w-3 h-3" />
                  </div>
                  <span className="font-bold text-gray-900">{preset.label}</span>
                </div>
                <div className="text-xs text-gray-600">{preset.description}</div>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Custom Time Input */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-700">Custom Time</h4>
          <button
            onClick={() => setShowCustomInput(!showCustomInput)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {showCustomInput ? 'Hide' : 'Set Custom'}
          </button>
        </div>
        
        {showCustomInput && (
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="space-y-4">
              {/* Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">Duration</label>
                  <span className="text-sm text-gray-500">{formatTime(customTime)}</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="600"
                  step="15"
                  value={customTime}
                  onChange={(e) => handleCustomTimeChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>15s</span>
                  <span>10m</span>
                </div>
              </div>
              
              {/* Number Input */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">Minutes</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={Math.floor(customTime / 60)}
                    onChange={(e) => {
                      const minutes = parseInt(e.target.value) || 0;
                      const seconds = customTime % 60;
                      handleCustomTimeChange(minutes * 60 + seconds);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">Seconds</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={customTime % 60}
                    onChange={(e) => {
                      const seconds = parseInt(e.target.value) || 0;
                      const minutes = Math.floor(customTime / 60);
                      handleCustomTimeChange(minutes * 60 + seconds);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Rest Time Tips */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
        <h5 className="text-sm font-semibold text-yellow-800 mb-2">💡 Rest Time Guidelines</h5>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>• <strong>Strength (1-5 reps):</strong> 2-5 minutes</li>
          <li>• <strong>Hypertrophy (6-12 reps):</strong> 1-3 minutes</li>
          <li>• <strong>Endurance (13+ reps):</strong> 30-90 seconds</li>
          <li>• <strong>Compound movements:</strong> Longer rest needed</li>
        </ul>
      </div>
    </div>
  );
}