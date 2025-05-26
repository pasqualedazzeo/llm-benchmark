import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfigPanel from './config-panel'; // Adjust path as necessary
import '@testing-library/jest-dom';

describe('ConfigPanel', () => {
  const mockOnValueChange = vi.fn();

  afterEach(() => {
    mockOnValueChange.mockClear();
  });

  it('should render null if no variables are provided', () => {
    const { container } = render(
      <ConfigPanel
        variables={[]}
        variableValues={{}}
        onValueChange={mockOnValueChange}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render correct number of inputs and labels for given variables', () => {
    const variables = ['name', 'age', 'location'];
    render(
      <ConfigPanel
        variables={variables}
        variableValues={{}}
        onValueChange={mockOnValueChange}
      />
    );

    expect(screen.getByRole('heading', { name: /Prompt Variables/i })).toBeInTheDocument();
    variables.forEach((variable) => {
      expect(screen.getByLabelText(variable)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(`Enter value for ${variable}`)).toBeInTheDocument();
    });
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(variables.length);
  });

  it('should display correct initial values in input fields', () => {
    const variables = ['name', 'city'];
    const variableValues = { name: 'Alice', city: 'New York' };
    render(
      <ConfigPanel
        variables={variables}
        variableValues={variableValues}
        onValueChange={mockOnValueChange}
      />
    );

    expect(screen.getByLabelText('name')).toHaveValue('Alice');
    expect(screen.getByLabelText('city')).toHaveValue('New York');
  });
  
  it('should display empty string for variables present in variables prop but not in variableValues', () => {
    const variables = ['name', 'undefinedCity'];
    const variableValues = { name: 'Alice' }; // undefinedCity is not in variableValues
    render(
      <ConfigPanel
        variables={variables}
        variableValues={variableValues}
        onValueChange={mockOnValueChange}
      />
    );
    expect(screen.getByLabelText('name')).toHaveValue('Alice');
    expect(screen.getByLabelText('undefinedCity')).toHaveValue('');
  });


  it('should call onValueChange with correct arguments when an input value changes', () => {
    const variables = ['variable1', 'variable2'];
    render(
      <ConfigPanel
        variables={variables}
        variableValues={{ variable1: 'initial1', variable2: 'initial2' }}
        onValueChange={mockOnValueChange}
      />
    );

    const input1 = screen.getByLabelText('variable1');
    fireEvent.change(input1, { target: { value: 'newValue1' } });
    expect(mockOnValueChange).toHaveBeenCalledTimes(1);
    expect(mockOnValueChange).toHaveBeenCalledWith('variable1', 'newValue1');

    const input2 = screen.getByLabelText('variable2');
    fireEvent.change(input2, { target: { value: 'newValue2' } });
    expect(mockOnValueChange).toHaveBeenCalledTimes(2);
    expect(mockOnValueChange).toHaveBeenCalledWith('variable2', 'newValue2');
  });
  
  it('should render labels and inputs correctly even if variableValues is initially empty', () => {
    const variables = ['country', 'language'];
    render(
      <ConfigPanel
        variables={variables}
        variableValues={{}} // Empty initial values
        onValueChange={mockOnValueChange}
      />
    );

    variables.forEach((variable) => {
      const inputElement = screen.getByLabelText(variable);
      expect(inputElement).toBeInTheDocument();
      expect(inputElement).toHaveValue(''); // Inputs should be empty
      expect(screen.getByPlaceholderText(`Enter value for ${variable}`)).toBeInTheDocument();
    });

    // Test interaction
    const countryInput = screen.getByLabelText('country');
    fireEvent.change(countryInput, { target: { value: 'France' } });
    expect(mockOnValueChange).toHaveBeenCalledWith('country', 'France');
  });
});
