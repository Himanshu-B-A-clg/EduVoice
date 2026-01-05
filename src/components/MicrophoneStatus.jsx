import { motion } from 'framer-motion';
import { Mic, MicOff, Loader2, CheckCircle2, XCircle } from 'lucide-react';

const MicrophoneStatus = ({ isActive, isProcessing, hasPermission, transcript }) => {
  const getStatusConfig = () => {
    if (!hasPermission) {
      return {
        icon: MicOff,
        text: 'Permission needed',
        color: 'gray',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-700',
        borderColor: 'border-gray-300',
      };
    }

    if (isProcessing) {
      return {
        icon: Loader2,
        text: 'Processing...',
        color: 'primary',
        bgColor: 'bg-primary-100',
        textColor: 'text-primary-700',
        borderColor: 'border-primary-300',
        animate: true,
      };
    }

    if (isActive) {
      return {
        icon: Mic,
        text: 'Listening',
        color: 'success',
        bgColor: 'bg-success-100',
        textColor: 'text-success-700',
        borderColor: 'border-success-300',
        pulse: true,
      };
    }

    return {
      icon: MicOff,
      text: 'Not listening',
      color: 'gray',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-600',
      borderColor: 'border-gray-300',
    };
  };

  const status = getStatusConfig();
  const Icon = status.icon;

  return (
    <div className={`card border-2 ${status.borderColor} ${status.bgColor}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="relative">
          {status.pulse && (
            <motion.div
              className="absolute inset-0 rounded-full bg-success-300"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
          <Icon
            className={`h-6 w-6 ${status.textColor} ${status.animate ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
        </div>
        <div>
          <div className="text-sm font-medium text-gray-600">Microphone</div>
          <div className={`text-lg font-bold ${status.textColor}`}>
            {status.text}
          </div>
        </div>
      </div>

      {/* Waveform visualization when active */}
      {isActive && !isProcessing && (
        <div className="flex items-center justify-center gap-1 h-8 mt-2">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-success-500 rounded-full"
              animate={{
                height: ['20%', '100%', '20%'],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.1,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}

      {/* Permission status indicator */}
      {hasPermission && (
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
          <CheckCircle2 className="h-3 w-3 text-success-500" />
          Permission granted
        </div>
      )}
    </div>
  );
};

export default MicrophoneStatus;
