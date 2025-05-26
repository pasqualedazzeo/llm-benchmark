"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VariableIcon, EditIcon, CheckIcon, AlertCircleIcon } from "lucide-react";

interface VariablesModalProps {
  isOpen: boolean;
  onClose: () => void;
  variables: string[];
  variableValues: Record<string, string>;
  onValueChange: (variableName: string, value: string) => void;
  onSave: () => void;
}

const VariablesModal: React.FC<VariablesModalProps> = ({
  isOpen,
  onClose,
  variables,
  variableValues,
  onValueChange,
  onSave,
}) => {
  const [expandedVariables, setExpandedVariables] = useState<Set<string>>(new Set());

  const toggleVariableExpanded = (variableName: string) => {
    const newExpanded = new Set(expandedVariables);
    if (newExpanded.has(variableName)) {
      newExpanded.delete(variableName);
    } else {
      newExpanded.add(variableName);
    }
    setExpandedVariables(newExpanded);
  };

  const allVariablesFilled = variables.every(variable => 
    variableValues[variable] && variableValues[variable].trim() !== ""
  );

  const filledCount = variables.filter(variable => 
    variableValues[variable] && variableValues[variable].trim() !== ""
  ).length;

  const handleSave = () => {
    onSave();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <VariableIcon className="h-5 w-5" />
            <span>Configure Prompt Variables</span>
          </DialogTitle>
          <DialogDescription>
            Set values for all variables in your prompt. Variables are defined using {`{{variableName}}`} syntax.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {/* Status Card */}
              <Card className={`border-2 ${allVariablesFilled ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {allVariablesFilled ? (
                        <CheckIcon className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircleIcon className="h-5 w-5 text-orange-600" />
                      )}
                      <span className={`font-medium ${allVariablesFilled ? 'text-green-800' : 'text-orange-800'}`}>
                        {allVariablesFilled 
                          ? "All variables configured" 
                          : `${variables.length - filledCount} variable${variables.length - filledCount !== 1 ? 's' : ''} remaining`
                        }
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        allVariablesFilled 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {filledCount}/{variables.length}
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          if (expandedVariables.size === variables.length) {
                            setExpandedVariables(new Set());
                          } else {
                            setExpandedVariables(new Set(variables));
                          }
                        }}
                        className="text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 border border-gray-400"
                      >
                        {expandedVariables.size === variables.length ? "Collapse All" : "Expand All"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Variables List */}
              <div className="space-y-4">
                {variables.map((variableName) => {
                  const isExpanded = expandedVariables.has(variableName);
                  const hasValue = variableValues[variableName] && variableValues[variableName].trim() !== "";
                  
                  return (
                    <Card key={variableName} className="border-2 hover:border-primary/20 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className={`w-3 h-3 rounded-full ${
                              hasValue ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            <Label 
                              htmlFor={`var-${variableName}`}
                              className="text-base font-medium flex items-center space-x-2"
                            >
                              <span className="font-mono text-primary">{`{{${variableName}}}`}</span>
                            </Label>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleVariableExpanded(variableName)}
                            className="h-8 w-8 p-0"
                            type="button"
                          >
                            <EditIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        {isExpanded ? (
                          <div className="space-y-3">
                            <Textarea
                              id={`var-${variableName}`}
                              value={variableValues[variableName] || ""}
                              onChange={(e) => onValueChange(variableName, e.target.value)}
                              placeholder={`Enter value for ${variableName}...`}
                              className="min-h-[120px] resize-y"
                              rows={5}
                            />
                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                              <span>Characters: {(variableValues[variableName] || "").length}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleVariableExpanded(variableName)}
                                className="text-xs h-6"
                              >
                                Collapse
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Input
                            id={`var-${variableName}`}
                            value={variableValues[variableName] || ""}
                            onChange={(e) => onValueChange(variableName, e.target.value)}
                            placeholder={`Enter value for ${variableName}...`}
                            className="font-mono"
                          />
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!allVariablesFilled}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckIcon className="h-4 w-4 mr-2" />
            Save Variables
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VariablesModal; 