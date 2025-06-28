
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
import { Loader2, UploadCloud, Search, Camera } from 'lucide-react';
import Image from 'next/image';
import type { AnalyzeFoodImageOutput } from '@/ai/flows/analyze-food-image';
import { useTranslation } from '@/hooks/use-translation';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

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
  const { t, dir } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('image');
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isLoading = loadingSource !== 'idle';

  React.useEffect(() => {
    document.title = `${t('analyze.title')} - NutriSnap`;
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router, t]);

  const startCamera = async () => {
    // Stop any existing stream before starting a new one
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setHasCameraPermission(true);
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

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

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

  const analyzeImageDataUri = async (dataUri: string) => {
    if (!dataUri) return;

    setLoadingSource('image');
    setResult(null);

    try {
      const analysisResult = await analyzeFoodImage({
        photoDataUri: dataUri,
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

  const handleAnalyzeImage = async () => {
    if (!file || !previewUrl) {
      toast({
        title: t('analyze.uploadCard.error_no_file_title'),
        description: t('analyze.uploadCard.error_no_file_description'),
        variant: 'destructive',
      });
      return;
    }
    setDishName('');
    await analyzeImageDataUri(previewUrl);
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
    setFile(null);
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

  const handleCaptureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUri = canvas.toDataURL('image/jpeg');
      setPreviewUrl(dataUri);
      setFile(null); // Unset file if we are using camera
      setDishName(''); // Unset dish name
      await analyzeImageDataUri(dataUri);
    }
  };

  const handleAddMeal = () => {
    if (!result) return;

    addMeal({
      name:
        result.foodItems.join(', ') ||
        dishName ||
        t('analyze.analyzedMealName'),
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
            <Tabs
              defaultValue="image"
              className="w-full"
              onValueChange={setActiveTab}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="image">
                  <UploadCloud
                    className={cn('h-4 w-4', dir === 'ltr' ? 'mr-2' : 'ml-2')}
                  />
                  {t('analyze.tabs.image')}
                </TabsTrigger>
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
                    {previewUrl && activeTab === 'image' ? (
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
                    {loadingSource === 'image' && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
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
                  <div className="relative flex h-64 w-full items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
                    {hasCameraPermission === false ? (
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
                    ) : hasCameraPermission === null ? (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <Loader2 className="h-10 w-10 animate-spin" />
                      </div>
                    ) : null}
                    <video
                      ref={videoRef}
                      className={cn(
                        'h-full w-full rounded-lg object-contain',
                        hasCameraPermission ? 'block' : 'hidden'
                      )}
                      autoPlay
                      playsInline
                      muted
                    />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                  <Button
                    onClick={handleCaptureAndAnalyze}
                    disabled={!hasCameraPermission || isLoading}
                    className="w-full"
                  >
                    {loadingSource === 'image' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {loadingSource === 'image'
                      ? t('analyze.cameraCard.button_loading')
                      : t('analyze.cameraCard.button')}
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
                  <div className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
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
