
'use client';

import React, { useState, useRef, useEffect } from 'react';
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
import { Loader2, Search, Camera, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import type { AnalyzeFoodImageOutput } from '@/ai/flows/analyze-food-image';
import { useTranslation } from '@/hooks/use-translation';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function AnalyzePage() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dishName, setDishName] = useState('');
  const [portionSize, setPortionSize] = useState('');
  const [loadingSource, setLoadingSource] = React.useState<
    'idle' | 'image' | 'dish'
  >('idle');
  const [result, setResult] = useState<AnalyzeFoodImageOutput | null>(null);
  const { toast } = useToast();
  const { addMeal } = useDailyLog();
  const { t, dir } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('search');
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(
    'environment'
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isLoading = loadingSource !== 'idle';

  React.useEffect(() => {
    document.title = `${t('analyze.title')} - NutriSnap`;
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router, t]);

  useEffect(() => {
    if (activeTab !== 'camera') {
      if (videoRef.current?.srcObject) {
        const mediaStream = videoRef.current.srcObject as MediaStream;
        mediaStream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      return;
    }

    let stream: MediaStream;
    const getCameraPermission = async () => {
      setHasCameraPermission(null);
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
        });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: t('analyze.cameraCard.error_permission_title'),
          description: t('analyze.cameraCard.error_permission_description'),
        });
      }
    };

    getCameraPermission();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [activeTab, facingMode, t, toast]);


  if (authLoading || !user) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const analyzeImageDataUri = async (dataUri: string, portion: string) => {
    if (!dataUri) return;

    setLoadingSource('image');
    setResult(null);

    try {
      const analysisResult = await analyzeFoodImage({
        photoDataUri: dataUri,
        portionSize: portion || undefined,
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
    setPreviewUrl(null);

    try {
      const analysisResult = await analyzeDishName({ dishName, portionSize });
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

  const handleCaptureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
  
    const video = videoRef.current;
    if (video.readyState < video.HAVE_ENOUGH_DATA) {
      toast({
        title: t('analyze.cameraCard.error_camera_not_ready_title'),
        description: t('analyze.cameraCard.error_camera_not_ready_description'),
        variant: 'destructive',
      });
      return;
    }
  
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUri = canvas.toDataURL('image/jpeg');
      setPreviewUrl(dataUri);
      setDishName(''); // Clear dish name when analyzing image
      await analyzeImageDataUri(dataUri, portionSize);
    }
  };

  const handleAddMeal = () => {
    if (!result) return;

    addMeal({
      name:
        result.foodItems?.join(', ') ||
        dishName ||
        t('analyze.analyzedMealName'),
      calories: result.estimatedCalories ?? 0,
      protein: result.protein ?? 0,
      carbs: result.carbs ?? 0,
      fat: result.fat ?? 0,
      fiber: result.fiber ?? 0,
      sugar: result.sugar ?? 0,
      sodium: result.sodium ?? 0,
      potassium: result.potassium ?? 0,
      calcium: result.calcium ?? 0,
      iron: result.iron ?? 0,
      vitaminA: result.vitaminA ?? 0,
      vitaminC: result.vitaminC ?? 0,
      vitaminD: result.vitaminD ?? 0,
      imageUrl: previewUrl || undefined,
    });

    toast({
      title: t('analyze.reviewCard.log_success_toast_title'),
      description: t('analyze.reviewCard.log_success_toast_description'),
    });
    setResult(null);
    setPreviewUrl(null);
    setDishName('');
    setPortionSize('');
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
            <Tabs
              defaultValue="search"
              className="w-full"
              onValueChange={setActiveTab}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="search">
                  <Search
                    className={cn('h-4 w-4', dir === 'ltr' ? 'mr-2' : 'ml-2')}
                  />
                  {t('analyze.tabs.search')}
                </TabsTrigger>
                <TabsTrigger value="camera">
                  <Camera
                    className={cn('h-4 w-4', dir === 'ltr' ? 'mr-2' : 'ml-2')}
                  />
                  {t('analyze.tabs.camera')}
                </TabsTrigger>
              </TabsList>
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
                      setPreviewUrl(null);
                    }}
                    className="w-full"
                  />
                  <Input
                    type="text"
                    placeholder={t('analyze.searchCard.portion_placeholder')}
                    value={portionSize}
                    onChange={(e) => setPortionSize(e.target.value)}
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
                      <Search
                        className={cn(
                          'h-4 w-4',
                          dir === 'ltr' ? 'mr-2' : 'ml-2'
                        )}
                      />
                    )}
                    {loadingSource === 'dish'
                      ? t('analyze.searchCard.button_loading')
                      : t('analyze.searchCard.button')}
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="camera" className="pt-4">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {t('analyze.cameraCard.description')}
                  </p>
                  <div className="relative flex h-64 w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed bg-muted/50">
                    <video
                      ref={videoRef}
                      className="h-full w-full object-contain"
                      autoPlay
                      playsInline
                      muted
                    />
                    {hasCameraPermission === false && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                        <Alert variant="destructive" className="m-4">
                          <AlertTitle>
                            {t('analyze.cameraCard.error_permission_title')}
                          </AlertTitle>
                          <AlertDescription>
                            {t(
                              'analyze.cameraCard.error_permission_description'
                            )}
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                    {hasCameraPermission === null && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                          <Loader2 className="h-10 w-10 animate-spin" />
                        </div>
                      </div>
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                   <Input
                    type="text"
                    placeholder={t('analyze.cameraCard.portion_placeholder')}
                    value={portionSize}
                    onChange={(e) => setPortionSize(e.target.value)}
                    className="w-full"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCaptureAndAnalyze}
                      disabled={hasCameraPermission !== true || isLoading}
                      className="w-full"
                    >
                      {loadingSource === 'image' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {loadingSource === 'image'
                        ? t('analyze.cameraCard.button_loading')
                        : t('analyze.cameraCard.button')}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setFacingMode((prev) =>
                          prev === 'user' ? 'environment' : 'user'
                        )
                      }
                      disabled={hasCameraPermission !== true || isLoading}
                      aria-label="Reverse camera"
                    >
                      <RefreshCw />
                    </Button>
                  </div>
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
                {previewUrl && (
                  <div className="relative h-48 w-full overflow-hidden rounded-lg">
                    <Image
                      src={previewUrl}
                      alt="Analyzed meal"
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold">
                    {t('analyze.reviewCard.identifiedItems')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {result.foodItems?.join(', ') || t('analyze.reviewCard.no_items_found')}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">
                    {t('analyze.reviewCard.estimatedCalories')}
                  </h3>
                  <p className="text-sm text-primary font-bold">
                    ~{result.estimatedCalories ?? 0} {t('dashboard.units.kcal')}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">
                    {t('analyze.reviewCard.estimatedNutrients')}
                  </h3>
                  <div className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
                    <span className="text-muted-foreground">
                      {t('dashboard.nutrients.protein')}:
                    </span>
                    <span className="text-left font-medium rtl:text-right">
                      {(result.protein ?? 0).toFixed(1)} {t('dashboard.units.g')}
                    </span>
                    <span className="text-muted-foreground">
                      {t('dashboard.nutrients.carbs')}:
                    </span>
                    <span className="text-left font-medium rtl:text-right">
                      {(result.carbs ?? 0).toFixed(1)} {t('dashboard.units.g')}
                    </span>
                    <span className="text-muted-foreground">
                      {t('dashboard.nutrients.fat')}:
                    </span>
                    <span className="text-left font-medium rtl:text-right">
                      {(result.fat ?? 0).toFixed(1)} {t('dashboard.units.g')}
                    </span>
                    <span className="text-muted-foreground">
                      {t('dashboard.nutrients.fiber')}:
                    </span>
                    <span className="text-left font-medium rtl:text-right">
                      {(result.fiber ?? 0).toFixed(1)} {t('dashboard.units.g')}
                    </span>
                    <span className="text-muted-foreground">
                      {t('dashboard.nutrients.sugar')}:
                    </span>
                    <span className="text-left font-medium rtl:text-right">
                      {(result.sugar ?? 0).toFixed(1)} {t('dashboard.units.g')}
                    </span>
                    <span className="text-muted-foreground">
                      {t('dashboard.nutrients.sodium')}:
                    </span>
                    <span className="text-left font-medium rtl:text-right">
                      {(result.sodium ?? 0).toFixed(0)} {t('dashboard.units.mg')}
                    </span>
                    <span className="text-muted-foreground">
                      {t('dashboard.nutrients.potassium')}:
                    </span>
                    <span className="text-left font-medium rtl:text-right">
                      {(result.potassium ?? 0).toFixed(0)} {t('dashboard.units.mg')}
                    </span>
                    <span className="text-muted-foreground">
                      {t('dashboard.nutrients.calcium')}:
                    </span>
                    <span className="text-left font-medium rtl:text-right">
                      {(result.calcium ?? 0).toFixed(0)} {t('dashboard.units.mg')}
                    </span>
                    <span className="text-muted-foreground">
                      {t('dashboard.nutrients.iron')}:
                    </span>
                    <span className="text-left font-medium rtl:text-right">
                      {(result.iron ?? 0).toFixed(1)} {t('dashboard.units.mg')}
                    </span>
                    <span className="text-muted-foreground">
                      {t('dashboard.nutrients.vitaminA')}:
                    </span>
                    <span className="text-left font-medium rtl:text-right">
                      {(result.vitaminA ?? 0).toFixed(0)} {t('dashboard.units.mcg')}
                    </span>
                    <span className="text-muted-foreground">
                      {t('dashboard.nutrients.vitaminC')}:
                    </span>
                    <span className="text-left font-medium rtl:text-right">
                      {(result.vitaminC ?? 0).toFixed(0)} {t('dashboard.units.mg')}
                    </span>
                    <span className="text-muted-foreground">
                      {t('dashboard.nutrients.vitaminD')}:
                    </span>
                    <span className="text-left font-medium rtl:text-right">
                      {(result.vitaminD ?? 0).toFixed(0)} {t('dashboard.units.mcg')}
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
