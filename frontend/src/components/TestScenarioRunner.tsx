import React, { useState } from 'react';
import { PlayCircle, CheckCircle2, AlertCircle } from 'lucide-react';

interface TestScenarioRunnerProps {
  onHallCall: (floor: number, direction: 'UP' | 'DOWN') => void;
  onCarCall: (carId: string, floor: number) => void;
  onReset: () => void;
}

export const TestScenarioRunner: React.FC<TestScenarioRunnerProps> = ({
  onHallCall,
  onCarCall,
  onReset
}) => {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const runInterviewScenario = () => {
    onReset();
    setActiveStep(1);

    setTimeout(() => {
      // 1. Passenger boards Car 1 at Floor 1 and presses Floor 10
      onCarCall('1', 10);
      setActiveStep(2);
    }, 1000);

    setTimeout(() => {
      // 2. While Car 1 is moving UP, Passenger at Floor 5 presses UP and DOWN
      onHallCall(5, 'UP');
      onHallCall(5, 'DOWN');
      setActiveStep(3);
    }, 2500);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-300 flex items-center gap-2">
          <PlayCircle className="w-4 h-4 text-emerald-400" />
          Automated Interview Test Case Demonstrator
        </h2>
        <button
          onClick={runInterviewScenario}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
        >
          <PlayCircle className="w-4 h-4" /> Run Interview Scenario
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 text-xs">
        <div
          className={`p-3 rounded-lg border ${
            activeStep === 1
              ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200'
              : 'border-slate-800 bg-slate-950 text-slate-400'
          }`}
        >
          <div className="font-bold flex items-center gap-1.5 mb-1 text-slate-200">
            {activeStep && activeStep > 1 ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
            )}
            Step 1: Initiation
          </div>
          <p className="text-[11px] leading-relaxed">
            Reset simulation. Elevator 1 departs Floor 1 destined for Floor 10.
          </p>
        </div>

        <div
          className={`p-3 rounded-lg border ${
            activeStep === 2
              ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200'
              : 'border-slate-800 bg-slate-950 text-slate-400'
          }`}
        >
          <div className="font-bold flex items-center gap-1.5 mb-1 text-slate-200">
            {activeStep && activeStep > 2 ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
            )}
            Step 2: Concurrent Calls at Floor 5
          </div>
          <p className="text-[11px] leading-relaxed">
            Call Floor 5 UP and Floor 5 DOWN simultaneously while elevator is climbing.
          </p>
        </div>

        <div
          className={`p-3 rounded-lg border ${
            activeStep === 3
              ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200'
              : 'border-slate-800 bg-slate-950 text-slate-400'
          }`}
        >
          <div className="font-bold flex items-center gap-1.5 mb-1 text-slate-200">
            {activeStep && activeStep === 3 ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
            )}
            Step 3: Verification
          </div>
          <p className="text-[11px] leading-relaxed">
            Verify car stops at Floor 5 for UP, continues to 10, then serves Floor 5 DOWN on reverse run.
          </p>
        </div>
      </div>
    </div>
  );
};
