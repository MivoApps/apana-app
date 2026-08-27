'use client';

import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Plus, Minus, Check } from 'lucide-react';
import { Product, ProductOptionGroup, SelectedOption } from '@/types/store';
import { formatCurrency } from '@/lib/whatsapp';

interface Props {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, selectedOptions: SelectedOption[]) => void;
  primaryColor?: string;
  themeStyle?: 'minimalista' | 'moderna' | 'elegante';
}

export const ProductOptionsModal: React.FC<Props> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  primaryColor = '#059669',
  themeStyle = 'minimalista',
}) => {
  const [selectedValues, setSelectedValues] = useState<{ [groupId: string]: string }>({});
  const [quantity, setQuantity] = useState(1);

  const isElegant = themeStyle === 'elegante';
  const isModern = themeStyle === 'moderna';

  // Inicializar la primera opción de cada grupo por defecto cuando se abre el modal
  useEffect(() => {
    if (product && product.options && product.options.length > 0) {
      const initialSelection: { [groupId: string]: string } = {};
      product.options.forEach((group) => {
        if (group.values.length > 0) {
          initialSelection[group.id] = group.values[0].id;
        }
      });
      setSelectedValues(initialSelection);
      setQuantity(1);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const options: ProductOptionGroup[] = product.options || [];

  // Calcular las opciones seleccionadas completas
  const selectedOptionsList: SelectedOption[] = options.map((group) => {
    const selectedValId = selectedValues[group.id];
    const valObj = group.values.find((v) => v.id === selectedValId) || group.values[0];
    return {
      groupTitle: group.title,
      valueName: valObj?.name || '',
      priceDifference: valObj?.priceDifference || 0,
    };
  }).filter(o => o.valueName.trim() !== '');

  // Calcular precio unitario con deltas
  const priceDelta = selectedOptionsList.reduce((acc, opt) => acc + (opt.priceDifference || 0), 0);
  const unitPrice = Math.max(0, product.price + priceDelta);
  const totalPrice = unitPrice * quantity;

  const handleSelectOption = (groupId: string, valueId: string) => {
    setSelectedValues((prev) => ({
      ...prev,
      [groupId]: valueId,
    }));
  };

  const handleConfirm = () => {
    onAddToCart(product, selectedOptionsList);
    onClose();
  };

  // Buscar si alguna opción seleccionada tiene una imagen vinculada
  const activeVariantImage = options.reduce<string | null>((foundImg, group) => {
    if (foundImg) return foundImg;
    const selectedValId = selectedValues[group.id];
    const valObj = group.values.find((v) => v.id === selectedValId);
    return valObj?.imageUrl || null;
  }, null);

  const displayImage = activeVariantImage || product.imageUrl || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=300&q=80';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal / Bottom Sheet Box */}
      <div className={`relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10 animate-in slide-in-from-bottom duration-300 ${
        isElegant ? 'bg-[#FAF8F5] text-stone-900 border border-[#E7E2D9]' : 'bg-white text-[#0b1c30]'
      }`}>
        
        {/* Header with Product Info */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between gap-3 ${
          isElegant ? 'bg-[#FAF8F5] border-[#E7E2D9]' : 'bg-slate-50/50 border-gray-100'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={displayImage}
              alt={product.title}
              className={`w-14 h-14 object-cover shrink-0 transition-all duration-200 ${
                isElegant ? 'rounded-xl border border-[#E7E2D9]' : 'rounded-2xl border border-gray-200'
              }`}
            />
            <div className="min-w-0">
              <h3 className={`font-extrabold text-sm sm:text-base truncate ${
                isElegant ? 'font-playfair text-stone-900' : isModern ? 'font-space-grotesk' : 'font-plus-jakarta'
              }`}>
                {product.title}
              </h3>
              <p className={`text-sm font-bold mt-0.5 ${
                isElegant ? 'font-playfair italic text-stone-900' : ''
              }`}
                style={!isElegant ? { color: primaryColor } : undefined}
              >
                {formatCurrency(unitPrice)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Options Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {options.map((group) => {
            const currentSelectedValId = selectedValues[group.id];

            return (
              <div key={group.id} className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${
                    isElegant ? 'font-playfair text-stone-800' : 'text-[#0b1c30]'
                  }`}>
                    {group.title}
                  </label>
                  <span className={`text-[11px] font-semibold ${
                    isElegant ? 'text-amber-800' : 'text-[#059669]'
                  }`}>
                    {(() => {
                      const sel = group.values.find((v) => v.id === currentSelectedValId);
                      if (!sel) return '';
                      return (!sel.priceDifference || sel.priceDifference === 0)
                        ? sel.name.replace(/\s+0+(\.0+)?$/, '').trim()
                        : sel.name;
                    })()}
                  </span>
                </div>

                {/* Option Chips Grid */}
                <div className="flex flex-wrap gap-2">
                  {group.values.map((val) => {
                    const isSelected = currentSelectedValId === val.id;
                    const hasDiff = val.priceDifference && val.priceDifference > 0;
                    const cleanValName = (!val.priceDifference || val.priceDifference === 0)
                      ? val.name.replace(/\s+0+(\.0+)?$/, '').trim()
                      : val.name;

                    return (
                      <button
                        key={val.id}
                        type="button"
                        onClick={() => handleSelectOption(group.id, val.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? isElegant
                              ? 'bg-amber-900 text-white shadow-sm ring-2 ring-amber-400/30'
                              : isModern
                              ? 'bg-[#059669] text-white shadow-md shadow-[#059669]/20 ring-2 ring-[#059669]/30 scale-[1.02]'
                              : 'bg-neutral-900 text-white shadow-2xs'
                            : isElegant
                            ? 'bg-white hover:bg-amber-50/50 text-stone-800 border border-[#E7E2D9]'
                            : isModern
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80'
                            : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200/80'
                        }`}
                      >
                        {isSelected && <Check size={13} className="stroke-[3]" />}
                        {val.imageUrl && (
                          <img
                            src={val.imageUrl}
                            alt={cleanValName}
                            className="w-4 h-4 rounded-md object-cover border border-black/10 shrink-0"
                          />
                        )}
                        <span>{cleanValName}</span>
                        {hasDiff && (
                          <span className={`text-[10px] ml-0.5 ${
                            isSelected ? 'text-amber-100 font-normal' : isElegant ? 'text-amber-800' : 'text-[#059669]'
                          }`}>
                            (+{formatCurrency(val.priceDifference!)})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Actions Bar */}
        <div className={`p-4 sm:p-5 border-t flex items-center gap-3 ${
          isElegant ? 'bg-[#FAF8F5] border-[#E7E2D9]' : 'bg-white border-gray-100'
        }`}>
          {/* Quantity selector */}
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-7 h-7 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center text-slate-700 font-bold shadow-2xs transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="w-5 text-center font-bold text-xs text-[#0b1c30]">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-7 h-7 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center text-slate-700 font-bold shadow-2xs transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Add button */}
          <button
            type="button"
            onClick={handleConfirm}
            style={{ backgroundColor: primaryColor }}
            className={`flex-1 h-12 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer ${
              isElegant ? 'rounded-2xl font-playfair tracking-wide' : isModern ? 'rounded-2xl uppercase font-space-grotesk' : 'rounded-xl font-plus-jakarta'
            }`}
          >
            <ShoppingBag size={17} />
            <span>Agregar al carrito · {formatCurrency(totalPrice)}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
