"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useScreeningStore } from "@/stores/screeningStore";
import { PHQ9_QUESTIONS, GAD7_QUESTIONS, RESPONSE_OPTIONS } from "@/lib/constants";
import { AlertTriangle, CheckCircle, Phone, User } from "lucide-react";
import Link from "next/link";

type ScreeningType = "PHQ9" | "GAD7";

export default function ScreeningPage() {
  const [currentAssessment, setCurrentAssessment] = useState<ScreeningType | null>(null);
  const [showResults, setShowResults] = useState(false);
  const { addResult, getLatestResult } = useScreeningStore();
  const { register, handleSubmit, watch, reset } = useForm();

  const watchedValues = watch();
  const latestPHQ9 = getLatestResult("PHQ9");
  const latestGAD7 = getLatestResult("GAD7");

  const startAssessment = (type: ScreeningType) => {
    setCurrentAssessment(type);
    setShowResults(false);
    reset();
  };

  const onSubmit = (data: any) => {
    if (!currentAssessment) return;

    const responses = Object.values(data).map(Number);
    addResult(currentAssessment, responses);
    setShowResults(true);
  };

  const getQuestions = (type: ScreeningType) => {
    return type === "PHQ9" ? PHQ9_QUESTIONS : GAD7_QUESTIONS;
  };

  const getCurrentResult = () => {
    if (!currentAssessment) return null;
    return getLatestResult(currentAssessment);
  };

  const renderResults = () => {
    const result = getCurrentResult();
    if (!result) return null;

    const getRecommendationContent = () => {
      switch (result.recommendation) {
        case "self-care":
          return {
            icon: <CheckCircle className="h-8 w-8 text-green-500" />,
            title: "Self-Care Recommended",
            description: "Your responses suggest mild symptoms that may benefit from self-care strategies.",
            color: "border-green-500 bg-green-50 dark:bg-green-950",
            actions: (
              <div className="space-y-2">
                <Link href="/resources">
                  <Button className="w-full">View Self-Care Resources</Button>
                </Link>
                <Link href="/journal">
                  <Button variant="outline" className="w-full">Start Journaling</Button>
                </Link>
              </div>
            )
          };
        case "counselor":
          return {
            icon: <User className="h-8 w-8 text-blue-500" />,
            title: "Professional Support Recommended",
            description: "Your responses suggest moderate symptoms that could benefit from professional support.",
            color: "border-blue-500 bg-blue-50 dark:bg-blue-950",
            actions: (
              <div className="space-y-2">
                <Link href="/counselors">
                  <Button className="w-full">Find a Counselor</Button>
                </Link>
                <Link href="/resources">
                  <Button variant="outline" className="w-full">View Resources</Button>
                </Link>
              </div>
            )
          };
        case "emergency":
          return {
            icon: <AlertTriangle className="h-8 w-8 text-red-500" />,
            title: "Immediate Support Recommended",
            description: "Your responses suggest severe symptoms. Please consider reaching out for immediate professional help.",
            color: "border-red-500 bg-red-50 dark:bg-red-950",
            actions: (
              <div className="space-y-2">
                <Button 
                  onClick={() => window.location.href = "tel:988"}
                  className="w-full bg-red-500 hover:bg-red-600"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call 988 - Crisis Lifeline
                </Button>
                <Link href="/counselors">
                  <Button variant="outline" className="w-full">Find a Counselor</Button>
                </Link>
              </div>
            )
          };
      }
    };

    const content = getRecommendationContent();

    return (
      <Card className={`${content.color} border-2`}>
        <CardHeader>
          <div className="flex items-center gap-3">
            {content.icon}
            <div>
              <CardTitle>{content.title}</CardTitle>
              <CardDescription className="mt-1">
                Score: {result.score} - {result.interpretation}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{content.description}</p>
          {content.actions}
          <div className="mt-4 pt-4 border-t text-sm text-gray-600 dark:text-gray-400">
            <p className="font-medium mb-1">Important Disclaimer:</p>
            <p>
              This screening tool is not a diagnostic instrument. Results should not replace 
              professional medical advice, diagnosis, or treatment. If you're experiencing 
              thoughts of self-harm, please seek immediate professional help.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (showResults) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Assessment Results</h1>
          <Button
            onClick={() => {
              setShowResults(false);
              setCurrentAssessment(null);
            }}
            variant="outline"
          >
            Take Another Assessment
          </Button>
        </div>
        {renderResults()}
      </div>
    );
  }

  if (currentAssessment) {
    const questions = getQuestions(currentAssessment);
    const assessmentTitle = currentAssessment === "PHQ9" ? "Depression Screening (PHQ-9)" : "Anxiety Screening (GAD-7)";
    const completedAnswers = Object.keys(watchedValues).length;
    const progress = (completedAnswers / questions.length) * 100;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{assessmentTitle}</h1>
          <Button
            onClick={() => setCurrentAssessment(null)}
            variant="outline"
          >
            Back to Screening
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Over the last 2 weeks, how often have you been bothered by the following problems?</CardTitle>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">
              {completedAnswers} of {questions.length} questions completed
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {questions.map((question, index) => (
                <div key={index} className="space-y-3">
                  <p className="font-medium">{index + 1}. {question}</p>
                  <div className="space-y-2">
                    {RESPONSE_OPTIONS.map((option) => (
                      <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          value={option.value}
                          {...register(`question_${index}`, { required: true })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <Button 
                type="submit" 
                className="w-full"
                disabled={completedAnswers < questions.length}
              >
                Complete Assessment
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-semibold">Mental Health Screening</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Take a brief, confidential screening to better understand your mental health. 
          These tools can help identify symptoms and guide you toward appropriate resources.
        </p>
      </div>

      {/* Disclaimer */}
      <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-medium mb-1">Important Notice</p>
              <p>
                These screening tools are for informational purposes only and are not diagnostic instruments. 
                They cannot replace professional medical advice, diagnosis, or treatment. 
                Results should be discussed with a qualified healthcare provider.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Options */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Depression Screening (PHQ-9)</CardTitle>
            <CardDescription>
              A 9-question tool to screen for depression symptoms over the past 2 weeks.
              Takes about 2-3 minutes to complete.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestPHQ9 && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <p className="text-sm font-medium">Last screening:</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Score: {latestPHQ9.score} - {latestPHQ9.interpretation}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(latestPHQ9.date).toLocaleDateString()}
                </p>
              </div>
            )}
            <Button 
              onClick={() => startAssessment("PHQ9")}
              className="w-full"
            >
              Start Depression Screening
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Anxiety Screening (GAD-7)</CardTitle>
            <CardDescription>
              A 7-question tool to screen for anxiety symptoms over the past 2 weeks.
              Takes about 2 minutes to complete.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestGAD7 && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <p className="text-sm font-medium">Last screening:</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Score: {latestGAD7.score} - {latestGAD7.interpretation}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(latestGAD7.date).toLocaleDateString()}
                </p>
              </div>
            )}
            <Button 
              onClick={() => startAssessment("GAD7")}
              className="w-full"
            >
              Start Anxiety Screening
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Additional Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Need immediate help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => window.location.href = "tel:988"}
              variant="destructive"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call 988 - Crisis Lifeline
            </Button>
            <Link href="/chat">
              <Button variant="outline">
                Talk to Support Chat
              </Button>
            </Link>
            <Link href="/resources">
              <Button variant="outline">
                View Resources
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

