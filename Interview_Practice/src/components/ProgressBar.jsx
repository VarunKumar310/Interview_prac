import { useInterview } from '../utils/InterviewContext.jsx';

// Define the steps in order (exactly matches your flow)
const STEPS = [
  { id: 'login',            label: 'Login' },
  { id: 'role',             label: 'Role' },
  { id: 'experience',       label: 'Experience' },
  { id: 'difficulty',       label: 'Difficulty' },
  { id: 'resume',           label: 'Resume' },
  { id: 'build-resume',     label: 'Build Resume' },
  { id: 'briefing',         label: 'Briefing' },
  { id: 'interview',        label: 'Interview' },
  { id: 'summary',          label: 'Feedback' },
];

export default function ProgressBar() {
  const {
    selectedRole,
    experienceLevel,
    difficulty,
    resumeText,
    chatLogs,
    interviewEnded
  } = useInterview();

  // Determine current step based on what user has filled
  let currentStep = 0;

  if (interviewEnded) {
    currentStep = STEPS.length - 1; // Summary
  } else if (chatLogs.length > 0) {
    currentStep = 7; // Interview (index 7)
  } else if (selectedRole && experienceLevel && difficulty && resumeText) {
    currentStep = 6; // Briefing room
  } else if (resumeText) {
    currentStep = 5; // Build Resume done
  } else if (selectedRole && experienceLevel && difficulty) {
    currentStep = 4; // Resume upload page
  } else if (selectedRole && experienceLevel) {
    currentStep = 3; // Difficulty
  } else if (selectedRole) {
    currentStep = 2; // Experience
  } else if (selectedRole === '') {
    currentStep = 1; // Role selector (after login)
  } else {
    currentStep = 0; // Login
  }

  const progressPercentage = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Desktop & Tablet: Horizontal bar */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between relative">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center z-10">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500
                  ${index <= currentStep
                    ? 'bg-blue-600 text-white shadow-lg scale-110'
                    : 'bg-gray-300 text-gray-600'
                  }`}
              >
                {index < currentStep ? '✓' : index + 1}
              </div>
              <p className={`mt-2 text-xs font-medium whitespace-nowrap
                ${index <= currentStep ? 'text-blue-600' : 'text-gray-500'}
              `}>
                {step.label}
              </p>
            </div>
          ))}

          {/* Progress line */}
          <div className="absolute top-6 left-0 right-0 h-1 -z-10">
            <div
              className="h-full bg-blue-600 transition-all duration-700 ease-in-out rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
            <div className="h-full bg-gray-300 rounded-full" />
          </div>
        </div>
      </div>

      {/* Mobile: Simple percentage + current step */}
      <div className="md:hidden flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Step {currentStep + 1} of {STEPS.length}</p>
          <p className="text-lg font-semibold text-blue-600">
            {STEPS[currentStep].label}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">
            {Math.round(progressPercentage)}%
          </div>
        </div>
      </div>

      {/* Mobile progress bar */}
      <div className="md:hidden mt-3 h-3 bg-gray-300 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-700 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}