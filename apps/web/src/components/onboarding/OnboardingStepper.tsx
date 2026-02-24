'use client';

import { Check } from 'lucide-react';
import { cn } from '@casalino/ui';

interface StepConfig {
  label: string;
  number: number;
}

const STEPS: StepConfig[] = [
  { label: 'Unternehmensprofil', number: 1 },
  { label: 'Team einladen', number: 2 },
  { label: 'Erste Schritte', number: 3 },
];

interface OnboardingStepperProps {
  currentStep: number;
}

export function OnboardingStepper({ currentStep }: OnboardingStepperProps) {
  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <StepIndicator
            step={step}
            isActive={currentStep === step.number}
            isCompleted={currentStep > step.number}
          />
          {index < STEPS.length - 1 && (
            <div
              className={cn(
                'h-0.5 w-12 sm:w-20',
                currentStep > step.number
                  ? 'bg-[#E8503E]'
                  : 'bg-border',
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

interface StepIndicatorProps {
  step: StepConfig;
  isActive: boolean;
  isCompleted: boolean;
}

function StepIndicator({ step, isActive, isCompleted }: StepIndicatorProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors',
          isCompleted && 'bg-[#E8503E] text-white',
          isActive && 'bg-[#E8503E] text-white',
          !isCompleted && !isActive && 'border-2 border-border bg-background text-muted-foreground',
        )}
      >
        {isCompleted ? (
          <Check className="h-4 w-4" />
        ) : (
          step.number
        )}
      </div>
      <span
        className={cn(
          'text-xs font-medium whitespace-nowrap',
          isActive || isCompleted
            ? 'text-foreground'
            : 'text-muted-foreground',
        )}
      >
        {step.label}
      </span>
    </div>
  );
}
