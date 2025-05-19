
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

export const QuickPomodoroTimer: React.FC = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer complete
            setIsActive(false);
            // Play sound or show notification
            const audio = new Audio("/notification.mp3");
            audio.play().catch(() => console.log("Audio play failed"));
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds]);
  
  const toggleTimer = () => {
    setIsActive(!isActive);
  };
  
  const resetTimer = () => {
    setIsActive(false);
    setMinutes(25);
    setSeconds(0);
  };
  
  const formatTime = () => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = ((minutes * 60 + seconds) / (25 * 60)) * 100;

  return (
    <div className="flex flex-col items-center py-2">
      <div className="w-32 h-32 rounded-full border-4 flex items-center justify-center mb-4 relative"
           style={{
             backgroundImage: `conic-gradient(from 0deg, hsl(var(--primary)) ${progress}%, transparent ${progress}%)`
           }}>
        <div className="w-28 h-28 rounded-full bg-background flex items-center justify-center">
          <p className="text-3xl font-bold">{formatTime()}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={toggleTimer} variant="outline">
          {isActive ? <Pause size={16} /> : <Play size={16} />}
          {isActive ? "Pause" : "Start"}
        </Button>
        <Button onClick={resetTimer} variant="outline" size="icon">
          <RotateCcw size={16} />
        </Button>
      </div>
    </div>
  );
};
