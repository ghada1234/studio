'use client';

import React, { useState } from 'react';
import { analyzeFoodImage } from '@/ai/flows/analyze-food-image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useDailyLog } from '@/hooks/use-daily-log';
import { Loader2, UploadCloud } from 'lucide-react';
import Image from 'next/image';
import type { AnalyzeFoodImageOutput } from '@/ai/flows/analyze-food-image';

export default function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeFoodImageOutput | null>(null);
  const { toast } = useToast();
  const { addMeal } = useDailyLog();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setResult(null); // Reset result on new file
    }
  };

  const handleAnalyze = async () => {
    if (!file || !previewUrl) {
      toast({
        title: 'No file selected',
        description: 'Please choose an image to analyze.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const analysisResult = await analyzeFoodImage({
        photoDataUri: previewUrl,
      });
      setResult(analysisResult);
      toast({
        title: 'Analysis Complete!',
        description: 'Estimated nutritional information is now available.',
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Could not analyze the image. Please try another one.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMeal = () => {
    if (!result) return;

    addMeal({
      name: result.foodItems.join(', ') || 'Analyzed Meal',
      calories: result.estimatedCalories,
      protein: result.protein,
      carbs: result.carbs,
      fat: result.fat,
      fiber: result.fiber,
      sugar: result.sugar,
      sodium: result.sodium,
      potassium: result.potassium,
      calcium: result.calcium,
      iron: result.iron,
      vitaminA: result.vitaminA,
      vitaminC: result.vitaminC,
      vitaminD: result.vitaminD,
      imageUrl: previewUrl || undefined,
    });

    toast({
      title: 'Meal Logged!',
      description: 'The analyzed meal has been added to your daily dashboard.',
    });
    setResult(null);
    setFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="flex flex-col gap-8 p-4 sm:p-6 md:p-8">
      <header>
        <h1 className="font-headline text-4xl font-bold">
          Analyze Meal with AI
        </h1>
        <p className="text-muted-foreground">
          Upload a photo of your meal and let our AI do the heavy lifting.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">1. Upload Image</CardTitle>
            <CardDescription>
              Choose a clear picture of your meal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative flex h-64 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 transition hover:bg-muted/80">
              <Input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              />
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Meal preview"
                  layout="fill"
                  objectFit="contain"
                  className="rounded-lg p-2"
                />
              ) : (
                <div className="flex flex-col items-center text-muted-foreground">
                  <UploadCloud className="mb-2 h-10 w-10" />
                  <p>Click or drag to upload</p>
                </div>
              )}
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={!file || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isLoading ? 'Analyzing...' : 'Analyze Meal'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">2. Review Analysis</CardTitle>
            <CardDescription>
              Here is the estimated nutritional information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && (
              <div className="flex flex-col items-center justify-center space-y-2 pt-10 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Analyzing image...</p>
              </div>
            )}
            {result ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Identified Food Items</h3>
                  <p className="text-sm text-muted-foreground">
                    {result.foodItems.join(', ')}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Estimated Calories</h3>
                  <p className="text-sm text-primary font-bold">
                    ~{result.estimatedCalories} kcal
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Estimated Nutrients</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <span className="text-muted-foreground">Protein:</span>
                    <span className="text-right font-medium">{result.protein?.toFixed(1)} g</span>
                    <span className="text-muted-foreground">Carbs:</span>
                    <span className="text-right font-medium">{result.carbs?.toFixed(1)} g</span>
                    <span className="text-muted-foreground">Fat:</span>
                    <span className="text-right font-medium">{result.fat?.toFixed(1)} g</span>
                    <span className="text-muted-foreground">Fiber:</span>
                    <span className="text-right font-medium">{result.fiber?.toFixed(1)} g</span>
                     <span className="text-muted-foreground">Sugar:</span>
                    <span className="text-right font-medium">{result.sugar?.toFixed(1)} g</span>
                    <span className="text-muted-foreground">Sodium:</span>
                    <span className="text-right font-medium">{result.sodium?.toFixed(0)} mg</span>
                    <span className="text-muted-foreground">Potassium:</span>
                    <span className="text-right font-medium">{result.potassium?.toFixed(0)} mg</span>
                    <span className="text-muted-foreground">Calcium:</span>
                    <span className="text-right font-medium">{result.calcium?.toFixed(0)} mg</span>
                    <span className="text-muted-foreground">Iron:</span>
                    <span className="text-right font-medium">{result.iron?.toFixed(1)} mg</span>
                    <span className="text-muted-foreground">Vitamin A:</span>
                    <span className="text-right font-medium">{result.vitaminA?.toFixed(0)} mcg</span>
                    <span className="text-muted-foreground">Vitamin C:</span>
                    <span className="text-right font-medium">{result.vitaminC?.toFixed(0)} mg</span>
                    <span className="text-muted-foreground">Vitamin D:</span>
                    <span className="text-right font-medium">{result.vitaminD?.toFixed(0)} mcg</span>
                  </div>
                </div>

                <Button
                  onClick={handleAddMeal}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  Add to Daily Log
                </Button>
              </div>
            ) : (
              !isLoading && (
                <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                  <p>Analysis results will appear here.</p>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
