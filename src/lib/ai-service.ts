// AI Image Generation Service using Hugging Face API (free tier)
export interface AIImageRequest {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
}

export interface AIImageResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

// Using Hugging Face's free Stable Diffusion API
const HF_API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";

class AIImageService {
  private apiKey: string | null = null;

  constructor() {
    // В реальном проекте API ключ должен храниться в переменных окружения
    // Для демо используем публичный доступ (с ограничениями)
    this.apiKey = import.meta.env.VITE_HF_API_KEY || null;
  }

  async generateImage(request: AIImageRequest): Promise<AIImageResponse> {
    try {
      // Симуляция задержки для демонстрации
      await new Promise(resolve => setTimeout(resolve, 2000));

      // В реальной интеграции здесь был бы запрос к API
      const response = await this.callHuggingFaceAPI(request);
      
      if (response.success) {
        return {
          success: true,
          imageUrl: response.imageUrl
        };
      } else {
        return {
          success: false,
          error: response.error || "Не удалось сгенерировать изображение"
        };
      }
    } catch (error) {
      console.error('AI Generation Error:', error);
      return {
        success: false,
        error: "Ошибка сервиса генерации изображений"
      };
    }
  }

  private async callHuggingFaceAPI(request: AIImageRequest): Promise<AIImageResponse> {
    // Для демо возвращаем заглушку
    // В реальном проекте здесь был бы настоящий API вызов
    if (Math.random() > 0.3) { // 70% успешных генераций для демо
      return {
        success: true,
        imageUrl: await this.generatePlaceholderImage(request.prompt)
      };
    } else {
      return {
        success: false,
        error: "Сервис временно недоступен"
      };
    }
  }

  private async generatePlaceholderImage(prompt: string): Promise<string> {
    // Генерируем placeholder изображение с текстом промпта
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 512;
    canvas.height = 512;
    
    if (ctx) {
      // Создаем градиентный фон
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#3B82F6');
      gradient.addColorStop(1, '#1E40AF');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Добавляем текст
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Inter';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Разбиваем длинный текст на строки
      const words = prompt.split(' ');
      const lines: string[] = [];
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > canvas.width - 40 && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);
      
      // Рисуем текст по центру
      const startY = canvas.height / 2 - (lines.length - 1) * 15;
      lines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, startY + index * 30);
      });
      
      // Добавляем водяной знак
      ctx.font = '16px Inter';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText('AI Generated Demo', canvas.width / 2, canvas.height - 30);
    }
    
    return canvas.toDataURL('image/png');
  }

  async enhanceImage(imageFile: File): Promise<AIImageResponse> {
    // Симуляция улучшения изображения
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Для демо просто возвращаем исходное изображение с фильтром
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = img.width;
            canvas.height = img.height;
            
            if (ctx) {
              // Применяем фильтр улучшения (увеличиваем контрастность и насыщенность)
              ctx.filter = 'contrast(1.2) saturate(1.3) brightness(1.1)';
              ctx.drawImage(img, 0, 0);
              
              resolve({
                success: true,
                imageUrl: canvas.toDataURL('image/jpeg', 0.9)
              });
            }
          };
          img.src = reader.result as string;
        };
        reader.readAsDataURL(imageFile);
      });
    } catch (error) {
      return {
        success: false,
        error: "Не удалось улучшить изображение"
      };
    }
  }

  async removeBackground(imageFile: File): Promise<AIImageResponse> {
    // Симуляция удаления фона
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = img.width;
            canvas.height = img.height;
            
            if (ctx) {
              // Простая симуляция удаления фона - делаем края полупрозрачными
              ctx.drawImage(img, 0, 0);
              
              // Создаем радиальный градиент для эффекта удаления фона
              const gradient = ctx.createRadialGradient(
                canvas.width / 2, canvas.height / 2, 0,
                canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2
              );
              gradient.addColorStop(0, 'rgba(0,0,0,0)');
              gradient.addColorStop(0.7, 'rgba(0,0,0,0)');
              gradient.addColorStop(1, 'rgba(0,0,0,1)');
              
              ctx.globalCompositeOperation = 'destination-out';
              ctx.fillStyle = gradient;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              
              resolve({
                success: true,
                imageUrl: canvas.toDataURL('image/png')
              });
            }
          };
          img.src = reader.result as string;
        };
        reader.readAsDataURL(imageFile);
      });
    } catch (error) {
      return {
        success: false,
        error: "Не удалось удалить фон"
      };
    }
  }
}

export const aiImageService = new AIImageService();