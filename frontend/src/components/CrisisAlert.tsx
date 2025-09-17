import React from "react";
import { AlertTriangle, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CRISIS_RESOURCES } from "@/lib/constants";

interface CrisisAlertProps {
  onClose: () => void;
}

export function CrisisAlert({ onClose }: CrisisAlertProps) {
  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  const handleText = (message: string) => {
    window.location.href = `sms:741741?body=${encodeURIComponent(message)}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-md w-full border-red-500 border-2">
        <CardHeader className="bg-red-50 dark:bg-red-950">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <CardTitle className="text-red-700 dark:text-red-300">Crisis Support</CardTitle>
          </div>
          <CardDescription className="text-red-600 dark:text-red-400">
            You don't have to go through this alone. Help is available right now.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-3">
            <Button
              onClick={() => handleCall(CRISIS_RESOURCES.us.national)}
              className="w-full bg-red-500 hover:bg-red-600 text-white"
              size="lg"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call 988 - Suicide & Crisis Lifeline
            </Button>
            
            <Button
              onClick={() => handleText("HOME")}
              variant="outline"
              className="w-full border-red-500 text-red-700 hover:bg-red-50"
              size="lg"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Text HOME to 741741
            </Button>
            
            <Button
              onClick={() => handleCall(CRISIS_RESOURCES.us.emergency)}
              variant="outline"
              className="w-full border-red-500 text-red-700 hover:bg-red-50"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call 911 - Emergency Services
            </Button>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p className="font-medium">International Resources:</p>
            <div className="space-y-1">
              {CRISIS_RESOURCES.international.map((resource) => (
                <div key={resource.country} className="flex justify-between">
                  <span>{resource.country}:</span>
                  <span 
                    className="text-blue-600 cursor-pointer hover:underline"
                    onClick={() => handleCall(resource.number)}
                  >
                    {resource.number}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full"
            >
              Continue to Support Chat
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}