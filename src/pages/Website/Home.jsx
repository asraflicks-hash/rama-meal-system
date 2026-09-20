import React, { useState } from 'react';
import { 
  Wheat, 
  Droplets, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  PhoneCall, 
  ShoppingBag, 
  MapPin, 
  Award, 
  Search,
  BookUser,
  CheckCircle2,
  Truck,
  Scale,
  Clock,
  MessageSquare,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Star,
  Zap,
  Phone,
  Lock,
  AlertCircle
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';

export default function Home({ 
  rates, 
  products, 
  onAddToCart, 
  onNavigateToStore, 
  onNavigateToPassbook, 
  onNavigateToManager,
  lang = 'en'
}) {
  const isHi = lang === 'hi';
  const [activeCategory, setActiveCategory] = useState('all');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [serialNo, setSerialNo] = useState('');
  const [passbookPin, setPassbookPin] = useState('');
  const [passbookResult, setPassbookResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  const faqs = [
    {
      q: isHi ? 'गेहूं जमा करने और आटा निकालने की क्या व्यवस्था है?' : 'How does wheat deposit and flour withdrawal work?',
      a: isHi 
        ? 'आप जितना चाहें (1 क्विंटल, 10 क्विंटल या अधिक) गेहूं हमारी मिल में सुरक्षित जमा कर सकते हैं। आपको एक डिजिटल खाता संख्या (SN400 ID) और पासबुक मिलेगी। जब भी आपको जरूरत हो, आप ताजा पिसा आटा निकाल सकते हैं। बाकी गेहूं सुरक्षित रहेगा।'
        : 'You can deposit any amount of wheat in our moisture-controlled mill warehouse. You receive an SN400 ID and passbook. Withdraw fresh flour whenever required while your remaining grain stays secure.'
    },
    {
      q: isHi ? 'पिसाई व पेराई का किराया क्या है?' : 'What are the milling and oil expeller charges?',
      a: isHi
        ? 'गेहूं पिसाई का किराया औसतन ₹1.00 से ₹1.25 प्रति किलो (या ₹20 से ₹25 प्रति 20 किलो) है। सरसों पेराई में औसतन 34% शुद्ध तेल निकलता है और पेराई नकद या खली के अनुपात में तय की जाती है।'
        : 'Flour grinding fee is approximately ₹1.00 - ₹1.25 per kg. For mustard, cold expelling yields ~34% pure oil, and processing fees can be paid in cash or standard recovery adjustment.'
    },
    {
      q: isHi ? 'क्या आपका सरसों तेल 100% शुद्ध और केमिकल रहित है?' : 'Is your mustard oil 100% pure and chemical-free?',
      a: isHi
        ? 'बिल्कुल! हमारी कच्ची घानी में केवल प्रथम-प्रेस (First Press) तकनीक का उपयोग होता है। इसमें कोई रंग, सुगंध, खनिज तेल या केमिकल नहीं मिलाया जाता। डबल-क्लॉथ प्राकृतिक छनाई से तेल का तीखापन व एंटीऑक्सीडेंट 100% बरकरार रहते हैं।'
        : 'Yes, 100%. We utilize traditional first-press cold expeller technology with zero chemicals, mineral oils, or artificial pungency. Double cloth filtration retains natural aroma and Omega-3 nutrients.'
    },
    {
      q: isHi ? 'क्या आसपास के गांवों और दुकानों में थोक डिलीवरी मिलती है?' : 'Is bulk doorstep delivery available in nearby villages?',
      a: isHi
        ? 'हाँ! 50 किग्रा आटा कट्टा, 15 लीटर सरसों तेल टिन या शादी-ब्याह व होटल-ढाबा के लिए 10 क्विंटल से अधिक के ऑर्डर पर हमारी गाड़ी सीधे आपके दरवाजे पर डिलीवरी करती है।'
        : 'Yes! For retail shops, catering events, marriage functions, and village bulk orders (50kg flour sacks or 15L tins), we provide direct vehicle delivery.'
    },
    {
      q: isHi ? 'किसान घर बैठे अपना बैलेंस कैसे देख सकते हैं?' : 'How can farmers track their grain balance from home?',
      a: isHi
        ? 'किसान हमारी वेबसाइट पर "किसान पासबुक" सेक्शन में जाकर अपना रजिस्टर्ड मोबाइल नंबर या SN400 खाता संख्या डालकर किसी भी समय अपना शेष गेहूं और तेल बैलेंस देख सकते हैं।'
        : 'Farmers can visit the "Farmer Passbook" tab, enter their registered mobile number or SN400 ID, and view their live grain and oil ledger balance anytime.'
    }
  ];

  const handleHomeLookup = async (e) => {
    e?.preventDefault();
    if (!serialNo.trim()) {
      setLookupError(isHi ? 'कृपया किसान सीरियल नंबर (उदा. SN404) दर्ज करें।' : 'Please enter Serial No. (e.g. SN404)');
      return;
    }
    if (!passbookPin.trim()) {
      setLookupError(isHi ? 'कृपया सुरक्षा पिन दर्ज करें।' : 'Please enter security PIN');
      return;
    }
    setLookupLoading(true);
    setLookupError('');
    setPassbookResult(null);
    try {
      const cleanId = serialNo.trim().toUpperCase();
      const res = await fetch(`/api/lookup/${encodeURIComponent(cleanId)}?pin=${encodeURIComponent(passbookPin.trim())}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || (isHi ? 'खाता नहीं मिला या अमान्य पिन' : 'Account not found or invalid PIN'));
      }
      const data = await res.json();
      setPassbookResult(data);
    } catch (err) {
      setLookupError(err.message);
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-24 md:pb-16 w-full max-w-full overflow-x-hidden">
      
      {/* 1. HERO SECTION: Grand & Modern with Authentic Village Chakki & Wheat Wallpaper */}
      <section className="relative overflow-hidden rounded-3xl text-white p-5 sm:p-10 lg:p-14 shadow-2xl border border-stone-800 min-h-[560px] sm:min-h-[640px] flex flex-col justify-between">
        
        {/* Background Wallpaper Image: Farmer, Stone Chakki, Wheat Field & Sunset */}
        <div 
          className="absolute inset-0 bg-cover bg-right sm:bg-center transition-all duration-700 pointer-events-none"
          style={{
            backgroundImage: "url('/hero_wallpaper.jpg')"
          }}
        />
        
        {/* Multi-layer Gradient Overlays for Crystal Clear Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/85 sm:via-stone-950/75 to-stone-950/20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-2xl sm:max-w-3xl space-y-4 sm:space-y-6 z-10">
          
          {/* Top Pill Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isHi ? 'रामा आटा व तेल मिल • 22 सिद्रा मोशन' : 'Rama Flour & Mustard Oil Mills • By 22 Sidra Motion'}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isHi ? '100% प्राकृतिक शुद्धता गारंटी' : '100% Natural Purity Guaranteed'}</span>
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            {isHi ? (
              <>
                पारंपरिक धीमी पत्थर चक्की का <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
                  शुद्ध चोकरयुक्त आटा
                </span> व कच्ची घानी सरसों तेल
              </>
            ) : (
              <>
                Authentic Stone Chakki <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
                  Fresh Whole Wheat Atta
                </span> & Pure Mustard Oil
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-stone-300 text-xs sm:text-base leading-relaxed max-w-2xl font-normal">
            {isHi 
              ? 'रामा आटा व तेल मिल में गेहूं को धीमी गति की प्राकृतिक पत्थर चक्की से पीसा जाता है, जिससे गेहूं का चोकर, पोषक तत्व और प्राकृतिक मिठास पूरी तरह सुरक्षित रहती है। साथ ही हमारी कच्ची घानी सरसों पेराई से 100% शुद्ध, प्राकृतिक तीखा तेल निकलता है।'
              : 'Slow stone grinding prevents frictional heat damage, safeguarding natural dietary fiber, wheat germ nutrients, and authentic taste. Paired with first-press cold expeller mustard oil with zero chemicals and unadulterated pungency.'}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onNavigateToStore}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition-all active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
              <span>{isHi ? 'ताजा आटा व तेल खरीदें (ऑनलाइन ऑर्डर)' : 'Order Fresh Atta & Oil Online'}</span>
            </button>

            <button
              onClick={onNavigateToPassbook}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl text-xs sm:text-sm border border-white/20 transition-all"
            >
              <BookUser className="w-4 h-4 text-amber-300" />
              <span>{isHi ? 'किसान पासबुक बैलेंस देखें' : 'Check Farmer Passbook'}</span>
            </button>
          </div>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-stone-800/80">
            <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
              <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">500+ Q</div>
              <div className="text-[11px] text-stone-400">{isHi ? 'मासिक गेहूं पिसाई' : 'Monthly Milling'}</div>
            </div>
            <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
              <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">100%</div>
              <div className="text-[11px] text-stone-400">{isHi ? 'प्राकृतिक पत्थर चक्की' : 'Natural Stone Chakki'}</div>
            </div>
            <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
              <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">50+</div>
              <div className="text-[11px] text-stone-400">{isHi ? 'गांवों का भरोसा' : 'Villages Served'}</div>
            </div>
            <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
              <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">0%</div>
              <div className="text-[11px] text-stone-400">{isHi ? 'शून्य मिलावट' : 'Zero Adulteration'}</div>
            </div>
          </div>

        </div>

        {/* Live Mandi Rate Strip Banner inside Hero */}
        <div className="mt-8 pt-5 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{isHi ? 'आज का लाइव मंडी व मिल भाव:' : 'Today Live Mill & Mandi Rates:'}</span>
          </div>
          <div className="flex flex-wrap gap-3 sm:gap-4 text-stone-300 font-mono text-[11px] sm:text-xs">
            <span>{isHi ? 'गेहूं' : 'Wheat'}: <b className="text-white">₹{rates?.wheatPerKg || 27.5}/kg</b></span>
            <span>{isHi ? 'शरबती आटा' : 'Flour'}: <b className="text-white">₹{rates?.attaPerKg || 32}/kg</b></span>
            <span>{isHi ? 'सरसों' : 'Mustard'}: <b className="text-white">₹{rates?.mustardPerKg || 58}/kg</b></span>
            <span>{isHi ? 'सरसों तेल' : 'Oil'}: <b className="text-white">₹{rates?.oilPerLitre || 145}/L</b></span>
            <span>{isHi ? 'चोकर' : 'Bran'}: <b className="text-white">₹{rates?.chokarPerKg || 22}/kg</b></span>
          </div>
        </div>
      </section>

      {/* 2. TWO DEDICATED MILL DIVISIONS */}
      <section className="space-y-4 sm:space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1.5 px-2">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
            {isHi ? 'रामा मिल के दो मुख्य प्रभाग' : 'Two Core Production Facilities'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
            {isHi ? 'आधुनिक सफाई व पारंपरिक पिसाई-पेराई संयंत्र' : 'Grain & Cold Expeller Milling Infrastructure'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            {isHi 
              ? 'आटा चक्की और सरसों तेल मिल दोनों के लिए अलग-अलग मशीनरी और समर्पित स्टोरेज गोदाम।' 
              : 'Independent production lines for Sharbati stone-ground atta and cold-pressed pure mustard oil.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          
          {/* Wheat Chakki Division */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Wheat className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  {isHi ? 'प्रभाग 1' : 'Division 1'}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-stone-900">
                {isHi ? '🌾 गेहूं चक्की व शुद्ध आटा प्रभाग' : '🌾 Wheat & Stone Flour Mill Division'}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {isHi
                  ? 'धीमी गति की प्राकृतिक पत्थर चक्की से पिसा हुआ आटा। आटा जलता नहीं है और गेहूं का प्राकृतिक तेल, चोकर और विटामिन्स पूरी तरह सुरक्षित रहते हैं। इससे बनी रोटियां घंटों तक नर्म और सुपाच्य रहती हैं।'
                  : 'Slow natural stone milling keeps the flour cool, retaining whole-wheat fiber, germ nutrients, and natural sweetness. Rotis stay extraordinarily soft for hours.'}
              </p>

              <div className="space-y-2 pt-2 text-xs text-stone-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isHi ? '3-चरणीय मशीन से धूल, मिट्टी व कंकड़ की 100% सफाई' : '3-stage mechanical grain separator & dust vacuuming'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isHi ? 'किसानों के लिए सुरक्षित गेहूं स्टोर और डिजिटल पासबुक' : 'Moisture-controlled grain warehouse with SN400 passbook'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isHi ? 'दूधिया पशुओं के लिए पौष्टिक मोटा चोकर उपलब्ध' : 'High-fiber wheat bran (चोकर) for cattle nourishment'}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100">
              <button
                onClick={onNavigateToStore}
                className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-98"
              >
                <span>{isHi ? 'आटा पैकिंग देखें (5kg, 10kg, 26kg, 50kg)' : 'View Flour Varieties (5kg, 10kg, 26kg, 50kg)'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mustard Oil Division */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-yellow-300 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-yellow-100 text-yellow-800 flex items-center justify-center">
                  <Droplets className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-900 border border-yellow-300">
                  {isHi ? 'प्रभाग 2' : 'Division 2'}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-stone-900">
                {isHi ? '🌻 कच्ची घानी सरसों तेल एक्सपेलर' : '🌻 Cold-Pressed Mustard Oil Division'}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {isHi
                  ? 'पारंपरिक फर्स्ट-प्रेस कोल्ड एक्सपेलर से निकली 100% शुद्ध कच्ची घानी। कोई केमिकल रिफाइनिंग नहीं, प्राकृतिक डबल-क्लॉथ छनाई से तेल का तीखापन, सुनहरा रंग और ओमेगा-3 फैटी एसिड्स सुरक्षित रहते हैं।'
                  : 'Traditional first-press cold expeller preserving original pungency, golden clarity, and Omega-3 fatty acids with zero chemical treatment or high-temperature degradation.'}
              </p>

              <div className="space-y-2 pt-2 text-xs text-stone-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isHi ? '100% प्राकृतिक डबल-क्लॉथ फिल्ट्रेशन (शून्य केमिकल)' : '100% natural double cloth filtration (zero chemicals)'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isHi ? 'पशु आहार के लिए उच्च प्रोटीन सरसों खली (पीना)' : 'High-protein livestock cattle feed cake (खली)'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isHi ? 'सरसों जमा पर पारदर्शी तेल व खली रिकवरी हिसाब' : 'Transparent 34% oil recovery calculation & register'}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100">
              <button
                onClick={onNavigateToStore}
                className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-stone-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-98"
              >
                <span>{isHi ? 'तेल पैकिंग देखें (1L, 2L, 5L, 15L टिन)' : 'View Oil Packs (1L, 2L, 5L, 15L Tin)'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 3. HOW IT WORKS: 4-Step Process */}
      <section className="bg-stone-100 rounded-3xl p-6 sm:p-10 border border-stone-200 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
            {isHi ? 'हमारी कार्यप्रणाली' : 'Our Milling Process'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
            {isHi ? 'खेत से आपकी रसोई तक शुद्धता का सफर' : 'From Farm Harvest to Your Kitchen'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          
          <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 font-black text-base flex items-center justify-center font-mono">
              01
            </div>
            <h4 className="font-extrabold text-stone-900 text-base">
              {isHi ? 'किसानों से सीधी खरीद' : 'Direct Farmer Sourcing'}
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              {isHi 
                ? 'स्थानीय किसानों से प्रीमियम एमपी शरबती गेहूं और देसी काली-पीली सरसों की सीधी आवक।' 
                : 'Direct intake of MP Sharbati wheat and regional high-oil mustard seeds directly from farmers.'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 font-black text-base flex items-center justify-center font-mono">
              02
            </div>
            <h4 className="font-extrabold text-stone-900 text-base">
              {isHi ? 'मशीनी ग्रेडिंग व सफाई' : '3-Stage Pre-Cleaning'}
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              {isHi 
                ? 'डी-स्टोनर, एयर सक्शन और ग्रेडर द्वारा धूल, भूसी और कंकड़ पूरी तरह अलग किए जाते हैं।' 
                : 'High-power destoners and air aspirators remove dust, chaff, and stone particles thoroughly.'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 font-black text-base flex items-center justify-center font-mono">
              03
            </div>
            <h4 className="font-extrabold text-stone-900 text-base">
              {isHi ? 'धीमी पत्थर चक्की व घानी' : 'Slow Cold Extraction'}
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              {isHi 
                ? 'कम आरपीएम पर बिना जले ठंडा आटा तैयार होता है और सरसों का तेल बिना तापमान बिगड़े निकलता है।' 
                : 'Low RPM stone chakki prevents scorching while cold expeller preserves live enzymes and aroma.'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 font-black text-base flex items-center justify-center font-mono">
              04
            </div>
            <h4 className="font-extrabold text-stone-900 text-base">
              {isHi ? 'स्वच्छ फूड-ग्रेड पैकिंग' : 'Hygienic Packing'}
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              {isHi 
                ? 'सीलबंद फूड-ग्रेड कट्टों और जार में सुरक्षित पैकिंग ताकि नमी और कीड़ों से 100% सुरक्षा रहे।' 
                : 'Airtight food-grade packaging ensures zero moisture entry and extended shelf freshness.'}
            </p>
          </div>

        </div>
      </section>

      {/* 4. PRODUCT SHOWCASE WITH TABS */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              {isHi ? 'ताजा मिल उत्पाद' : 'Fresh Mill Products'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
              {isHi ? 'शुद्ध शरबती आटा, तेल व अन्य उत्पाद' : 'Popular Atta & Pure Mustard Oil Packs'}
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-2xl border border-stone-200 text-xs font-bold self-start sm:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeCategory === 'all'
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {isHi ? 'सभी उत्पाद' : 'All Products'}
            </button>
            <button
              onClick={() => setActiveCategory('wheat_atta')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeCategory === 'wheat_atta'
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              🌾 {isHi ? 'आटा' : 'Atta'}
            </button>
            <button
              onClick={() => setActiveCategory('mustard_oil')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeCategory === 'mustard_oil'
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              🌻 {isHi ? 'सरसों तेल' : 'Oil'}
            </button>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map(product => (
            <div 
              key={product.id}
              className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-stone-100">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-stone-900/90 backdrop-blur-sm text-amber-300 text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-md">
                    {product.category}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <span className="text-[11px] font-bold text-amber-700">
                    {product.categoryHi}
                  </span>
                  <h3 className="font-extrabold text-stone-900 text-base leading-snug">
                    {product.name}
                  </h3>
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="border-t border-stone-100 pt-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-400 block">{isHi ? 'शुरुआती कीमत' : 'Starting From'}</span>
                    <span className="text-lg font-black font-mono text-stone-900">
                      ₹{product.options?.[0]?.price}
                    </span>
                  </div>
                  <button
                    onClick={() => onAddToCart(product, product.options?.[0])}
                    className="px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{isHi ? 'कार्ट में जोड़ें' : 'Add to Cart'}</span>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

        <div className="text-center pt-2">
          <button
            onClick={onNavigateToStore}
            className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl text-xs font-black shadow-md transition-all active:scale-95"
          >
            <span>{isHi ? 'संपूर्ण कैटलॉग व पैकिंग विकल्प देखें →' : 'View Full Store Catalog & Pack Sizes →'}</span>
          </button>
        </div>
      </section>

      {/* 5. FARMER PASSBOOK CONVENIENCE PORTAL */}
      <section className="bg-stone-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-stone-800 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold">
              🌾 {isHi ? 'किसान सेवा व सुविधा पोर्टल' : 'Farmer Convenience Center'}
            </div>
            <h3 className="text-2xl sm:text-3xl font-black leading-tight">
              {isHi ? 'क्या आपका गेहूं या सरसों हमारी मिल में जमा है?' : 'Grain or Mustard Deposited in Our Mill?'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {isHi 
                ? 'अब चक्की पर बार-बार आने या मुनीम जी से पूछने की जरूरत नहीं। अपने मोबाइल से किसी भी समय अपना शेष गेहूं और तेल बैलेंस तुरंत चेक करें।'
                : 'No need to make frequent trips to check ledgers. Verify your available wheat, flour, and mustard oil balance right from your smartphone anytime.'}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-stone-400">
              <span className="flex items-center gap-1">✓ {isHi ? 'SN400 खाता संख्या' : 'SN400 Account Series'}</span>
              <span className="flex items-center gap-1">✓ {isHi ? 'तारीखवार आवक-जावक' : 'Datewise In/Out Log'}</span>
              <span className="flex items-center gap-1">✓ {isHi ? 'पिसाई रसीद पर्ची' : 'Digital Slip Copy'}</span>
            </div>
          </div>

          <form onSubmit={handleHomeLookup} className="bg-stone-800/90 p-5 sm:p-6 rounded-2xl border border-stone-700 space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>{isHi ? 'पिन व सीरियल नं. से सुरक्षित पासबुक देखें' : 'PIN Protected Passbook Lookup'}</span>
              </label>
              <span className="text-[10px] font-mono text-amber-300 font-bold bg-stone-900 px-2 py-0.5 rounded border border-stone-700">
                CAPITAL ONLY
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* 1. Serial Number (CAPITAL ONLY e.g. SN404, SN400) */}
              <div>
                <span className="text-[11px] font-bold text-stone-300 block mb-1">
                  {isHi ? 'सीरियल नंबर (उदा. SN404) *' : 'Serial No. (e.g. SN404) *'}
                </span>
                <input
                  type="text"
                  required
                  placeholder="उदा. SN404, SN400"
                  value={serialNo}
                  onChange={(e) => setSerialNo(e.target.value.toUpperCase())}
                  className="w-full p-2.5 bg-stone-900 border border-stone-600 rounded-xl text-sm font-mono font-black uppercase text-amber-300 tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* 2. Security PIN */}
              <div>
                <span className="text-[11px] font-bold text-stone-300 block mb-1">
                  {isHi ? 'सुरक्षा पिन (PIN) *' : 'Security PIN *'}
                </span>
                <input
                  type="password"
                  required
                  placeholder="Enter PIN (उदा. 982026)"
                  value={passbookPin}
                  onChange={(e) => setPassbookPin(e.target.value)}
                  className="w-full p-2.5 bg-stone-900 border border-stone-600 rounded-xl text-sm font-mono font-bold text-white tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={lookupLoading}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 disabled:opacity-50"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
              <span>{lookupLoading ? (isHi ? 'सत्यापित कर रहे हैं...' : 'Verifying...') : (isHi ? 'पासबुक बैलेंस देखें' : 'View Passbook Balance')}</span>
            </button>

            {lookupError && (
              <div className="p-2.5 bg-red-950/80 border border-red-500/50 text-red-200 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{lookupError}</span>
              </div>
            )}

            {/* Instant Verified Balance Result Card */}
            {passbookResult && (
              <div className="bg-stone-900 border border-amber-500/50 rounded-xl p-3.5 space-y-2.5 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <div>
                    <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">
                      {passbookResult.id}
                    </span>
                    <h4 className="font-extrabold text-white text-sm mt-1">
                      {isHi ? (passbookResult.nameHi || passbookResult.name) : passbookResult.name}
                    </h4>
                    <span className="text-[11px] text-stone-400">
                      {passbookResult.village} {passbookResult.location ? `(${passbookResult.location})` : ''}
                    </span>
                  </div>
                  <span className="text-emerald-400 font-bold text-xs bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    ✓ Verified
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-stone-800/80 p-2 rounded-lg border border-amber-500/30">
                    <span className="text-[10px] text-amber-300 block">🌾 {isHi ? 'शेष गेहूं (आटा):' : 'Wheat Balance:'}</span>
                    <span className="text-base font-black font-mono text-amber-300">
                      {passbookResult.balances?.wheatCurrentBalanceKg || 0} kg
                    </span>
                  </div>
                  <div className="bg-stone-800/80 p-2 rounded-lg border border-yellow-500/30">
                    <span className="text-[10px] text-yellow-300 block">🌻 {isHi ? 'शेष तेल:' : 'Oil Balance:'}</span>
                    <span className="text-base font-black font-mono text-yellow-400">
                      {(passbookResult.balances?.oilAvailableLitre || 0).toFixed(1)} L
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onNavigateToPassbook}
                  className="w-full py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all text-center block"
                >
                  {isHi ? 'विस्तृत पासबुक व रसीदें देखें →' : 'View Full Ledger History →'}
                </button>
              </div>
            )}

            <p className="text-[11px] text-stone-400">
              {isHi 
                ? '🔒 सुरक्षा नियम: किसान सीरियल नंबर (SN404 आदि) केवल CAPITAL में दर्ज करें और अपना सही सुरक्षा पिन डालें।' 
                : '🔒 Security Rule: Serial Number must be in CAPITAL (e.g. SN404) with your security PIN.'}
            </p>
          </form>
        </div>
      </section>

      {/* 6. PURITY GUARANTEE & TRUST PILLARS */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
            {isHi ? 'हमारा संकल्प' : 'Why Rama Flour & Oil Mills'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
            {isHi ? '6 मुख्य कारण क्यों हम पर भरोसा करते हैं' : 'Our 6 Pillars of Purity & Honesty'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
              🌾
            </div>
            <h4 className="font-extrabold text-stone-900 text-base">
              {isHi ? '100% चोकरयुक्त साबुत गेहूं' : '100% Whole Wheat with Bran'}
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              {isHi 
                ? 'मैदा या सफेद आटे की शून्य मिलावट। प्राकृतिक फाइबर पाचन तंत्र को मजबूत रखता है।' 
                : 'Zero maida blending. Intact dietary bran promotes healthy digestion and natural stamina.'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-800 flex items-center justify-center font-bold">
              🌻
            </div>
            <h4 className="font-extrabold text-stone-900 text-base">
              {isHi ? 'कोल्ड प्रेस्ड शुद्ध सरसों' : 'Unheated Cold Expeller'}
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              {isHi 
                ? 'तेल को गर्म किए बिना निकाला जाता है, जिससे उसकी तीखी सुगंध और पोषण बरकरार रहता है।' 
                : 'Extracted without heat damage to retain natural antioxidants, pungent aroma, and fatty acids.'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
              <Scale className="w-5 h-5 text-emerald-700" />
            </div>
            <h4 className="font-extrabold text-stone-900 text-base">
              {isHi ? 'इलेक्ट्रॉनिक कांटे पर खरा वजन' : 'Certified Digital Weighing'}
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              {isHi 
                ? 'कांटे पर 100% ईमानदारी। एक-एक ग्राम की पर्ची और कंप्यूटर रिकॉर्ड ग्राहक के सामने।' 
                : 'Every single gram is weighed on precision digital scales with printed slips.'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5 text-blue-700" />
            </div>
            <h4 className="font-extrabold text-stone-900 text-base">
              {isHi ? 'थोक व गांव तक डिलीवरी' : 'Village & Bulk Doorstep Delivery'}
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              {isHi 
                ? 'शादी, उत्सव, होटल या दुकानों के लिए थोक ऑर्डर पर सीधे आपके पते पर डिलीवरी वाहन।' 
                : 'Dedicated dispatch vehicles for wedding functions, catering, and rural village retail shops.'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-purple-700" />
            </div>
            <h4 className="font-extrabold text-stone-900 text-base">
              {isHi ? 'शून्य केमिकल व प्रिजर्वेटिव' : 'Zero Chemicals & Preservatives'}
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              {isHi 
                ? 'कोई कृत्रिम रंग, ब्लीचिंग या केमिकल प्रिजर्वेटिव नहीं। केवल प्राकृतिक अनाज की ताकत।' 
                : 'Zero bleaching, artificial coloring, or preservatives. 100% wholesome earth harvest.'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-800 flex items-center justify-center font-bold">
              <Award className="w-5 h-5 text-rose-700" />
            </div>
            <h4 className="font-extrabold text-stone-900 text-base">
              {isHi ? '25+ वर्षों की विश्वसनीयता' : '25+ Years Legacy of Trust'}
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              {isHi 
                ? 'क्षेत्र के हजारों किसान परिवारों का अटूट भरोसा और निरंतर सर्वोत्तम सेवा का संकल्प।' 
                : 'Decades of serving farming communities with transparent accounts and premium milling.'}
            </p>
          </div>

        </div>
      </section>

      {/* 7. CUSTOMER & FARMER REVIEWS */}
      <section className="bg-amber-50/60 rounded-3xl p-6 sm:p-10 border border-amber-200 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
            {isHi ? 'ग्राहकों व किसान भाइयों की राय' : 'What Farmers & Families Say'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
            {isHi ? 'सच्ची शुद्धता पर लोगों का भरोसा' : 'Real Feedback from Villages'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <p className="text-xs text-stone-700 leading-relaxed italic">
              {isHi 
                ? '“हमने 15 क्विंटल गेहूं रामा मिल में जमा किया है। जब मन होता है 25-25 किलो ताजा आटा ले आते हैं। रोटियां बहुत मुलायम बनती हैं और हिसाब-किताब में 1 रुपये का भी फेरबदल नहीं होता।”'
                : '"We deposited 15 quintals of wheat here. Whenever needed, we withdraw 25kg fresh flour. Rotis are delightfully soft and the computerized passbook is completely transparent."'}
            </p>
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="font-bold text-stone-900">{isHi ? 'राम कुमार वर्मा' : 'Ram Kumar Verma'}</span>
              <span className="text-stone-400 font-mono text-[11px]">{isHi ? 'ग्राम रामपुर कलां' : 'Rampur Kalan'}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <p className="text-xs text-stone-700 leading-relaxed italic">
              {isHi 
                ? '“इनका कच्ची घानी सरसों तेल बाजार के ब्रांडेड तेलों से कहीं बेहतर है। कड़ाही में डालते ही जो असली तीखी खुशबू आती है, वही शुद्धता की पहचान है। खली भी बहुत साफ और ताजी मिलती है।”'
                : '"Their kacchi ghani mustard oil has real natural pungency that market branded oils lack completely. The aroma in traditional cooking is unbeatable, and the cattle feed cake is pure."'}
            </p>
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="font-bold text-stone-900">{isHi ? 'दिनेश चंद्र अवस्थी' : 'Dinesh Chandra Awasthi'}</span>
              <span className="text-stone-400 font-mono text-[11px]">{isHi ? 'ग्राम टिकैतगंज' : 'Tikaitganj'}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <p className="text-xs text-stone-700 leading-relaxed italic">
              {isHi 
                ? '“हमारा ढाबा मेन रोड पर है, हम महीने का 20 कट्टा आटा और 2 टिन सरसों तेल सीधे रामा मिल से लेते हैं। समय पर गाड़ी से डिलीवरी और रेट हमेशा मंडी के हिसाब से वाजिब।”'
                : '"We run a busy restaurant highway dhaba and procure 20 sacks of flour and 2 oil tins monthly. On-time vehicle delivery and fair mandi prices every single time."'}
            </p>
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="font-bold text-stone-900">{isHi ? 'सुरेश यादव (होटल संचालक)' : 'Suresh Yadav (Restaurant)'}</span>
              <span className="text-stone-400 font-mono text-[11px]">{isHi ? 'हाईवे चौराहा' : 'Highway Junction'}</span>
            </div>
          </div>

        </div>
      </section>

      {/* 8. FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <section className="space-y-4 max-w-3xl mx-auto">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
            {isHi ? 'सवाल-जवाब' : 'Help & FAQs'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
            {isHi ? 'अक्सर पूछे जाने वाले सवाल' : 'Frequently Asked Questions'}
          </h2>
        </div>

        <div className="space-y-2.5 pt-2">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-3 text-sm font-bold text-stone-900 hover:bg-stone-50 transition-colors"
              >
                <span>{faq.q}</span>
                {openFaqIndex === idx ? (
                  <ChevronUp className="w-4 h-4 text-amber-700 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
                )}
              </button>
              {openFaqIndex === idx && (
                <div className="px-4 pb-4 pt-1 text-xs text-stone-600 leading-relaxed border-t border-stone-100 bg-stone-50/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 9. BULK & COMMERCIAL SUPPLY CTA */}
      <section className="bg-gradient-to-r from-amber-700 to-amber-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-wider bg-black/20 px-3 py-1 rounded-full text-amber-200">
            {isHi ? 'व्यापारिक व थोक आपूर्ति' : 'Commercial & B2B Wholesale Supply'}
          </span>
          <h3 className="text-xl sm:text-2xl font-black">
            {isHi ? 'हलवाई, होटल, कैटरिंग व शादी-ब्याह के लिए थोक आटा-तेल' : 'Wholesale Supply for Caterers, Restaurants & Retail Stores'}
          </h3>
          <p className="text-xs text-amber-100 leading-relaxed">
            {isHi 
              ? '50 किलो कट्टा शरबती आटा और 15 लीटर कच्ची घानी सरसों तेल टिन पर विशेष थोक दरें और सीधी वाहन डिलीवरी।' 
              : 'Direct wholesale mandi pricing on 50kg flour sacks and 15L oil tins with guaranteed fast delivery.'}
          </p>
        </div>

        <a
          href="https://wa.me/919876543210?text=Hello%20Rama%20Flour%20Mills,%20I%20want%20to%20inquire%20about%20bulk%20supply"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 bg-white hover:bg-amber-100 text-stone-950 font-black px-6 py-3.5 rounded-2xl text-xs sm:text-sm shadow-xl transition-all active:scale-95 flex items-center gap-2"
        >
          <Phone className="w-4 h-4 text-amber-800" />
          <span>{isHi ? 'व्हाट्सएप पर थोक भाव पूछें' : 'Inquire Wholesale on WhatsApp'}</span>
        </a>
      </section>

      {/* 10. COMPREHENSIVE FOOTER */}
      <footer className="bg-stone-950 text-stone-400 rounded-3xl p-6 sm:p-10 border border-stone-800 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-stone-800">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-white">
              <div className="w-8 h-8 rounded-xl bg-amber-600 flex items-center justify-center text-white font-bold">
                <Wheat className="w-5 h-5" />
              </div>
              <h4 className="font-black text-base">{isHi ? 'रामा आटा व तेल मिल' : 'Rama Flour & Mustard Oil Mills'}</h4>
            </div>
            <p className="text-stone-400 leading-relaxed">
              {isHi
                ? 'ऑपरेटेड बाय 22 सिद्रा मोशन (By 22 Sidra Motion)। धीमी गति की पारंपरिक पत्थर चक्की का शुद्ध आटा, कच्ची घानी सरसों तेल, पशु आहार चोकर और उच्च प्रोटीन खली।'
                : 'Operated by 22 Sidra Motion. Commercial Stone Chakki Atta, Pure Cold-Pressed Mustard Oil, Wheat Bran (Chokar), and Cattle Feed Cake (Khali).'}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-amber-400 font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>{isHi ? 'खुले रहने का समय: प्रातः 7:00 से रात्रि 8:30 (सातों दिन)' : 'Mill Hours: 7:00 AM - 8:30 PM (All 7 Days)'}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-white mb-2">{isHi ? 'मिल का पता व संपर्क विवरण:' : 'Mill Location & Contacts:'}</h5>
            <p className="space-y-1.5 text-stone-300">
              <span className="flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{isHi ? 'मेन मंडी रोड, रेलवे क्रॉसिंग के पास, लखनऊ (उ.प्र.)' : 'Main Mandi Road, Near Railway Crossing, Lucknow (U.P.)'}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{isHi ? 'मुनीम जी / हेल्पडेस्क: +91 98765 43210' : 'Manager Helpdesk: +91 98765 43210'}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>WhatsApp: +91 98765 43210</span>
              </span>
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-white mb-2">{isHi ? 'त्वरित नेविगेशन:' : 'Quick Navigation:'}</h5>
            <div className="space-y-2">
              <button onClick={onNavigateToStore} className="block hover:text-white transition-colors text-left">
                • {isHi ? 'ऑनलाइन स्टोर व ताजा आटा-तेल' : 'Online Store & Products'}
              </button>
              <button onClick={onNavigateToPassbook} className="block hover:text-white transition-colors text-left">
                • {isHi ? 'किसान ऑनलाइन पासबुक ट्रैकर' : 'Farmer Passbook Tracker'}
              </button>
              <button onClick={onNavigateToManager} className="block text-amber-400 font-bold hover:underline text-left">
                • {isHi ? 'मिल मैनेजर सॉफ्टवेयर लॉगिन (PRO)' : 'Mill Manager Software Login (PRO)'}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-stone-500">
          <p>© 2026 Rama Flour & Mustard Oil Mills • By 22 Sidra Motion. All rights reserved.</p>
          <p>{isHi ? 'एकीकृत चक्की प्रबंधन व ई-कॉमर्स सॉफ्टवेयर' : 'Unified Mill Operations & E-Commerce System'}</p>
        </div>
      </footer>

    </div>
  );
}
