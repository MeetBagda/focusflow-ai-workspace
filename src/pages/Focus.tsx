
import React from "react";
import PomodoroTimer from "@/components/timer/PomodoroTimer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Focus: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold mb-2">Focus Mode</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Use the Pomodoro technique to maintain focus during your work sessions. 
          Alternate between focused work and short breaks to maximize productivity.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <PomodoroTimer />

        <Card>
          <CardHeader>
            <CardTitle>Focus Tips</CardTitle>
            <CardDescription>Get the most out of your focus sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">The Pomodoro Technique</h3>
              <p className="text-sm text-muted-foreground">
                Work for 25 minutes, then take a 5-minute break. After 4 cycles, take a longer 15-30 minute break.
              </p>
            </div>

            <div>
              <h3 className="font-medium">Remove Distractions</h3>
              <p className="text-sm text-muted-foreground">
                Put your phone on silent mode and close unnecessary tabs or applications.
              </p>
            </div>

            <div>
              <h3 className="font-medium">Set Clear Goals</h3>
              <p className="text-sm text-muted-foreground">
                Define what you want to accomplish during each focus session before you start.
              </p>
            </div>

            <div>
              <h3 className="font-medium">Stay Hydrated</h3>
              <p className="text-sm text-muted-foreground">
                Keep water nearby to maintain energy and focus throughout your session.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Focus;
