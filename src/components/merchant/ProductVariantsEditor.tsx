'use client';

import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Layers,
  Lock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Tag,
  Camera,
  Image as ImageIcon,
  Check,
  X
} from 'lucide-react';
import { ProductOptionGroup, ProductOptionValue, StorePlan } from '@/types/store';
import Link from 'next/link';

interface Props {
  options: ProductOptionGroup[];
  onChange: (options: ProductOptionGroup[]) => void;
  storePlan?: StorePlan | string;
  basePrice?: number;
  availableImages?: string[];
}

const COMMON_GROUP_PRESETS = [
  'Talla',
  'Color',
  'Sabor',
  'Presentación',
  'Tamaño',
  'Tipo'
];

export const ProductVariantsEditor: React.FC<Props> = ({
  options = [],
  onChange,
  storePlan = 'gratis',
  basePrice = 0,
  availableImages = [],
}) => {
  const isFree = storePlan === 'gratis';
  const isEmprendedor = storePlan === 'emprendedor';
  const isNegocio = storePlan === 'negocio';

  // Límites según el plan
  const maxGroups = isFree ? 1 : isEmprendedor ? 2 : 99;
  const maxValuesPerGroup = isFree ? 4 : isEmprendedor ? 15 : 99;
  const allowPriceDifference = !isFree;

  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(
    options[0]?.id || null
  );
  const [activePickerValueId, setActivePickerValueId] = useState<string | null>(null);

  const handleAddGroup = (presetTitle: string = '') => {
    if (options.length >= maxGroups) return;

    const newGroup: ProductOptionGroup = {
      id: `group-${Date.now()}`,
      title: presetTitle,
      required: true,
      values: [
        { id: `val-${Date.now()}-1`, name: '', priceDifference: 0 },
        { id: `val-${Date.now()}-2`, name: '', priceDifference: 0 },
      ],
    };

    const updated = [...options, newGroup];
    onChange(updated);
    setExpandedGroupId(newGroup.id);
  };

  const handleRemoveGroup = (groupId: string) => {
    onChange(options.filter((g) => g.id !== groupId));
  };

  const handleGroupTitleChange = (groupId: string, title: string) => {
    onChange(
      options.map((g) => (g.id === groupId ? { ...g, title } : g))
    );
  };

  const handleAddValue = (groupId: string) => {
    const group = options.find((g) => g.id === groupId);
    if (!group) return;
    if (group.values.length >= maxValuesPerGroup) return;

    const updated = options.map((g) => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        values: [
          ...g.values,
          { id: `val-${Date.now()}-${g.values.length + 1}`, name: '', priceDifference: 0 },
        ],
      };
    });
    onChange(updated);
  };

  const handleRemoveValue = (groupId: string, valueId: string) => {
    const updated = options.map((g) => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        values: g.values.filter((v) => v.id !== valueId),
      };
    });
    onChange(updated);
  };

  const handleValueChange = (
    groupId: string,
    valueId: string,
    field: keyof ProductOptionValue,
    val: any
  ) => {
    const updated = options.map((g) => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        values: g.values.map((v) => (v.id === valueId ? { ...v, [field]: val } : v)),
      };
    });
    onChange(updated);
  };

  const getOptionPlaceholder = (title: string, index: number) => {
    const lower = title.toLowerCase();
    if (lower.includes('talla')) {
      const examples = ['S', 'M', 'L', 'XL', 'XXL'];
      return `Ej: ${examples[index] || 'Talla'}`;
    }
    if (lower.includes('color')) {
      const examples = ['Negro', 'Blanco', 'Azul', 'Rojo', 'Verde'];
      return `Ej: ${examples[index] || 'Color'}`;
    }
    if (lower.includes('sabor')) {
      const examples = ['Chocolate', 'Vainilla', 'Fresa', 'Lúcuma'];
      return `Ej: ${examples[index] || 'Sabor'}`;
    }
    if (lower.includes('presentación') || lower.includes('tamaño')) {
      const examples = ['250g', '500g', '1 Kilo', 'Pack Familiar'];
      return `Ej: ${examples[index] || 'Presentación'}`;
    }
    return `Opción ${index + 1} (ej. Opción ${index + 1})`;
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-bold text-[#0b1c30] flex items-center gap-2">
            <Layers size={16} className="text-[#059669]" />
            <span>Opciones / Variantes del Producto</span>
          </label>
          <p className="text-xs text-[#6d7a72] mt-0.5">
            Configura tallas, colores, sabores o presentaciones para este producto.
          </p>
        </div>

        {options.length < maxGroups && (
          <button
            type="button"
            onClick={() => handleAddGroup('')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#059669]/10 text-[#006c49] hover:bg-[#059669]/20 font-bold text-xs transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>Agregar Grupo</span>
          </button>
        )}
      </div>

      {/* Candado informativo Plan Gratis */}
      {isFree && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
          <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">
            <strong>Plan Gratis:</strong> Puedes crear hasta 1 grupo con 4 opciones (mismo precio). Para asignar precios diferentes por tamaño/presentación o más grupos,{' '}
            <Link href="/plans" className="text-[#006c49] font-bold underline hover:opacity-80">
              actualiza al Plan Emprendedor
            </Link>.
          </div>
        </div>
      )}

      {options.length === 0 ? (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-6 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#059669] flex items-center justify-center mx-auto">
            <Layers size={20} />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#0b1c30]">
              Este producto no tiene variantes
            </p>
            <p className="text-[11px] text-[#6d7a72] max-w-sm mx-auto">
              Si tu producto se vende en distintos tamaños, fragancias o colores, agrega un grupo de opciones.
            </p>
          </div>

          {/* Botón y sugerencias rápidas */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            <span className="text-[11px] text-[#6d7a72] mr-1">Crear con:</span>
            {COMMON_GROUP_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleAddGroup(preset)}
                className="px-2.5 py-1 rounded-lg bg-white border border-[#bccac0]/60 text-[11px] font-bold text-[#0b1c30] hover:border-[#059669] hover:text-[#059669] shadow-2xs transition-colors cursor-pointer"
              >
                + {preset}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {options.map((group, gIndex) => {
            const isExpanded = expandedGroupId === group.id;

            return (
              <div
                key={group.id}
                className="bg-white border border-[#bccac0]/40 rounded-2xl overflow-hidden shadow-2xs transition-all"
              >
                {/* Group Header */}
                <div className="p-3.5 bg-slate-50/80 border-b border-slate-100 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-[#059669] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {gIndex + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            required
                            value={group.title}
                            onChange={(e) => handleGroupTitleChange(group.id, e.target.value)}
                            placeholder="Nombre del grupo (ej: Talla, Color, Sabor...) *"
                            className={`w-full bg-white font-bold text-xs text-[#0b1c30] placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-1 focus:ring-[#059669] rounded-lg px-2.5 py-1.5 border transition-colors ${
                              !group.title.trim() ? 'border-amber-400 focus:border-amber-500 ring-1 ring-amber-200' : 'border-slate-200'
                            }`}
                          />
                          {!group.title.trim() && (
                            <span className="absolute right-2 text-[10px] font-bold text-amber-700 pointer-events-none bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              * Obligatorio
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setExpandedGroupId(isExpanded ? null : group.id)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                        title={isExpanded ? 'Contraer' : 'Expandir'}
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveGroup(group.id)}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar grupo de opciones"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Sugerencias Rápidas de Título si está vacío */}
                  {!group.title && (
                    <div className="flex items-center gap-1.5 pl-7 flex-wrap">
                      <span className="text-[10px] text-amber-800 font-bold">Elegir sugerencia:</span>
                      {COMMON_GROUP_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleGroupTitleChange(group.id, preset)}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-[#059669] hover:text-[#059669] text-slate-600 cursor-pointer transition-colors"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Group Body: Values List */}
                {isExpanded && (
                  <div className="p-4 space-y-3">
                    <div className="space-y-2.5">
                      {group.values.map((val, vIndex) => (
                        <div key={val.id} className="flex flex-col gap-2 p-2 bg-slate-50/70 border border-slate-200/80 rounded-xl">
                          <div className="flex items-center gap-2">
                            {/* Value Name Input */}
                            <div className="flex-1 relative flex items-center">
                              <input
                                type="text"
                                required
                                value={val.name}
                                onChange={(e) =>
                                  handleValueChange(group.id, val.id, 'name', e.target.value)
                                }
                                placeholder={`${getOptionPlaceholder(group.title, vIndex)} *`}
                                className={`w-full h-9 px-3 pr-7 text-xs bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#059669] border transition-colors ${
                                  !val.name.trim() ? 'border-amber-300 focus:border-amber-500' : 'border-slate-200'
                                }`}
                              />
                              {!val.name.trim() && (
                                <span className="absolute right-2 text-[10px] font-bold text-amber-600 pointer-events-none bg-amber-50 px-1 rounded">
                                  *
                                </span>
                              )}
                            </div>

                            {/* Foto Vinculada (Solo Plan Negocio Pro) */}
                            {isNegocio && (
                              <div className="shrink-0">
                                {val.imageUrl ? (
                                  <button
                                    type="button"
                                    onClick={() => setActivePickerValueId(activePickerValueId === val.id ? null : val.id)}
                                    className="relative w-9 h-9 rounded-lg overflow-hidden border-2 border-amber-500 hover:opacity-90 shrink-0 cursor-pointer shadow-2xs group"
                                    title="Cambiar foto de esta opción"
                                  >
                                    <img src={val.imageUrl} alt={val.name} className="w-full h-full object-cover" />
                                    <span className="absolute bottom-0 right-0 bg-amber-600 text-[8px] text-white px-1 rounded-tl font-bold">
                                      📷
                                    </span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setActivePickerValueId(activePickerValueId === val.id ? null : val.id)}
                                    disabled={!availableImages || availableImages.length === 0}
                                    className="h-9 px-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title={!availableImages?.length ? 'Sube fotos arriba primero para asociarlas' : 'Asociar foto a esta opción'}
                                  >
                                    <Camera size={13} />
                                    <span>+ Foto</span>
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Optional Price Difference (Emprendedor & Negocio) */}
                            {allowPriceDifference ? (
                              <div className="w-24 sm:w-28 flex items-center relative">
                                <span className="absolute left-2.5 text-[11px] text-slate-400 font-semibold">
                                  +S/
                                </span>
                                <input
                                  type="number"
                                  step="0.50"
                                  min="0"
                                  value={val.priceDifference || ''}
                                  onChange={(e) =>
                                    handleValueChange(
                                      group.id,
                                      val.id,
                                      'priceDifference',
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  placeholder="0.00"
                                  className="w-full h-9 pl-8 pr-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#059669] text-right font-medium"
                                  title="Precio adicional sobre el precio base"
                                />
                              </div>
                            ) : (
                              <div className="w-24 px-2 py-1 bg-slate-100 rounded-lg text-[10px] text-slate-400 flex items-center gap-1 justify-center" title="Precios diferenciales disponibles en Plan Emprendedor">
                                <Lock size={10} />
                                <span>S/ {basePrice.toFixed(2)}</span>
                              </div>
                            )}

                            {/* Delete Value Button */}
                            {group.values.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveValue(group.id, val.id)}
                                className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>

                          {/* Selector Desplegable de Fotos de Producto para esta variante (Plan Negocio) */}
                          {isNegocio && activePickerValueId === val.id && (
                            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex flex-col gap-2 animate-in fade-in">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-amber-950 flex items-center gap-1.5">
                                  <ImageIcon size={13} className="text-amber-600" />
                                  <span>Selecciona la foto para "{val.name || `Opción ${vIndex + 1}`}":</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setActivePickerValueId(null)}
                                  className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                                >
                                  <X size={13} />
                                </button>
                              </div>

                              {availableImages.length === 0 ? (
                                <p className="text-[11px] text-amber-800">
                                  Aún no has subido fotos en la sección superior del producto. Sube fotos primero para vincularlas.
                                </p>
                              ) : (
                                <div className="flex items-center gap-2 flex-wrap pt-1">
                                  {availableImages.map((img, i) => (
                                    <button
                                      key={i}
                                      type="button"
                                      onClick={() => {
                                        handleValueChange(group.id, val.id, 'imageUrl', img);
                                        setActivePickerValueId(null);
                                      }}
                                      className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shadow-2xs ${
                                        val.imageUrl === img
                                          ? 'border-amber-600 ring-2 ring-amber-400 scale-105'
                                          : 'border-white hover:border-amber-400 opacity-80 hover:opacity-100'
                                      }`}
                                    >
                                      <img src={img} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                                      {val.imageUrl === img && (
                                        <div className="absolute inset-0 bg-amber-600/30 flex items-center justify-center text-white">
                                          <Check size={16} className="drop-shadow-md stroke-[3]" />
                                        </div>
                                      )}
                                    </button>
                                  ))}

                                  {val.imageUrl && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleValueChange(group.id, val.id, 'imageUrl', undefined);
                                        setActivePickerValueId(null);
                                      }}
                                      className="px-2.5 py-1.5 text-[11px] text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-colors cursor-pointer border border-rose-200 bg-white"
                                    >
                                      Desvincular foto
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add Value Button and Limit indicator */}
                    <div className="flex items-center justify-between pt-1">
                      {group.values.length < maxValuesPerGroup ? (
                        <button
                          type="button"
                          onClick={() => handleAddValue(group.id)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#006c49] hover:underline cursor-pointer"
                        >
                          <Plus size={14} />
                          <span>Agregar otra opción</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-amber-700">
                          Límite de {maxValuesPerGroup} opciones alcanzado
                        </span>
                      )}

                      <span className="text-[10px] text-slate-400">
                        {group.values.length} / {maxValuesPerGroup} opciones
                      </span>
                    </div>

                    {allowPriceDifference && (
                      <div className="text-[10px] text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/60 flex items-center gap-1.5 mt-1">
                        <span>💡</span>
                        <span><b>Tip:</b> Escribe únicamente el nombre en la izquierda (ej. <i>S</i>, <i>M</i>, <i>Rojo</i>). Si no cambia de precio, deja el campo <b>+S/</b> vacío o en 0.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
