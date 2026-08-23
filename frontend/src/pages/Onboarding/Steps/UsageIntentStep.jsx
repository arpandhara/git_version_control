import React from 'react';
import codeEditorImg from '../../../assets/img/codeEditor.png';
import versionControlImg from '../../../assets/img/versionControl.png';
import bothImg from '../../../assets/img/bothOnboarding.png';

const UsageIntentStep = ({ intent, setIntent, onNext }) => {
  const options = [
    {
      id: 'version_control',
      title: 'Collaborative Version Control',
      description: 'Track changes, manage branches, and collaborate on repositories.',
      img: versionControlImg
    },
    {
      id: 'code_editor',
      title: 'Collaborative Code Editor',
      description: 'Write code together in real-time with your team.',
      img: codeEditorImg
    },
    {
      id: 'both',
      title: 'Both',
      description: 'Get the full Grust experience with version control and live editing.',
      img: bothImg
    }
  ];

  return (
    <div className="flex flex-col items-center w-full">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-10">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setIntent(option.id)}
            className={`flex flex-col items-center p-6 md:p-8 bg-white border-2 rounded-2xl transition-all duration-200 text-left w-full
              ${intent === option.id
                ? 'border-green-500 bg-green-50/20 ring-4 ring-green-500/10 shadow-lg scale-[1.02]'
                : 'border-gray-100 hover:border-gray-300 hover:shadow-md hover:bg-gray-50/50'
              }`}
          >
            <div className="h-28 md:h-32 mb-4 flex items-center justify-center w-full">
              <img
                src={option.img}
                alt={option.title}
                className="max-h-full max-w-full object-contain mix-blend-multiply"
              />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 w-full text-center">{option.title}</h3>
            <p className="text-sm text-gray-500 text-center leading-relaxed">
              {option.description}
            </p>
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!intent}
        className="group w-full md:w-auto min-w-[200px] bg-black text-white text-sm font-medium py-3 px-8 rounded-full hover:bg-gray-800 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed h-12"
      >
        <span className='text-emerald-500'>$rusty</span>
        <span>Continue</span>
        <svg
          className="w-4 h-4 transform -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default UsageIntentStep;
