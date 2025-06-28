'use client';

import React, { useState } from 'react';
import { analyzeFoodImage } from '@/ai/flows/analyze-food-image';
import { analyzeDishName } from '@/ai/flows/analyze-dish-name';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useDailyLog } from '@/hooks/use-daily-log';
import { Loader2, UploadCloud, Search } from 'lucide-react';
import Image from 'next/image';
import type { AnalyzeFoodImageOutput } from '@/ai/flows/analyze-food-image';
import { useTranslation } from '@/hooks/use-translation';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dishName, setDishName] = useState('');
  const [loadingSource, setLoadingSource] = React.useState<
    'idle' | 'image' | 'dish'
  >('idle');
  const [result, setResult] = useState<AnalyzeFoodImageOutput | null>(null);
  const { toast } = useToast();
  const { addMeal } = useDailyLog();
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const isLoading = loadingSource !== 'idle';

  React.useEffect(() => {
    document.title = `${t('analyze.title')} - NutriSnap`;
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router, t]);

  if (authLoading || !user) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setDishName(''); // Clear dish name search if file is selected
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setResult(null);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!file || !previewUrl) {
      toast({
        title: t('analyze.uploadCard.error_no_file_title'),
        description: t('analyze.uploadCard.error_no_file_description'),
        variant: 'destructive',
      });
      return;
    }

    setLoadingSource('image');
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
      setLoadingSource('idle');
    }
  };

  const handleAnalyzeDishName = async () => {
    if (!dishName.trim()) {
      toast({
        title: t('analyze.searchCard.error_no_dish_title'),
        description: t('analyze.searchCard.error_no_dish_description'),
        variant: 'destructive',
      });
      return;
    }

    setLoadingSource('dish');
    setResult(null);
    setFile(null); // Clear file upload state
    setPreviewUrl(null);

    try {
      const analysisResult = await analyzeDishName({ dishName });
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
      setLoadingSource('idle');
    }
  };

  const handleAddMeal = () => {
    if (!result) return;

    addMeal({
      name:
        result.foodItems.join(', ') || dishName || t('analyze.analyzedMealName'),
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
    setDishName('');
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
            <CardTitle className="font-headline">
              {t('analyze.methodCard.title')}
            </CardTitle>
            <CardDescription>
              {t('analyze.methodCard.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="image" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="image">
                  {t('analyze.tabs.image')}
                </TabsTrigger>
                <TabsTrigger value="search">
                  {t('analyze.tabs.search')}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="image" className="pt-4">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {t('analyze.uploadCard.description')}
                  </p>
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
                    onClick={handleAnalyzeImage}
                    disabled={!file || isLoading}
                    className="w-full"
                  >
                    {loadingSource === 'image' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {loadingSource === 'image'
                      ? t('analyze.uploadCard.button_loading')
                      : t('analyze.uploadCard.button')}
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="search" className="pt-4">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {t('analyze.searchCard.description')}
                  </p>
                  <Input
                    type="text"
                    placeholder={t('analyze.searchCard.placeholder')}
                    value={dishName}
                    onChange={(e) => {
                      setDishName(e.target.value);
                      setFile(null);
                      setPreviewUrl(null);
                    }}
                    className="w-full"
                  />
                  <Button
                    onClick={handleAnalyzeDishName}
                    disabled={!dishName.trim() || isLoading}
                    className="w-full"
                  >
                    {loadingSource === 'dish' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="mr-2 h-4 w-4" />
                    )}
                    {loadingSource === 'dish'
                      ? t('analyze.searchCard.button_loading')
                      : t('analyze.searchCard.button')}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">
              {t('analyze.reviewCard.title')}
            </CardTitle>
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
                  <h3 className="font-semibold">
                    {t('analyze.reviewCard.identifiedItems')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {result.foodItems.join(', ')}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">
                    {t('analyze.reviewCard.estimatedCalories')}
                  </h3>
                  <p className="text-sm text-primary font-bold">
                    ~{result.estimatedCalories} {t('dashboard.units.kcal')}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">
                    {t('analyze.reviewCard.estimatedNutrients')}
                  </h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <span className="text-muted-foreground">
                      {t('dashboard.nutrients.protein')}:
                    </span>
                    <span className="text-left font-medium rtl:text-right">
                      {result.protein?.toFixed(1)} {t('dashboard.units.g')}
                    </span>
                    <span className="text-muted-foreground">
                      {t('dashboard.nutrients.carbs')}:
                    </span>
                    <span className="text-left font-medium rtl:text-right">
                      {result.carbs?.toFixed(1)} {t('dashboard.units.g')}
                    </span>
                    <span className="text-muted-foreground">
                      {t('dashboard.nutrients.fat')}:
                    </span>
                    <span className="text-left font-medium rtl:text-right">
                      {result.fat?.toFixed(1)} {t('dashboard.units.g')}
                    </span>
                    <span className="text-muted-foreground">
                      {t('dashboard.nutrients.fiber')}:
                    </span>
                    <span className="text-left font-medium rtl:text-right">
                      {result.fiber?.toFixed(1)} {t('dashboard.units.g')}
                    </span>
                    <span className="text-muted-foreground">
                      {t('dashboard.nutrients.sugar')}:
                    </span>
                    <span className="text-left font-medium rtl:text-right">
                      {result.sugar?.toFixed(1)} {t('dashboard.units.g')}
                    </span>
                    <span className="text-muted-foreground">
                      {t('dashboard.nutrients.sodium')}:
                    </span>
                    <span className="text-left font-medium rtl:text-right">
                      {result.sodium?.toFixed(0)} {t('dashboard.units.mg')}
                    </span>
                    <span className="text-muted-foreground">
                      {t('dashboard.nutrients.potassium')}:
                    </span>
                    <span className="text-left font-medium rtl:text-right">
                      {result.potassium?.toFixed(0)} {t('dashboard.units.mg')}
                    </span>
                    <span className="text-muted-foreground">
                      {t('dashboard.nutrients.calcium')}:
                    </span>
                    <span className="text-left font-medium rtl:text-right">
                      {result.calcium?.toFixed(0)} {t('dashboard.units.mg')}
                    </span>
                    <span className="text-muted-foreground">
                      {t('dashboard.nutrients.iron')}:
                    </span>
                    <span className="text-left font-medium rtl:text-right">
                      {result.iron?.toFixed(1)} {t('dashboard.units.mg')}
                    </span>
                    <span className="text-muted-foreground">
                      {t('dashboard.nutrients.vitaminA')}:
                    </span>
                    <span className="text-left font-medium rtl:text-right">
                      {result.vitaminA?.toFixed(0)} {t('dashboard.units.mcg')}
                    </span>
                    <span className="text-muted-foreground">
                      {t('dashboard.nutrients.vitaminC')}:
                    </span>
                    <span className="text-left font-medium rtl:text-right">
                      {result.vitaminC?.toFixed(0)} {t('dashboard.units.mg')}
                    </span>
                    <span className="text-muted-foreground">
                      {t('dashboard.nutrients.vitaminD')}:
                    </span>
                    <span className="text-left font-medium rtl:text-right">
                      {result.vitaminD?.toFixed(0)} {t('dashboard.units.mcg')}
                    </span>
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
