import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCartStore, type CartItem } from '@/lib/cart-store';
import Icon from '@/components/ui/icon';

export function CartButton() {
  const { toggleCart, getTotalItems } = useCartStore();
  const totalItems = getTotalItems();

  return (
    <Button variant="outline" onClick={toggleCart} className="relative">
      <Icon name="ShoppingCart" size={20} />
      {totalItems > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {totalItems}
        </Badge>
      )}
    </Button>
  );
}

export function Cart() {
  const { 
    items, 
    isOpen, 
    toggleCart, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    getTotalPrice, 
    createOrder 
  } = useCartStore();

  const [showCheckout, setShowCheckout] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [orderPlaced, setOrderPlaced] = useState<string | null>(null);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(id, newQuantity);
  };

  const handleCheckout = () => {
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    const orderId = createOrder(customerInfo);
    setOrderPlaced(orderId);
    setShowCheckout(false);
    setCustomerInfo({ name: '', email: '', phone: '', address: '' });
  };

  const OrderSuccessDialog = () => (
    <div className="text-center py-8">
      <Icon name="CheckCircle" size={64} className="text-green-500 mx-auto mb-4" />
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Заказ оформлен!</h3>
      <p className="text-gray-600 mb-4">Номер заказа: <strong>{orderPlaced}</strong></p>
      <p className="text-sm text-gray-500 mb-6">
        Мы свяжемся с вами в течение часа для подтверждения деталей
      </p>
      <Button onClick={() => setOrderPlaced(null)}>Понятно</Button>
    </div>
  );

  if (orderPlaced) {
    return (
      <Sheet open={isOpen} onOpenChange={toggleCart}>
        <SheetContent className="w-full sm:w-96">
          <OrderSuccessDialog />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={toggleCart}>
      <SheetContent className="w-full sm:w-96 flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Icon name="ShoppingCart" size={24} />
            Корзина ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Icon name="ShoppingCart" size={64} className="mx-auto mb-4 opacity-50" />
              <p>Корзина пуста</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItemCard 
                    key={item.id} 
                    item={item} 
                    onQuantityChange={handleQuantityChange}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Итого:</span>
                <span>{getTotalPrice().toLocaleString()} ₽</span>
              </div>

              {!showCheckout ? (
                <div className="space-y-2">
                  <Button className="w-full" onClick={() => setShowCheckout(true)}>
                    Оформить заказ
                  </Button>
                  <Button variant="outline" className="w-full" onClick={clearCart}>
                    Очистить корзину
                  </Button>
                </div>
              ) : (
                <CheckoutForm 
                  customerInfo={customerInfo}
                  setCustomerInfo={setCustomerInfo}
                  onCheckout={handleCheckout}
                  onCancel={() => setShowCheckout(false)}
                />
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CartItemCard({ 
  item, 
  onQuantityChange, 
  onRemove 
}: { 
  item: CartItem;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <Card className="border-gray-200">
      <CardContent className="p-4">
        <div className="flex gap-3">
          {item.imageUrl && (
            <img 
              src={item.imageUrl} 
              alt={item.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-gray-900 truncate">{item.name}</h4>
            <p className="text-xs text-gray-500 mt-1">{item.description}</p>
            
            {item.options && (
              <div className="flex flex-wrap gap-1 mt-2">
                {Object.entries(item.options).map(([key, value]) => (
                  <Badge key={key} variant="secondary" className="text-xs">
                    {value}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                  className="h-8 w-8 p-0"
                >
                  <Icon name="Minus" size={12} />
                </Button>
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                  className="h-8 w-8 p-0"
                >
                  <Icon name="Plus" size={12} />
                </Button>
              </div>

              <div className="text-right">
                <div className="font-bold text-sm">{(item.price * item.quantity).toLocaleString()} ₽</div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(item.id)}
                  className="text-red-500 hover:text-red-700 p-1 h-auto"
                >
                  <Icon name="Trash2" size={14} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CheckoutForm({ 
  customerInfo, 
  setCustomerInfo, 
  onCheckout, 
  onCancel 
}: {
  customerInfo: any;
  setCustomerInfo: (info: any) => void;
  onCheckout: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-4">
      <Separator />
      <h3 className="font-medium">Контактная информация</h3>
      
      <div className="space-y-3">
        <div>
          <Label htmlFor="name">Имя *</Label>
          <Input
            id="name"
            value={customerInfo.name}
            onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
            placeholder="Ваше имя"
          />
        </div>
        
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={customerInfo.email}
            onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
            placeholder="example@email.com"
          />
        </div>
        
        <div>
          <Label htmlFor="phone">Телефон *</Label>
          <Input
            id="phone"
            value={customerInfo.phone}
            onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
            placeholder="+7 (999) 123-45-67"
          />
        </div>
        
        <div>
          <Label htmlFor="address">Адрес доставки</Label>
          <Input
            id="address"
            value={customerInfo.address}
            onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
            placeholder="Адрес (опционально)"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={onCheckout} className="flex-1">
          <Icon name="CreditCard" size={16} className="mr-2" />
          Заказать
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </div>
  );
}