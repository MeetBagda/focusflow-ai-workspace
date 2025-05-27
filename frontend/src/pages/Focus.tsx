import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider"; // Assuming you have a Slider component
import { Play, Pause, RotateCcw } from "lucide-react"; // Icons for timer controls

const PomodoroTimer: React.FC = () => {
  const [focusLength, setFocusLength] = useState(25);
  const [breakLength, setBreakLength] = useState(5);
  const [longBreakLength, setLongBreakLength] = useState(15);
  const [minutes, setMinutes] = useState(focusLength);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionCount, setSessionCount] = useState(0); // To track Pomodoro sessions
  const audioRef = useRef<HTMLAudioElement | null>(null); // Ref for audio element

  // Effect to handle timer logic (countdown)
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

            // Determine next phase
            let nextIsBreak;
            let nextMinutes;
            let nextSessionCount = sessionCount;

            if (isBreak) {
              // End of break, start new focus session
              nextIsBreak = false;
              nextMinutes = focusLength;
            } else {
              // End of focus, start break
              nextSessionCount = sessionCount + 1;
              nextIsBreak = true;
              if (nextSessionCount % 4 === 0) {
                nextMinutes = longBreakLength;
              } else {
                nextMinutes = breakLength;
              }
            }

            // Update state for the next phase
            setIsActive(false); // Pause timer after phase completion
            setIsBreak(nextIsBreak);
            setSessionCount(nextSessionCount);
            setMinutes(nextMinutes);
            setSeconds(0);

            // Optionally, auto-start next phase after a short delay
            // setTimeout(() => setIsActive(true), 1000); // Uncomment to auto-start next phase
          } else {
            setMinutes(prevMinutes => prevMinutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(prevSeconds => prevSeconds - 1);
        }
      }, 1000);
    } else if (!isActive && interval) { // Clear interval if timer is paused
      clearInterval(interval);
    }

    // Cleanup function: clear interval when component unmounts or dependencies change
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds, focusLength, breakLength, longBreakLength, isBreak, sessionCount]);

  // Effect to manage minutes/seconds when lengths or phase change, but only if timer is NOT active
  // This fixes the bug where pausing would reset the timer.
  useEffect(() => {
    if (!isActive) { // Only update if the timer is not currently running
      if (isBreak) {
        // If in break phase, set minutes to appropriate break length
        const currentExpectedBreakLength = (sessionCount % 4 === 0 && sessionCount > 0) ? longBreakLength : breakLength;
        if (minutes !== currentExpectedBreakLength || seconds !== 0) { // Only update if different from current display
          setMinutes(currentExpectedBreakLength);
          setSeconds(0);
        }
      } else {
        // If in focus phase, set minutes to focus length
        if (minutes !== focusLength || seconds !== 0) { // Only update if different from current display
          setMinutes(focusLength);
          setSeconds(0);
        }
      }
    }
  }, [focusLength, breakLength, longBreakLength, isBreak, sessionCount]); // Removed isActive from dependencies here

  // Functions for timer controls
  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(focusLength); // Reset to initial focus length
    setSeconds(0);
    setSessionCount(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const skipPhase = () => {
    setIsActive(false); // Pause current phase
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (isBreak) {
      // Skip break, start new focus session
      setIsBreak(false);
      setMinutes(focusLength);
      setSeconds(0);
    } else {
      // Skip focus, start break
      setSessionCount(prev => prev + 1);
      if ((sessionCount + 1) % 4 === 0) {
        setMinutes(longBreakLength);
      } else {
        setMinutes(breakLength);
      }
      setIsBreak(true);
      setSeconds(0);
    }
  };

  // Format time for display
  const formatTime = (min: number, sec: number) => {
    const formattedMinutes = String(min).padStart(2, '0');
    const formattedSeconds = String(sec).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full font-inter">
      {/* Audio element for timer completion sound */}
      <audio ref={audioRef} src="https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-alarm-990.mp3" preload="auto" />

      {/* Timer display - large and central */}
      <div className="relative w-full flex items-center justify-center mb-8">
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Animated background circle - Made larger */}
          <div
            className={`rounded-full border-8 transition-all duration-1000 ease-in-out ${
              isActive
                ? isBreak
                  ? 'border-blue-500 animate-pulse-blue' // Blue for break
                  : 'border-[#FF8C00] animate-pulse-orange' // Orange for focus
                : 'border-gray-600' // Grey when paused
            }`}
            style={{
              width: '95%', // Increased size
              height: '95%', // Increased size
              maxWidth: '450px', // Increased max size
              maxHeight: '450px', // Increased max size
              opacity: isActive ? 0.7 : 0.4,
            }}
          ></div>
        </div>
        <h2 className="text-8xl md:text-9xl font-extrabold text-white z-10 select-none"> {/* Removed text-shadow-glow */}
          {formatTime(minutes, seconds)}
        </h2>
      </div>

      {/* Timer controls */}
      <div className="flex space-x-4 mb-8">
        <Button
          size="lg"
          className="bg-[#FF8C00] hover:bg-[#E67E00] text-white rounded-full p-4 shadow-lg transition-all duration-300 transform hover:scale-105 border border-[#FF8C00]"
          onClick={toggleTimer}
          aria-label={isActive ? "Pause timer" : "Start timer"}
        >
          {isActive ? <Pause size={32} /> : <Play size={32} />}
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="border-[#FF8C00] text-[#FF8C00] hover:bg-[#FF8C00] hover:text-white rounded-full p-4 shadow-lg transition-all duration-300 transform hover:scale-105"
          onClick={resetTimer}
          aria-label="Reset timer"
        >
          <RotateCcw size={32} />
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white rounded-full p-4 shadow-lg transition-all duration-300 transform hover:scale-105"
          onClick={skipPhase}
          aria-label="Skip current phase"
        >
          Skip
        </Button>
      </div>

      {/* Length sliders */}
      <div className="w-full max-w-md space-y-6 px-4">
        <div className="flex items-center justify-between text-white">
          <label htmlFor="focus-length" className="text-lg font-medium">Focus Length</label>
          <Slider
            id="focus-length"
            defaultValue={[focusLength]}
            max={60}
            step={1}
            onValueChange={(val) => setFocusLength(val[0])}
            className="w-2/3 [&>span:first-child]:bg-[#FF8C00] [&>span:last-child]:bg-gray-600" // Custom slider track color
            disabled={isActive}
          />
          <span className="text-xl font-bold ml-2">{focusLength} min</span>
        </div>
        <div className="flex items-center justify-between text-white">
          <label htmlFor="break-length" className="text-lg font-medium">Break Length</label>
          <Slider
            id="break-length"
            defaultValue={[breakLength]}
            max={30}
            step={1}
            onValueChange={(val) => setBreakLength(val[0])}
            className="w-2/3 [&>span:first-child]:bg-blue-500 [&>span:last-child]:bg-gray-600" // Custom slider track color
            disabled={isActive}
          />
          <span className="text-xl font-bold ml-2">{breakLength} min</span>
        </div>
        <div className="flex items-center justify-between text-white">
          <label htmlFor="long-break-length" className="text-lg font-medium">Long Break</label>
          <Slider
            id="long-break-length"
            defaultValue={[longBreakLength]}
            max={60}
            step={1}
            onValueChange={(val) => setLongBreakLength(val[0])}
            className="w-2/3 [&>span:first-child]:bg-purple-500 [&>span:last-child]:bg-gray-600" // Custom slider track color
            disabled={isActive}
          />
          <span className="text-xl font-bold ml-2">{longBreakLength} min</span>
        </div>
      </div>

      {/* Animated background styles and text glow */}
      <style jsx>{`
        @keyframes pulse-orange {
          0% { box-shadow: 0 0 0 0 rgba(255, 140, 0, 0.7); }
          70% { box-shadow: 0 0 0 40px rgba(255, 140, 0, 0); } /* Increased pulse size */
          100% { box-shadow: 0 0 0 0 rgba(255, 140, 0, 0); }
        }
        @keyframes pulse-blue {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { box-shadow: 0 0 0 40px rgba(59, 130, 246, 0); } /* Increased pulse size */
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        .animate-pulse-orange {
          animation: pulse-orange 2s infinite;
        }
        .animate-pulse-blue {
          animation: pulse-blue 2s infinite;
        }
        /* Removed text-shadow-glow as requested */
      `}</style>
    </div>
  );
};


const Focus: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 bg-[#1A1A1A] text-white font-inter">
      <div className="text-center mb-8 animate-fade-in-down">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">Deep Focus Mode</h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
          Immerse yourself in distraction-free work with the Pomodoro Technique.
          Let the rhythm guide you to peak productivity.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 w-full max-w-6xl">
        {/* Pomodoro Timer takes full height on small screens, half on medium+ */}
        <div className="md:col-span-1 flex items-center justify-center">
          <PomodoroTimer />
        </div>

        {/* Focus Tips Card */}
        <Card className="bg-[#282828] text-white border border-[#3A3A3A] rounded-lg shadow-xl animate-fade-in-right">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-[#FF8C00]">Focus Tips</CardTitle>
            <CardDescription className="text-gray-400">Strategies to supercharge your concentration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-3 bg-[#1A1A1A] rounded-md border border-[#3A3A3A]">
              <h3 className="font-semibold text-lg text-white">The Pomodoro Technique</h3>
              <p className="text-sm text-gray-400">
                Work for 25 minutes, then take a 5-minute break. After 4 cycles, take a longer 15-30 minute break.
              </p>
            </div>

            <div className="p-3 bg-[#1A1A1A] rounded-md border border-[#3A3A3A]">
              <h3 className="font-semibold text-lg text-white">Remove Distractions</h3>
              <p className="text-sm text-gray-400">
                Put your phone on silent mode, close unnecessary tabs, and use noise-canceling headphones.
              </p>
            </div>

            <div className="p-3 bg-[#1A1A1A] rounded-md border border-[#3A3A3A]">
              <h3 className="font-semibold text-lg text-white">Set Clear Goals</h3>
              <p className="text-sm text-gray-400">
                Before each session, define one clear, achievable task to focus on.
              </p>
            </div>

            <div className="p-3 bg-[#1A1A1A] rounded-md border border-[#3A3A3A]">
              <h3 className="font-semibold text-lg text-white">Stay Hydrated & Take Micro-Breaks</h3>
              <p className="text-sm text-gray-400">
                Keep water nearby. During short breaks, stretch, walk a bit, or look away from the screen.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Global animations for the page */}
      <style jsx>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.8s ease-out forwards;
        }
        .animate-fade-in-right {
          animation: fadeInRight 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Focus;
