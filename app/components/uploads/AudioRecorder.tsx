import { useEffect } from 'react';
import { AudioRecorder, useAudioRecorder } from 'react-audio-voice-recorder';
import { CiCircleRemove } from 'react-icons/ci';

interface AudioRecorderProps {
  audioUrl: string | null;
  setAudioUrl: React.Dispatch<React.SetStateAction<string | null>>;
}

function convertAudioToBase64(audioBlob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create a new FileReader
    const reader = new FileReader();

    // Set up onload event for the reader
    reader.onload = () => {
      // Convert the ArrayBuffer to a Base64 string
      const base64String = reader.result as string;
      resolve(base64String.split(',')[1]);
    };

    // Set up onerror event for the reader
    reader.onerror = () => {
      reject(new Error('Failed to read the audio file'));
    };

    // Read the audio file as a data URL
    reader.readAsDataURL(audioBlob);
  });
}

export default function AudioRecorderComponent({
  audioUrl,
  setAudioUrl,
}: AudioRecorderProps) {
  const recorderControls = useAudioRecorder();

  const handleRecordingComplete = (blob) => {
    convertAudioToBase64(blob)
      .then((base64String) => {
        const fullBase64String = `data:audio/webm;base64,${base64String}`;
        console.log('Base64 audio:', fullBase64String);
        // Now you can use the Base64 string as needed
        setAudioUrl(fullBase64String);
      })
      .catch((error) => {
        console.error('Error converting audio to Base64:', error);
      });
};

  const handleDeleteRecording = () => {
    setAudioUrl(null); // Reset audioUrl to remove the recorded audio clip
  };

  useEffect(() => {
    // Check if recording is in progress
    if (recorderControls.isRecording) {
      // Start a timer to stop the recording after 90 seconds
      const timeoutId = setTimeout(() => {
        // Stop the recording
        recorderControls.stopRecording();
      }, 60 * 1000); // 90 seconds in milliseconds

      // Clean up the timer if the recording is stopped manually
      return () => clearTimeout(timeoutId);
    }
  }, [recorderControls.isRecording]);

  return (
    <div className="mb-4 items-center flex justify-between">
      <AudioRecorder
        onRecordingComplete={handleRecordingComplete}
        recorderControls={recorderControls}
        audioTrackConstraints={{
          noiseSuppression: true,
          echoCancellation: true,
        }}
        downloadOnSavePress={false}
        downloadFileExtension="webm"
        showVisualizer={true}
      />
      <div className="flex justify-center">
        {audioUrl && <audio className="flex justify-start" src={audioUrl} controls />}
      </div>
      <div className="justify-end">
        {audioUrl && (
          <CiCircleRemove
            className="lock-icon h-6 w-6 cursor-pointer flex justify-end"
            onClick={handleDeleteRecording}
          />
        )}
      </div>
    </div>
  );
}
