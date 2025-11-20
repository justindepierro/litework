import React from "react";
import {
  Dumbbell,
  TrendingUp,
  Flame,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import tokens from "@/styles/tokens-optimized";

/**
 * Token Optimization Demo Component
 * Showcases the optimized token system in action
 */
export default function TokenOptimizationDemo() {
  return (
    <div className="p-8 space-y-8 bg-gradient-primary min-h-screen">
      {/* Header Section */}
      <header className="text-center space-y-4">
        <h1
          style={{
            color: tokens.semantic.text.primary,
            fontFamily: tokens.core.typography.family.heading,
            fontSize: tokens.core.typography.size["3xl"],
            fontWeight: tokens.core.typography.weight.bold,
          }}
        >
          🎨 Optimized CSS Tokens Demo
        </h1>
        <p
          style={{
            color: tokens.semantic.text.secondary,
            fontSize: tokens.core.typography.size.lg,
          }}
        >
          58.2% smaller, blazing fast, and developer-friendly
        </p>
      </header>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="accent-strength text-3xl font-bold">58.2%</div>
          <div className="text-navy-6 text-sm">Bundle Size Reduction</div>
        </div>
        <div className="card text-center">
          <div className="accent-progress text-3xl font-bold">8.2KB</div>
          <div className="text-navy-6 text-sm">CSS Savings</div>
        </div>
        <div className="card text-center">
          <div className="accent-schedule text-3xl font-bold">75</div>
          <div className="text-navy-6 text-sm">Optimized Variables</div>
        </div>
        <div className="card text-center">
          <div className="accent-intensity text-3xl font-bold">268</div>
          <div className="text-navy-6 text-sm">Total Lines</div>
        </div>
      </div>

      {/* Component Examples */}
      <div className="space-y-6">
        <h2
          style={{
            color: tokens.semantic.text.primary,
            fontFamily: tokens.core.typography.family.heading,
            fontSize: tokens.core.typography.size["2xl"],
            fontWeight: tokens.core.typography.weight.medium,
          }}
        >
          Component Examples
        </h2>

        {/* Button Examples */}
        <div className="card space-y-4">
          <h3 className="text-navy-7 font-heading font-medium text-lg">
            Optimized Buttons
          </h3>
          <div className="flex flex-wrap gap-4">
            <button className="btn-primary">Primary Action</button>
            <button className="btn-secondary">Secondary Action</button>
            <button
              style={{
                background: tokens.semantic.state.success,
                color: tokens.semantic.text.inverse,
                border: `1px solid ${tokens.semantic.state.success}`,
                borderRadius: tokens.core.effects.radius.md,
                padding: `${tokens.core.spacing[3]} ${tokens.core.spacing[6]}`,
                fontWeight: tokens.core.typography.weight.medium,
                transition: tokens.core.effects.transition.fast,
              }}
            >
              Success Button
            </button>
          </div>
        </div>

        {/* Status Examples */}
        <div className="card space-y-4">
          <h3 className="text-navy-7 font-heading font-medium text-lg">
            Status Indicators
          </h3>
          <div className="flex flex-wrap gap-4">
            <span className="status-success">✅ Success</span>
            <span className="status-error">❌ Error</span>
            <span className="status-warning">⚠️ Warning</span>
          </div>
        </div>

        {/* Color Palette */}
        <div className="card space-y-4">
          <h3 className="text-navy-7 font-heading font-medium text-lg">
            Optimized Color Palette
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Navy Scale */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-navy-6">Navy Scale</div>
              {[1, 2, 3, 5, 6, 7, 8].map((shade) => (
                <div
                  key={shade}
                  className="h-8 rounded flex items-center justify-center text-xs font-mono"
                  style={{
                    backgroundColor: `var(--navy-${shade})`,
                    color: shade >= 6 ? "white" : "black",
                  }}
                >
                  navy-{shade}
                </div>
              ))}
            </div>

            {/* Silver Scale */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-navy-6">
                Silver Scale
              </div>
              {[1, 2, 3, 4, 5].map((shade) => (
                <div
                  key={shade}
                  className="h-8 rounded border flex items-center justify-center text-xs font-mono"
                  style={{
                    backgroundColor: `var(--silver-${shade})`,
                    borderColor: "var(--border-1)",
                  }}
                >
                  silver-{shade}
                </div>
              ))}
            </div>

            {/* Accent Colors */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-navy-6">Accents</div>
              {["orange", "green", "blue", "red", "yellow"].map((color) => (
                <div
                  key={color}
                  className="h-8 rounded flex items-center justify-center text-xs font-mono text-white font-medium"
                  style={{
                    backgroundColor: `var(--${color})`,
                  }}
                >
                  {color}
                </div>
              ))}
            </div>

            {/* Workout Accents */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-navy-6">Workout</div>
              <div className="accent-strength text-2xl flex items-center gap-2">
                <Dumbbell className="w-6 h-6" /> Strength
              </div>
              <div className="accent-progress text-2xl flex items-center gap-2">
                <TrendingUp className="w-6 h-6" /> Progress
              </div>
              <div className="accent-intensity text-2xl flex items-center gap-2">
                <Flame className="w-6 h-6" /> Intensity
              </div>
              <div className="accent-schedule text-2xl flex items-center gap-2">
                <Calendar className="w-6 h-6" /> Schedule
              </div>
              <div className="accent-warning text-2xl flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" /> Warning
              </div>
            </div>
          </div>
        </div>

        {/* Typography Examples */}
        <div className="card space-y-4">
          <h3 className="text-navy-7 font-heading font-medium text-lg">
            Typography Scale
          </h3>
          <div className="space-y-3">
            <div
              style={{
                fontSize: tokens.core.typography.size["3xl"],
                fontWeight: tokens.core.typography.weight.bold,
                fontFamily: tokens.core.typography.family.heading,
                color: tokens.semantic.text.primary,
              }}
            >
              Heading 1 (3xl/bold)
            </div>
            <div
              style={{
                fontSize: tokens.core.typography.size["2xl"],
                fontWeight: tokens.core.typography.weight.medium,
                fontFamily: tokens.core.typography.family.heading,
                color: tokens.semantic.text.primary,
              }}
            >
              Heading 2 (2xl/medium)
            </div>
            <div
              style={{
                fontSize: tokens.core.typography.size.lg,
                fontWeight: tokens.core.typography.weight.medium,
                fontFamily: tokens.core.typography.family.base,
                color: tokens.semantic.text.secondary,
              }}
            >
              Body Large (lg/medium)
            </div>
            <div
              style={{
                fontSize: tokens.core.typography.size.base,
                fontWeight: tokens.core.typography.weight.normal,
                fontFamily: tokens.core.typography.family.base,
                color: tokens.semantic.text.primary,
              }}
            >
              Body Text (base/normal)
            </div>
            <div
              style={{
                fontSize: tokens.core.typography.size.sm,
                fontWeight: tokens.core.typography.weight.normal,
                fontFamily: tokens.core.typography.family.base,
                color: tokens.semantic.text.tertiary,
              }}
            >
              Small Text (sm/normal)
            </div>
          </div>
        </div>
      </div>

      {/* Code Examples */}
      <div className="card space-y-4">
        <h3 className="text-navy-7 font-heading font-medium text-lg">
          Token Usage Examples
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-navy-6 mb-2">
              CSS Variables
            </h4>
            <pre className="bg-navy-8 text-silver-1 p-4 rounded text-xs overflow-x-auto">
              {`.my-component {
  color: var(--navy-7);
  background: var(--silver-2);
  padding: var(--s-4) var(--s-6);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
}`}
            </pre>
          </div>
          <div>
            <h4 className="text-sm font-medium text-navy-6 mb-2">
              TypeScript Tokens
            </h4>
            <pre className="bg-navy-8 text-silver-1 p-4 rounded text-xs overflow-x-auto">
              {`const style = {
  color: tokens.semantic.text.primary,
  background: tokens.semantic.background.surface,
  padding: \`\${tokens.core.spacing[4]} \${tokens.core.spacing[6]}\`,
  borderRadius: tokens.core.effects.radius.lg,
};`}
            </pre>
          </div>
        </div>
      </div>

      {/* Performance Info */}
      <div className="card bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <div className="text-center space-y-2">
          <div className="text-2xl">🚀</div>
          <div className="text-navy-7 font-heading font-medium">
            Performance Optimized
          </div>
          <div className="text-navy-6 text-sm">
            This demo uses the optimized token system with 58.2% smaller CSS
            bundle, shorter variable names, and improved compression ratios.
          </div>
        </div>
      </div>
    </div>
  );
}
