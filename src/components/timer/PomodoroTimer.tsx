
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pause, Play, RotateCcw } from "lucide-react";

const PomodoroTimer: React.FC = () => {
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [isActive, setIsActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60); // 25 minutes focus by default
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((seconds) => seconds - 1);
      }, 1000);
    } else if (isActive && secondsLeft === 0) {
      setIsActive(false);
      // Switch modes when timer ends
      if (mode === "focus") {
        setMode("break");
        setSecondsLeft(breakMinutes * 60);
      } else {
        setMode("focus");
        setSecondsLeft(focusMinutes * 60);
      }
    } else if (!isActive && interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsLeft, mode, focusMinutes, breakMinutes]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(mode === "focus" ? focusMinutes * 60 : breakMinutes * 60);
  };

  const switchMode = (newMode: "focus" | "break") => {
    setIsActive(false);
    setMode(newMode);
    setSecondsLeft(newMode === "focus" ? focusMinutes * 60 : breakMinutes * 60);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const updateFocusTime = (value: number[]) => {
    const newMinutes = value[0];
    setFocusMinutes(newMinutes);
    if (mode === "focus" && !isActive) {
      setSecondsLeft(newMinutes * 60);
    }
  };

  const updateBreakTime = (value: number[]) => {
    const newMinutes = value[0];
    setBreakMinutes(newMinutes);
    if (mode === "break" && !isActive) {
      setSecondsLeft(newMinutes * 60);
    }
  };

  const progress = mode === "focus" 
    ? (secondsLeft / (focusMinutes * 60)) * 100
    : (secondsLeft / (breakMinutes * 60)) * 100;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Focus Timer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={mode} onValueChange={(v) => switchMode(v as "focus" | "break")}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="focus">Focus</TabsTrigger>
            <TabsTrigger value="break">Break</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col items-center justify-center">
          <div className="w-36 h-36 rounded-full border-4 flex items-center justify-center mb-6"
               style={{
                 backgroundImage: `conic-gradient(from 0deg, hsl(var(--primary)) ${100 - progress}%, transparent ${100 - progress}%)`
               }}>
            <div className="w-32 h-32 rounded-full bg-background flex items-center justify-center">
              <p className="text-4xl font-bold">{formatTime(secondsLeft)}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={toggleTimer} size="icon" variant="outline">
              {isActive ? <Pause size={18} /> : <Play size={18} />}
            </Button>
            <Button onClick={resetTimer} size="icon" variant="outline">
              <RotateCcw size={18} />
            </Button>
          </div>
        </div>

        <div className="space-y-6 pt-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="text-sm">Focus Length</p>
              <span className="text-sm">{focusMinutes} min</span>
            </div>
            <Slider 
              disabled={isActive && mode === "focus"}
              value={[focusMinutes]} 
              min={5} 
              max={60} 
              step={5} 
              onValueChange={updateFocusTime}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="text-sm">Break Length</p>
              <span className="text-sm">{breakMinutes} min</span>
            </div>
            <Slider 
              disabled={isActive && mode === "break"}
              value={[breakMinutes]} 
              min={1} 
              max={30} 
              step={1} 
              onValueChange={updateBreakTime}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PomodoroTimer;
