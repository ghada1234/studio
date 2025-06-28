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
import { useTranslation } from '@/hooks/use-translation';

export default function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeFoodImageOutput | null>(null);
  const { toast } = useToast();
  const { addMeal } = useDailyLog();
  const { t } = useTranslation();

  React.useEffect(() => {
    document.title = `${t('analyze.title')} - NutriSnap`;
  }, [t]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file || !previewUrl) {
      toast({
        title: t('analyze.uploadCard.error_no_file_title'),
        description: t('analyze.uploadCard.error_no_file_description'),
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
        title: t('analyze.reviewCard.success_toast_title'),
        description: t('analyze.reviewCard.success_toast_description'),
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: t('analyze.reviewCard.error_toast_title'),
        description: t('analyze.reviewCard.error_toast_description'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMeal = () => {
    if (!result) return;

    addMeal({
      name: result.foodItems.join(', ') || t('analyze.analyzedMealName'),
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
      title: t('analyze.reviewCard.log_success_toast_title'),
      description: t('analyze.reviewCard.log_success_toast_description'),
    });
    setResult(null);
    setFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="flex flex-col gap-8 p-4 sm:p-6 md:p-8">
      <header>
        <h1 className="font-headline text-4xl font-bold">
          {t('analyze.header')}
        </h1>
        <p className="text-muted-foreground">{t('analyze.description')}</p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">{t('analyze.uploadCard.title')}</CardTitle>
            <CardDescription>
              {t('analyze.uploadCard.description')}
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
                  fill
                  style={{ objectFit: 'contain' }}
                  className="rounded-lg p-2"
                />
              ) : (
                <div className="flex flex-col items-center text-muted-foreground">
                  <UploadCloud className="mb-2 h-10 w-10" />
                  <p>{t('analyze.uploadCard.cta')}</p>
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
              {isLoading ? t('analyze.uploadCard.button_loading') : t('analyze.uploadCard.button')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">{t('analyze.reviewCard.title')}</CardTitle>
            <CardDescription>
              {t('analyze.reviewCard.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && (
              <div className="flex flex-col items-center justify-center space-y-2 pt-10 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>{t('analyze.reviewCard.loading')}</p>
              </div>
            )}
            {result ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">{t('analyze.reviewCard.identifiedItems')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {result.foodItems.join(', ')}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">{t('analyze.reviewCard.estimatedCalories')}</h3>
                  <p className="text-sm text-primary font-bold">
                    ~{result.estimatedCalories} {t('dashboard.units.kcal')}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">{t('analyze.reviewCard.estimatedNutrients')}</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <span className="text-muted-foreground">{t('dashboard.nutrients.protein')}:</span>
                    <span className="text-left font-medium rtl:text-right">{result.protein?.toFixed(1)} {t('dashboard.units.g')}</span>
                    <span className="text-muted-foreground">{t('dashboard.nutrients.carbs')}:</span>
                    <span className="text-left font-medium rtl:text-right">{result.carbs?.toFixed(1)} {t('dashboard.units.g')}</span>
                    <span className="text-muted-foreground">{t('dashboard.nutrients.fat')}:</span>
                    <span className="text-left font-medium rtl:text-right">{result.fat?.toFixed(1)} {t('dashboard.units.g')}</span>
                    <span className="text-muted-foreground">{t('dashboard.nutrients.fiber')}:</span>
                    <span className="text-left font-medium rtl:text-right">{result.fiber?.toFixed(1)} {t('dashboard.units.g')}</span>
                    <span className="text-muted-foreground">{t('dashboard.nutrients.sugar')}:</span>
                    <span className="text-left font-medium rtl:text-right">{result.sugar?.toFixed(1)} {t('dashboard.units.g')}</span>
                    <span className="text-muted-foreground">{t('dashboard.nutrients.sodium')}:</span>
                    <span className="text-left font-medium rtl:text-right">{result.sodium?.toFixed(0)} {t('dashboard.units.mg')}</span>
                    <span className="text-muted-foreground">{t('dashboard.nutrients.potassium')}:</span>
                    <span className="text-left font-medium rtl:text-right">{result.potassium?.toFixed(0)} {t('dashboard.units.mg')}</span>
                    <span className="text-muted-foreground">{t('dashboard.nutrients.calcium')}:</span>
                    <span className="text-left font-medium rtl:text-right">{result.calcium?.toFixed(0)} {t('dashboard.units.mg')}</span>
                    <span className="text-muted-foreground">{t('dashboard.nutrients.iron')}:</span>
                    <span className="text-left font-medium rtl:text-right">{result.iron?.toFixed(1)} {t('dashboard.units.mg')}</span>
                    <span className="text-muted-foreground">{t('dashboard.nutrients.vitaminA')}:</span>
                    <span className="text-left font-medium rtl:text-right">{result.vitaminA?.toFixed(0)} {t('dashboard.units.mcg')}</span>
                    <span className="text-muted-foreground">{t('dashboard.nutrients.vitaminC')}:</span>
                    <span className="text-left font-medium rtl:text-right">{result.vitaminC?.toFixed(0)} {t('dashboard.units.mg')}</span>
                    <span className="text-muted-foreground">{t('dashboard.nutrients.vitaminD')}:</span>
                    <span className="text-left font-medium rtl:text-right">{result.vitaminD?.toFixed(0)} {t('dashboard.units.mcg')}</span>
                  </div>
                </div>

                <Button
                  onClick={handleAddMeal}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {t('analyze.reviewCard.add_to_log_button')}
                </Button>
              </div>
            ) : (
              !isLoading && (
                <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                  <p>{t('analyze.reviewCard.placeholder')}</p>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
