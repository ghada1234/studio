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
        title: 'لم يتم تحديد أي ملف',
        description: 'الرجاء اختيار صورة لتحليلها.',
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
        title: 'اكتمل التحليل!',
        description: 'المعلومات الغذائية التقديرية متاحة الآن.',
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: 'فشل التحليل',
        description: 'تعذر تحليل الصورة. يرجى تجربة صورة أخرى.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMeal = () => {
    if (!result) return;

    addMeal({
      name: result.foodItems.join(', ') || 'وجبة تم تحليلها',
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
      title: 'تم تسجيل الوجبة!',
      description: 'تمت إضافة الوجبة التي تم تحليلها إلى لوحة التحكم اليومية الخاصة بك.',
    });
    setResult(null);
    setFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="flex flex-col gap-8 p-4 sm:p-6 md:p-8">
      <header>
        <h1 className="font-headline text-4xl font-bold">
          تحليل الوجبة بالذكاء الاصطناعي
        </h1>
        <p className="text-muted-foreground">
          حمّل صورة لوجبتك ودع الذكاء الاصطناعي يقوم بالعمل الشاق.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">1. تحميل الصورة</CardTitle>
            <CardDescription>
              اختر صورة واضحة لوجبتك.
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
                  <p>انقر أو اسحب للتحميل</p>
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
              {isLoading ? 'يتم التحليل...' : 'تحليل الوجبة'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">2. مراجعة التحليل</CardTitle>
            <CardDescription>
              إليك المعلومات الغذائية التقديرية.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && (
              <div className="flex flex-col items-center justify-center space-y-2 pt-10 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>جاري تحليل الصورة...</p>
              </div>
            )}
            {result ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">العناصر الغذائية المحددة</h3>
                  <p className="text-sm text-muted-foreground">
                    {result.foodItems.join(', ')}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">السعرات الحرارية التقديرية</h3>
                  <p className="text-sm text-primary font-bold">
                    ~{result.estimatedCalories} سعرة حرارية
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">العناصر الغذائية التقديرية</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <span className="text-muted-foreground">بروتين:</span>
                    <span className="text-left font-medium">{result.protein?.toFixed(1)} غ</span>
                    <span className="text-muted-foreground">كربوهيدرات:</span>
                    <span className="text-left font-medium">{result.carbs?.toFixed(1)} غ</span>
                    <span className="text-muted-foreground">دهون:</span>
                    <span className="text-left font-medium">{result.fat?.toFixed(1)} غ</span>
                    <span className="text-muted-foreground">ألياف:</span>
                    <span className="text-left font-medium">{result.fiber?.toFixed(1)} غ</span>
                     <span className="text-muted-foreground">سكر:</span>
                    <span className="text-left font-medium">{result.sugar?.toFixed(1)} غ</span>
                    <span className="text-muted-foreground">صوديوم:</span>
                    <span className="text-left font-medium">{result.sodium?.toFixed(0)} ملغ</span>
                    <span className="text-muted-foreground">بوتاسيوم:</span>
                    <span className="text-left font-medium">{result.potassium?.toFixed(0)} ملغ</span>
                    <span className="text-muted-foreground">كالسيوم:</span>
                    <span className="text-left font-medium">{result.calcium?.toFixed(0)} ملغ</span>
                    <span className="text-muted-foreground">حديد:</span>
                    <span className="text-left font-medium">{result.iron?.toFixed(1)} ملغ</span>
                    <span className="text-muted-foreground">فيتامين أ:</span>
                    <span className="text-left font-medium">{result.vitaminA?.toFixed(0)} مكغ</span>
                    <span className="text-muted-foreground">فيتامين ج:</span>
                    <span className="text-left font-medium">{result.vitaminC?.toFixed(0)} ملغ</span>
                    <span className="text-muted-foreground">فيتامين د:</span>
                    <span className="text-left font-medium">{result.vitaminD?.toFixed(0)} مكغ</span>
                  </div>
                </div>

                <Button
                  onClick={handleAddMeal}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  إضافة إلى السجل اليومي
                </Button>
              </div>
            ) : (
              !isLoading && (
                <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                  <p>ستظهر نتائج التحليل هنا.</p>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
