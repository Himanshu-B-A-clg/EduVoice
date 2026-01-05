import { motion } from 'framer-motion';
import { X, Volume2, BookOpen, Sparkles } from 'lucide-react';

const AssistPopover = ({ data, onClose, onHearIt, isSpeaking }) => {
  const { word, simplification, type } = data;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-30"
      onClick={onClose}
    >
      <motion.div
        className="card max-w-lg w-full bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="assist-title"
        aria-describedby="assist-description"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-accent-100 p-3 rounded-2xl">
              <Sparkles className="h-6 w-6 text-accent-500" />
            </div>
            <div>
              <h3 id="assist-title" className="text-2xl font-bold text-gray-800">
                Let's help with this word
              </h3>
              <p className="text-sm text-gray-500 capitalize">
                {type === 'manual' ? 'You asked for help' : `${type} detected`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label="Close assist popover"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Original Word */}
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
          <div className="text-sm font-medium text-red-700 mb-1">Difficult word:</div>
          <div className="text-3xl font-bold text-red-600">{word}</div>
        </div>

        {/* Simplified Alternative */}
        <div className="mb-6 p-4 bg-success-50 border-2 border-success-200 rounded-2xl">
          <div className="text-sm font-medium text-success-700 mb-1">Try this instead:</div>
          <div className="text-3xl font-bold text-success-600">
            {simplification?.simplified || 'simpler word'}
          </div>
        </div>

        {/* Explanation */}
        <div id="assist-description" className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-primary-500" />
            <h4 className="text-lg font-semibold text-gray-800">What it means:</h4>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed">
            {simplification?.explanation || 'A simpler way to understand this word.'}
          </p>
        </div>

        {/* Example Sentence */}
        {simplification?.example && (
          <div className="mb-6 p-4 bg-calm-50 border-l-4 border-calm-400 rounded-lg">
            <div className="text-sm font-medium text-calm-700 mb-1">Example:</div>
            <p className="text-lg text-gray-700 italic leading-relaxed">
              "{simplification.example}"
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => onHearIt(simplification?.example || simplification?.simplified || word)}
            className={`btn flex-1 ${isSpeaking ? 'btn-secondary' : 'btn-primary'}`}
            aria-label={isSpeaking ? 'Stop speaking' : 'Hear the example'}
          >
            <Volume2 className={`h-5 w-5 mr-2 ${isSpeaking ? 'mic-pulse' : ''}`} />
            {isSpeaking ? 'Stop' : 'Hear It'}
          </button>

          <button
            onClick={onClose}
            className="btn btn-success flex-1"
          >
            Got It!
          </button>
        </div>

        {/* Note for mock data */}
        {simplification?.note && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              ℹ️ {simplification.note}
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AssistPopover;
