import React, { useState } from 'react';
import { ShoppingBag, Check, Sparkles, Filter, Info, ArrowLeft, X } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

export default function Store({ products, onAddToCart, onBack, onHome, lang = 'en' }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  // Selected option per product (e.g. { 'PROD-1': 0 })
  const [selectedOptions, setSelectedOptions] = useState({});

  const categories = [
    { id: 'All', label: 'सभी उत्पाद' },
    { id: 'Atta', label: '🌾 शुद्ध आटा व दलिया' },
    { id: 'Oil', label: '🌻 कच्ची घानी सरसों तेल' },
    { id: 'Chokar', label: '📦 गेहूं चोकर' },
    { id: 'Khali', label: '🐄 पशु आहार खली' },
  ];

  const filteredProducts = products.filter(p => {
    if (selectedCategory === 'All') return true;
    return p.category === selectedCategory;
  });

  const handleSelectOption = (productId, optionIdx) => {
    setSelectedOptions({
      ...selectedOptions,
      [productId]: optionIdx
    });
  };

  return (
    <div className="space-y-6 pb-24 md:pb-16">
      {/* Top Back & Home Navigation Bar */}
      {(onBack || onHome) && (
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-stone-300 hover:bg-stone-100 rounded-xl text-xs sm:text-sm font-bold text-stone-700 transition-colors shadow-sm active:scale-95"
              title="वापस जाएं / Back"
            >
              <ArrowLeft className="w-4 h-4 text-stone-700" />
              <span>{lang === 'hi' ? '← वापस (Back)' : '← Back'}</span>
            </button>
          )}
          {onHome && (
            <button
              onClick={onHome}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs sm:text-sm font-black transition-colors shadow-sm active:scale-95 border border-amber-400"
              title="मुख्य होम स्क्रीन पर जाएं / Home"
            >
              <X className="w-4 h-4 font-black stroke-[3]" />
              <span>{lang === 'hi' ? '✕ होम (Home)' : '✕ Home'}</span>
            </button>
          )}
        </div>
      )}

      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-900 to-stone-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-amber-800">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
            सीधे मिल से आपके घर तक • By Sidra Motion
          </span>
          <h1 className="text-2xl sm:text-4xl font-black">
            रामा मिल ताजा उत्पाद स्टोर
          </h1>
          <p className="text-xs sm:text-sm text-stone-300">
            शुद्ध एमपी शरबती चक्की आटा, 100% कच्ची घानी सरसों का तेल, पौष्टिक मल्टीग्रेन आटा, चोकर और खली। थोक व फुटकर दोनों उपलब्ध।
          </p>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Product Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => {
          const currentOptionIdx = selectedOptions[product.id] || 0;
          const currentOption = product.options?.[currentOptionIdx] || product.options?.[0];

          return (
            <div 
              key={product.id}
              className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Product Image */}
                <div className="relative h-52 bg-stone-100 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-amber-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-md">
                    {product.badge || product.categoryHi}
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 space-y-2.5">
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">
                    {product.categoryHi}
                  </span>
                  <h3 className="font-extrabold text-stone-900 text-base leading-snug">
                    {product.name}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Size Options Selector */}
                  <div className="pt-2">
                    <label className="text-[11px] font-bold text-stone-700 block mb-1.5">
                      पैकिंग साइज़ चुनें:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {product.options?.map((opt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectOption(product.id, idx)}
                          className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                            currentOptionIdx === idx
                              ? 'bg-amber-100 text-amber-900 border-amber-400 ring-2 ring-amber-400/40'
                              : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {opt.size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Price and Cart Footer */}
              <div className="p-5 pt-0">
                <div className="border-t border-stone-100 pt-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-400 block">कीमत ({currentOption.size}):</span>
                    <span className="text-2xl font-black font-mono text-stone-900">
                      ₹{currentOption.price}
                    </span>
                  </div>

                  <button
                    onClick={() => onAddToCart(product, currentOption)}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-black rounded-xl flex items-center gap-2 shadow-md active:scale-95 transition-all"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>कार्ट में जोड़ें</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
