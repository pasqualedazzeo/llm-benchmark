"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ConfigPanelProps {
  variables: string[];
  variableValues: Record<string, string>;
  onValueChange: (variableName: string, value: string) => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({
  variables,
  variableValues,
  onValueChange,
}) => {
  if (variables.length === 0) {
    return null;
  }

  return (
    <div className="p-4 border rounded-md bg-muted/30 space-y-4">
      <h3 className="text-lg font-semibold mb-3">Prompt Variables</h3>
      {variables.map((variableName) => (
        <div key={variableName} className="space-y-2">
          <Label htmlFor={`var-${variableName}`}>{variableName}</Label>
          <Input
            id={`var-${variableName}`}
            value={variableValues[variableName] || ""}
            onChange={(e) => onValueChange(variableName, e.target.value)}
            placeholder={`Enter value for ${variableName}`}
            className="mt-1"
          />
        </div>
      ))}
    </div>
  );
};

export default ConfigPanel;
