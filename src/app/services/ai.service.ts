import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class Ai {
  async compareRecitation(quranText: string, spokenText: string): Promise<any> {
    const messages = [
      {
        role: 'system',
        content:
          'أنت خبير في تحليل التلاوة القرآنية، قارِن بين النص القرآني الأصلي والنص المنطوق وحدد الأخطاء في الحركات أو الكلمات أو الترتيب.'
      },
      {
        role: 'user',
        content: `
النص القرآني: ${quranText}
النص المنطوق: ${spokenText}

ارجع النتيجة بتنسيق JSON يحتوي على:
{
  "accuracy": نسبة_التطابق_من_0_إلى_1,
  "mistakes": [
    {"original":"الكلمة الأصلية","spoken":"الكلمة المنطوقة","type":"نوع الخطأ"}
  ],
  "summary":"تحليل عام موجز"
}`
      }
    ];

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${environment.openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 50,
        response_format: { type: 'json_object' }
      })
    });

    const data = await res.json();
    try {
      return JSON.parse(data.choices[0].message.content);
    } catch {
      return { accuracy: 0, mistakes: [], summary: 'خطأ في التحليل' };
    }
  }
}
