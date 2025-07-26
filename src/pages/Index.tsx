import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import { CartButton, Cart } from '@/components/ui/cart';
import { useCartStore } from '@/lib/cart-store';
import { aiImageService } from '@/lib/ai-service';

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [calculatorData, setCalculatorData] = useState({
    material: 'photo-matte',
    size: 'A4',
    quantity: 1
  });
  
  const { addItem } = useCartStore();
  
  const materialPrices = {
    'photo-matte': { base: 150, print: 200, name: 'Фотобумага матовая' },
    'photo-gloss': { base: 180, print: 200, name: 'Фотобумага глянцевая' },
    'canvas': { base: 300, print: 250, name: 'Холст' },
    'film': { base: 120, print: 180, name: 'Пленка' }
  };
  
  const sizePrices = {
    'A4': { multiplier: 1, name: 'A4 (21x29.7 см)' },
    'A3': { multiplier: 2, name: 'A3 (29.7x42 см)' },
    'A2': { multiplier: 4, name: 'A2 (42x59.4 см)' },
    'A1': { multiplier: 8, name: 'A1 (59.4x84.1 см)' },
    'A0': { multiplier: 16, name: 'A0 (84.1x118.9 см)' }
  };
  
  const calculatePrice = () => {
    const material = materialPrices[calculatorData.material as keyof typeof materialPrices];
    const size = sizePrices[calculatorData.size as keyof typeof sizePrices];
    return (material.base + material.print) * size.multiplier * calculatorData.quantity;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setGeneratedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleGenerateImage = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Введите описание изображения');
      return;
    }
    
    setIsGenerating(true);
    try {
      const result = await aiImageService.generateImage({ prompt: aiPrompt });
      if (result.success && result.imageUrl) {
        setGeneratedImage(result.imageUrl);
        setUploadedImage(null);
        toast.success('Изображение сгенерировано!');
      } else {
        toast.error(result.error || 'Ошибка генерации');
      }
    } catch (error) {
      toast.error('Произошла ошибка при генерации');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleEnhanceImage = async () => {
    const input = document.getElementById('image-upload') as HTMLInputElement;
    const file = input?.files?.[0];
    
    if (!file) {
      toast.error('Сначала загрузите изображение');
      return;
    }
    
    setIsEnhancing(true);
    try {
      const result = await aiImageService.enhanceImage(file);
      if (result.success && result.imageUrl) {
        setUploadedImage(result.imageUrl);
        toast.success('Изображение улучшено!');
      } else {
        toast.error(result.error || 'Ошибка улучшения');
      }
    } catch (error) {
      toast.error('Произошла ошибка при улучшении');
    } finally {
      setIsEnhancing(false);
    }
  };
  
  const handleRemoveBackground = async () => {
    const input = document.getElementById('image-upload') as HTMLInputElement;
    const file = input?.files?.[0];
    
    if (!file) {
      toast.error('Сначала загрузите изображение');
      return;
    }
    
    setIsEnhancing(true);
    try {
      const result = await aiImageService.removeBackground(file);
      if (result.success && result.imageUrl) {
        setUploadedImage(result.imageUrl);
        toast.success('Фон удален!');
      } else {
        toast.error(result.error || 'Ошибка удаления фона');
      }
    } catch (error) {
      toast.error('Произошла ошибка при удалении фона');
    } finally {
      setIsEnhancing(false);
    }
  };
  
  const addToCart = () => {
    const material = materialPrices[calculatorData.material as keyof typeof materialPrices];
    const size = sizePrices[calculatorData.size as keyof typeof sizePrices];
    const price = calculatePrice();
    
    addItem({
      type: 'print',
      name: `Печать ${size.name}`,
      description: `${material.name}, ${calculatorData.quantity} шт.`,
      price: price,
      quantity: 1,
      options: {
        material: material.name,
        size: size.name,
        quantity: calculatorData.quantity
      }
    });
    
    toast.success('Добавлено в корзину!');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Icon name="Printer" size={24} className="text-blue-600" />
              <span className="font-bold text-xl text-gray-900">PrintStudio</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-gray-600 hover:text-blue-600 transition-colors">Услуги</a>
              <a href="#editor" className="text-gray-600 hover:text-blue-600 transition-colors">ИИ Редактор</a>
              <a href="#calculator" className="text-gray-600 hover:text-blue-600 transition-colors">Калькулятор</a>
              <a href="#gallery" className="text-gray-600 hover:text-blue-600 transition-colors">Галерея</a>
              <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">Контакты</a>
            </div>
            <div className="flex items-center gap-2">
              <CartButton />
              <Button>Войти</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Профессиональная печать с ИИ
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Широкоформатная печать, редактор изображений с искусственным интеллектом и продажа картриджей в одном месте
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 hover-scale">
                  <Icon name="Image" size={20} className="mr-2" />
                  Попробовать ИИ редактор
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 hover-scale">
                  <Icon name="Calculator" size={20} className="mr-2" />
                  Рассчитать стоимость
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="/img/b7fb844f-1ff2-4c22-a2ea-97ea54f3b257.jpg" 
                alt="Современное печатное оборудование"
                className="rounded-lg shadow-2xl w-full h-auto hover-scale"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Наши услуги</h2>
            <p className="text-xl text-gray-600">Комплексные решения для печати и работы с изображениями</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md hover-scale">
              <CardHeader className="text-center">
                <Icon name="Printer" size={48} className="text-blue-600 mx-auto mb-4" />
                <CardTitle>Широкоформатная печать</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center mb-4">
                  Печать на различных материалах: бумага, холст, пленка. Высокое качество и быстрые сроки.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="secondary">Холст</Badge>
                  <Badge variant="secondary">Фотобумага</Badge>
                  <Badge variant="secondary">Пленка</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md hover-scale">
              <CardHeader className="text-center">
                <Icon name="Package" size={48} className="text-blue-600 mx-auto mb-4" />
                <CardTitle>Картриджи</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center mb-4">
                  Продажа и заправка картриджей для всех популярных моделей принтеров.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="secondary">Canon</Badge>
                  <Badge variant="secondary">HP</Badge>
                  <Badge variant="secondary">Epson</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md hover-scale">
              <CardHeader className="text-center">
                <Icon name="Sparkles" size={48} className="text-blue-600 mx-auto mb-4" />
                <CardTitle>ИИ Редактор</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center mb-4">
                  Редактирование изображений с помощью искусственного интеллекта. Генерация и улучшение фото.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="secondary">Text-to-Image</Badge>
                  <Badge variant="secondary">Улучшение</Badge>
                  <Badge variant="secondary">Фильтры</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Editor Section */}
      <section id="editor" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">ИИ Редактор изображений</h2>
            <p className="text-xl text-gray-600">Создавайте и редактируйте изображения с помощью искусственного интеллекта</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">Загрузить фото</TabsTrigger>
                  <TabsTrigger value="generate">Создать с ИИ</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Icon name="Upload" size={48} className="text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Нажмите или перетащите изображение</p>
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="w-full hover-scale">
                      <Icon name="Crop" size={16} className="mr-2" />
                      Обрезать
                    </Button>
                    <Button variant="outline" className="w-full hover-scale">
                      <Icon name="Palette" size={16} className="mr-2" />
                      Фильтры
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full hover-scale" 
                      onClick={handleRemoveBackground}
                      disabled={isEnhancing}
                    >
                      <Icon name="Scissors" size={16} className="mr-2" />
                      {isEnhancing ? 'Обработка...' : 'Удалить фон'}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full hover-scale" 
                      onClick={handleEnhanceImage}
                      disabled={isEnhancing}
                    >
                      <Icon name="Zap" size={16} className="mr-2" />
                      {isEnhancing ? 'Обработка...' : 'Улучшить'}
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="generate" className="space-y-4">
                  <Textarea
                    placeholder="Опишите изображение, которое хотите создать..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={4}
                  />
                  <Button 
                    className="w-full hover-scale" 
                    onClick={handleGenerateImage}
                    disabled={isGenerating}
                  >
                    <Icon name="Sparkles" size={16} className="mr-2" />
                    {isGenerating ? 'Генерирую...' : 'Сгенерировать изображение'}
                  </Button>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <Button variant="ghost" size="sm" onClick={() => setAiPrompt('Красивый закат над океаном')} className="hover-scale">
                      Закат
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setAiPrompt('Современный офис')} className="hover-scale">
                      Офис
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setAiPrompt('Абстрактное искусство')} className="hover-scale">
                      Арт
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="bg-gray-100 rounded-lg flex items-center justify-center h-96 relative">
              {(uploadedImage || generatedImage) ? (
                <>
                  <img 
                    src={uploadedImage || generatedImage} 
                    alt={uploadedImage ? "Uploaded" : "Generated"} 
                    className="max-w-full max-h-full object-contain rounded-lg animate-scale-in" 
                  />
                  {(uploadedImage || generatedImage) && (
                    <Button 
                      className="absolute top-2 right-2 hover-scale" 
                      size="sm"
                      onClick={() => {
                        addItem({
                          type: 'service',
                          name: 'Обработка изображения',
                          description: 'Профессиональная обработка вашего изображения',
                          price: 500,
                          quantity: 1,
                          imageUrl: uploadedImage || generatedImage || undefined
                        });
                        toast.success('Изображение добавлено в корзину!');
                      }}
                    >
                      <Icon name="Plus" size={16} className="mr-2" />
                      В корзину
                    </Button>
                  )}
                </>
              ) : (
                <div className="text-center text-gray-500">
                  <Icon name="ImageIcon" size={64} className="mx-auto mb-4" />
                  <p>Изображение появится здесь</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section id="calculator" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Калькулятор стоимости</h2>
            <p className="text-xl text-gray-600">Рассчитайте стоимость печати онлайн</p>
          </div>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Тип материала</label>
                    <select 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={calculatorData.material}
                      onChange={(e) => setCalculatorData({...calculatorData, material: e.target.value})}
                    >
                      <option value="photo-matte">Фотобумага матовая</option>
                      <option value="photo-gloss">Фотобумага глянцевая</option>
                      <option value="canvas">Холст</option>
                      <option value="film">Пленка</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Размер</label>
                    <select 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={calculatorData.size}
                      onChange={(e) => setCalculatorData({...calculatorData, size: e.target.value})}
                    >
                      <option value="A4">A4 (21x29.7 см)</option>
                      <option value="A3">A3 (29.7x42 см)</option>
                      <option value="A2">A2 (42x59.4 см)</option>
                      <option value="A1">A1 (59.4x84.1 см)</option>
                      <option value="A0">A0 (84.1x118.9 см)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Количество</label>
                    <Input 
                      type="number" 
                      value={calculatorData.quantity}
                      onChange={(e) => setCalculatorData({...calculatorData, quantity: parseInt(e.target.value) || 1})}
                      min="1" 
                    />
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Стоимость</h3>
                  <div className="space-y-2 text-gray-600 mb-6">
                    <div className="flex justify-between">
                      <span>Материал:</span>
                      <span>{materialPrices[calculatorData.material as keyof typeof materialPrices].base * sizePrices[calculatorData.size as keyof typeof sizePrices].multiplier} ₽</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Печать:</span>
                      <span>{materialPrices[calculatorData.material as keyof typeof materialPrices].print * sizePrices[calculatorData.size as keyof typeof sizePrices].multiplier} ₽</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Количество:</span>
                      <span>{calculatorData.quantity} шт</span>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-2xl font-bold text-blue-600">
                      <span>Итого:</span>
                      <span>{calculatePrice().toLocaleString()} ₽</span>
                    </div>
                  </div>
                  <Button className="w-full mt-6 hover-scale" onClick={addToCart}>
                    <Icon name="ShoppingCart" size={16} className="mr-2" />
                    Добавить в корзину
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Галерея работ</h2>
            <p className="text-xl text-gray-600">Примеры наших работ</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Card key={item} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover-scale">
                <div className="aspect-square bg-gray-200 relative overflow-hidden">
                  <img 
                    src="/img/ad49bbcb-c1dd-48cb-ab6a-49d5e270e27a.jpg" 
                    alt={`Работа ${item}`}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900">Проект {item}</h3>
                  <p className="text-gray-600 text-sm">Широкоформатная печать на холсте</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Свяжитесь с нами</h2>
            <p className="text-xl text-gray-300">Готовы ответить на ваши вопросы</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6">Контактная информация</h3>
              <div className="space-y-4">
                <div className="flex items-center hover-scale cursor-pointer">
                  <Icon name="Phone" size={20} className="text-blue-400 mr-4" />
                  <span>+7 (495) 123-45-67</span>
                </div>
                <div className="flex items-center hover-scale cursor-pointer">
                  <Icon name="Mail" size={20} className="text-blue-400 mr-4" />
                  <span>info@printstudio.ru</span>
                </div>
                <div className="flex items-center hover-scale cursor-pointer">
                  <Icon name="MapPin" size={20} className="text-blue-400 mr-4" />
                  <span>Москва, ул. Печатная, д. 1</span>
                </div>
                <div className="flex items-center hover-scale cursor-pointer">
                  <Icon name="Clock" size={20} className="text-blue-400 mr-4" />
                  <span>Пн-Пт: 9:00-18:00, Сб: 10:00-16:00</span>
                </div>
              </div>
            </div>

            <Card className="bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold text-white mb-6">Написать нам</h3>
                <div className="space-y-4">
                  <Input placeholder="Ваше имя" className="bg-gray-700 border-gray-600 text-white" />
                  <Input placeholder="Email" type="email" className="bg-gray-700 border-gray-600 text-white" />
                  <Textarea placeholder="Сообщение" rows={4} className="bg-gray-700 border-gray-600 text-white" />
                  <Button className="w-full hover-scale">Отправить сообщение</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Icon name="Printer" size={24} className="text-blue-400" />
              <span className="font-bold text-xl">PrintStudio</span>
            </div>
            <p className="text-gray-400">© 2024 PrintStudio. Все права защищены.</p>
          </div>
        </div>
      </footer>
      
      <Cart />
    </div>
  );
};

export default Index;