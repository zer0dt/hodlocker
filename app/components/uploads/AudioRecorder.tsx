import { useEffect, useState } from 'react';
import { AudioRecorder } from 'react-audio-voice-recorder';

export default function AudioRecorderComponent() {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleRecordingComplete = (blob) => {
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);
  };

  return (
    <div className="mb-4">
      <AudioRecorder 
        onRecordingComplete={handleRecordingComplete}
        audioTrackConstraints={{
          noiseSuppression: true,
          echoCancellation: true,
        }} 
        downloadOnSavePress={true}
        downloadFileExtension="webm"
        showVisualizer={true}
      />
      {audioUrl && <audio src={audioUrl} controls />}
    </div>
  );
}