/**
 * @fileoverview QuickPomodoroTimer component for a simple, quick Pomodoro timer on the dashboard.
 * This is a streamlined version compared to the full Focus page timer.
 */

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Progress } from "@/components/ui/progress"; // Assuming you have a Progress component

// Define default lengths for focus and break sessions
const DEFAULT_FOCUS_LENGTH = 25; // minutes
const DEFAULT_BREAK_LENGTH = 5; // minutes

export const QuickPomodoroTimer: React.FC = () => {
  const [minutes, setMinutes] = useState(DEFAULT_FOCUS_LENGTH);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [progress, setProgress] = useState(100); // For progress bar
  const totalSecondsRef = useRef(DEFAULT_FOCUS_LENGTH * 60); // Total seconds for current phase

  const audioRef = useRef<HTMLAudioElement | null>(null); // Ref for audio element

  // Effect to handle timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer ends for current phase
            if (audioRef.current) {
              audioRef.current.play(); // Play sound when timer ends
            }

            // Switch phase (Focus -> Break or Break -> Focus)
            let nextIsBreak = !isBreak;
            let nextMinutes = nextIsBreak ? DEFAULT_BREAK_LENGTH : DEFAULT_FOCUS_LENGTH;

            setIsActive(false); // Pause after completion
            setIsBreak(nextIsBreak);
            setMinutes(nextMinutes);
            setSeconds(0);
            totalSecondsRef.current = nextMinutes * 60; // Reset total seconds for new phase
            setProgress(100); // Reset progress

            // Optional: Auto-start next phase after a short delay
            // setTimeout(() => setIsActive(true), 1000);
          } else {
            setMinutes(prevMinutes => prevMinutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(prevSeconds => prevSeconds - 1);
        }

        // Update progress bar
        const elapsedSeconds = (totalSecondsRef.current - (minutes * 60 + seconds));
        const currentProgress = (1 - (elapsedSeconds / totalSecondsRef.current)) * 100;
        setProgress(Math.max(0, currentProgress)); // Ensure progress doesn't go below 0
      }, 1000);
    } else if (!isActive && interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds, isBreak]);

  // Effect to reset totalSecondsRef when phase changes or initial load
  useEffect(() => {
    totalSecondsRef.current = (isBreak ? DEFAULT_BREAK_LENGTH : DEFAULT_FOCUS_LENGTH) * 60;
    setProgress(100); // Always start with 100% progress for the new phase
  }, [isBreak, DEFAULT_FOCUS_LENGTH, DEFAULT_BREAK_LENGTH]);


  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(DEFAULT_FOCUS_LENGTH);
    setSeconds(0);
    totalSecondsRef.current = DEFAULT_FOCUS_LENGTH * 60;
    setProgress(100);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const formatTime = (min: number, sec: number) => {
    const formattedMinutes = String(min).padStart(2, '0');
    const formattedSeconds = String(sec).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <audio ref={audioRef} src="https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-alarm-990.mp3" preload="auto" />

      <div className="text-4xl font-bold text-foreground">
        {formatTime(minutes, seconds)}
      </div>

      <div className="text-sm text-muted-foreground">
        {isBreak ? "Break Time!" : "Focus Time!"}
      </div>

      <Progress value={progress} className="w-full h-2 bg-muted-foreground/30 [&>*]:bg-primary" /> {/* Styled progress bar */}

      <div className="flex space-x-3">
        <Button onClick={toggleTimer} variant={isActive ? "secondary" : "default"}>
          {isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>
        <Button onClick={resetTimer} variant="outline">
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
