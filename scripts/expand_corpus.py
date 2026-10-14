"""
LexiMind — Derlem Genişletme ve Model Yeniden Eğitme Betiği
Bu betik, data/corpus.txt dosyasını zengin Türkçe cümlelerle genişletir,
sözlük dağarcığını 2.000+ kelimeye çıkarır ve Word2Vec modelini eğitir.
"""

import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)
DATA_DIR = os.path.join(BASE_DIR, "data")

from nlp.train import train_word2vec_model, evaluate_model_on_benchmark

ADDITIONAL_CORPUS_SENTENCES = [
    # Yapay Zeka, Derin Öğrenme ve NLP
    "doğal dil işleme metin madenciliği ve anlamsal çıkarım için makine öğrenmesi modellerini kullanır.",
    "büyük dil modelleri transformer mimarisi ve dikkat mekanizması ile eğitilen devasa yapay zeka sistemleridir.",
    "vektör uzayı temsili kelimeleri çok boyutlu sürekli uzayda geometrik noktalar olarak konumlandırır.",
    "word2vec algoritması kelimelerin bağlamsal dağılımını kullanarak dağıtık gösterimler üretir.",
    "kosinüs benzerliği iki kelime vektörü arasındaki açının kosinüsünü alarak anlamsal yakınlığı sıfır ile bir arasında ölçer.",
    "öklid mesafesi iki vektör arasındaki geometrik uzaklığı hesaplayarak benzerlik analizi sunar.",
    "skip-gram mimarisi özellikle az geçen nadir kelimelerin temsilinde cbow modeline göre daha başarılıdır.",
    "sürekli kelime çantası modeli yani cbow çevre kelimelerden hedef kelimeyi tahmin ederek daha hızlı eğitilir.",
    "negatif örnekleme kelime vektörlerinin güncellenmesinde hesaplama karmaşıklığını önemli ölçüde azaltır.",
    "kelime gömme yani word embedding metinleri sinir ağlarının anlayabileceği sayısal matrislere dönüştürür.",
    "morfolojik analiz türkçe gibi sondan eklemeli dillerde kök ve eklerin ayrıştırılmasında kritik rol oynar.",
    "kelime dağarcığı modelin eğitim derleminde karşılaştığı ve vektör atadığı benzersiz sözcüklerin bütünüdür.",
    "anlamsal ilişki benzer bağlamlarda geçen sözcüklerin vektör uzayında kümelenmesini sağlar.",
    "vektör aritmetiği kral eksi erkek artı kadın eşittir kraliçe örneğinde olduğu gibi analojileri çözer.",
    "temel bileşenler analizi yani pca yüksek boyutlu kelime vektörlerini iki boyuta indirgeyerek görselleştirir.",
    
    # Bilgisayar Bilimleri, Yazılım ve Donanım
    "bilgisayar mühendisi yazılım mimarisi veri tabanı yönetimi ve algoritma optimizasyonu üzerine çalışır.",
    "yazılım geliştirici python c++ java ve javascript dilleri ile modern uygulamalar kodlar.",
    "algoritma karmaşıklığı zaman ve bellek kullanımı açısından big o gösterimi ile analiz edilir.",
    "veri yapıları dizi bağlı liste yığıt kuyruk ağaç ve çizge gibi bellek organizasyonlarını kapsar.",
    "ilişkisel veritabanı sql sorguları tablolar birincil anahtarlar ve indeksleme ile veri tutarlılığı sağlar.",
    "ilişkisel olmayan veritabanı nosql doküman ve anahtar değer modelleriyle büyük veriyi depolar.",
    "işletim sistemi çekirdeği bellek yönetimi işlemci zamanlama ve dosya sistemlerini denetler.",
    "mikroişlemci aritmetik mantık birimi kontrol birimi ve önbellek ile komutları sırayla çalıştırır.",
    "grafik işlem birimi yani gpu matris çarpımları ve derin öğrenme tensör hesaplamalarında yüksek hız sunar.",
    "bulut bilişim sanallaştırma mikroservisler ve docker konteynerleri ile esnek dağıtım imkanı tanır.",
    "siber güvenlik uzmanları şifreleme güvenlik duvarı ve sızma testleri ile sistemleri korur.",
    "açık kaynak yazılımlar github üzerinden dünya çapında geliştiricilerin işbirliğiyle büyür.",
    "web geliştirme ön uç arayüz tasarımı ve arka uç api mimarisi olmak üzere iki ana kola ayrılır.",
    "fastapi python tabanlı yüksek performanslı asenkron ve otomatik dökümantasyon sunan modern bir web çatısıdır.",
    "flask hafif mikro mimarisi ile python projelerinde hızlı prototip ve api geliştirmeye uygundur.",
    "gensim python ekosisteminde word2vec doc2vec ve konu modelleme için optimize edilmiş güçlü bir kütüphanedir.",
    
    # Üniversite, Akademi, Bilimsel Araştırma
    "üniversite öğrencileri amfilerde ders dinler laboratuvarda deney yapar ve kütüphanede çalışır.",
    "öğretim üyesi profesör doçent ve doktor öğretim üyesi unvanlarıyla akademik araştırmalar yürütür.",
    "araştırma görevlisi akademik çalışmalarda profesörlere destek verir ve lisansüstü tez hazırlar.",
    "akademik tez özgün hipotezler literatür taraması ve deneysel bulgular ışığında savunulur.",
    "hakemli dergi makaleleri alanında uzman bilim insanlarının titiz incelemesinden geçerek yayınlanır.",
    "rektörlük ve dekanlık üniversitenin idari ve akademik karar mekanizmalarını yönetir.",
    "bilimsel konferans ve sempozyum araştırmacıların yeni bulgularını paylaştığı akademik platformlardır.",
    "burs ve araştırma fonları başarılı öğrencilerin ve projelerin maddi olarak desteklenmesini sağlar.",
    "akademik etik intihalden kaçınmayı dürüst alıntı yapmayı ve bilimsel tarafsızlığı emreder.",
    "laboratuvar ortamında mikroskop spektrometre ve ölçüm cihazları ile hassas deneyler yapılır.",
    "öğrenci toplulukları robotik yapay zeka edebiyat ve tiyatro kulüplerinde sosyal projeler üretir.",
    "yüksek lisans ve doktora programları derinlemesine uzmanlaşma ve bilimsel metodoloji kazandırır.",
    "akademik danışman öğrencilerin ders seçimleri ve kariyer planlamaları konusunda rehberlik eder.",
    
    # Sağlık, Tıp ve Biyoloji
    "tıp fakültesi mezunu hekim hastanede hastaları muayene eder teşhis koyar ve tedavi uygular.",
    "doktor ve hemşire acil servis poliklinik ve yoğun bakımda hastaların sağlığı için çalışır.",
    "hastane ameliyathane laboratuvar ve radyoloji servisleri ile kapsamlı sağlık hizmeti verir.",
    "cerrah cerrahi operasyon ile organ ve dokulardaki patolojik durumları tedavi eder.",
    "eczacı doktor reçetesinde yazılı ilaçları hazırlar ve hastaya doğru kullanımını açıklar.",
    "ilaç ve antibiyotik bakteriyel enfeksiyonları durdururken aşılama bağışıklık sistemini güçlendirir.",
    "genetik biliminde dna rna ve protein sentezi hücrenin kalıtım ve yaşam şifresini belirler.",
    "insan anatomisi iskelet kas dolaşım sinir ve solunum sistemlerinin uyum içinde çalışmasını açıklar.",
    "kalp ve damar sağlığı düzenli egzersiz düşük kolesterol ve dengeli beslenme ile korunur.",
    "beyin ve sinir sistemi milyarlarca nöron ve sinaps bağlantısı ile düşünceyi ve hafızayı yönetir.",
    "psikolog ve psikiyatri uzmanı ruh sağlığı depresyon kaygı ve travma tedavisinde terapi uygular.",
    "beslenme ve diyetetik uzmanı sağlıklı yaşam için vitamin mineral protein ve su dengesini önerir.",
    "aşı bağışıklık sistemine mikropları tanıtarak antikor üretimini tetikler ve salgınları önler.",
    
    # Türk Dili, Edebiyatı ve Kültürü
    "türk dili ural altay dil ailesine mensup zengin söz varlığına sahip köklü bir dünya dilidir.",
    "orhun abideleri tonyukuk kültigin ve bilge kağan yazıtlarıyla türkçenin ilk edebi anıtlarıdır.",
    "divanü lügati't-türk kaşgarlı mahmud tarafından türkçenin arapça kadar üstün bir dil olduğunu kanıtlamak için yazılmıştır.",
    "kutadgu bilig yusuf has hacib tarafından devlet yönetimi ahlak ve mutluluk bilgisi üzerine kaleme alınmıştır.",
    "yunus emre insan sevgisi hoşgörü ve duru türkçesiyle tasavvuf edebiyatının zirve ismidir.",
    "mevlana celaleddin rumi mesnevi adlı şaheseriyle evrensel sevgi ve kardeşlik mesajları vermiştir.",
    "ahmet hamdi tanpınar huzur romanında doğu ile batı arasındaki kültürel gerilimi ve estetiği işler.",
    "saatleri ayarlama enstitüsü bürokrasiyi modernleşme çabalarını ve zaman algısını hicveden usta bir romandır.",
    "yaşar kemal ince memed romanıyla çukurova insanının tabiatla ve ağalık düzeniyle mücadelesini destanlaştırır.",
    "nazım hikmet serbest nazım ve lirik şiirleriyle dünya edebiyatında saygın bir yer edinmiştir.",
    "orhan veli kanık oktay rifat ve melih cevdet anday garip akımı ile şiiri sokağa ve sade insana taşımıştır.",
    "türk dil kurumu türkçenin zenginliğini ortaya koymak ve yabancı kelimelerin istilasına karşı korumak için kurulmuştur.",
    "atasözü ve deyim yüzyılların hayat tecrübesini derin bir bilgelikle kısa ve öz biçimde aktarır.",
    "masal tekerleme ve halk hikayeleri sözlü edebiyat geleneğinin çocuklara aktardığı kültürel miraslardır.",
    
    # Hukuk, Adalet ve Toplum
    "hukuk kuralları toplumda düzeni güveni ve adaleti sağlamak amacıyla anayasa ve kanunlarla belirlenir.",
    "bağımsız mahkemeler hakimler ve savcılar adil yargılanma hakkı çerçevesinde karar verir.",
    "avukat müvekkilinin haklarını savunmak ve hukuki süreçleri takip etmekle yükümlüdür.",
    "anayasa devletin temel organlarını ve vatandaşların vazgeçilmez temel hak ve hürriyetlerini güvenceye alır.",
    "ceza hukuku suç teşkil eden fiilleri ve bunlara uygulanacak yaptırımları düzenler.",
    "medeni hukuk kişiler hukuku aile hukuku miras hukuku ve eşya hukukunu kapsar.",
    "demokrasi kuvvetler ayrılığı hukukun üstünlüğü ve çoğulcu katılım ilkelerine dayanır.",
    "insan hakları evrensel bildirgesi ırk din dil ayrımı gözetmeksizin herkesin onurunu ve eşitliğini tanır.",
    "meclis milletvekilleri halkın iradesini temsil ederek kanun teklifleri hazırlar ve yasalaştırır.",
    "sosyal adalet kaynakların dengeli dağıtılması ve dezavantajlı bireylerin korunması esasına dayanır.",
    
    # Felsefe, Mantık ve Düşünce
    "felsefe varlık bilgi ve ahlak üzerine eleştirel sorular sorarak hakikati arama çabasıdır.",
    "epistemoloji bilginin kaynağını sınırlarını doğruluğunu ve yöntemlerini inceler.",
    "ontoloji varlığın doğasını tözünü zaman ve mekan içindeki varoluşunu sorgular.",
    "etik iyi ve kötü doğru ve yanlış erdem ve vicdan gibi ahlaki kavramları değerlendirir.",
    "mantık doğru akıl yürütme tümdengelim tümevarım ve analoji kurallarını belirler.",
    "sokrates sorgulanmamış bir hayatın yaşanmaya değer olmadığını savunarak diyalektik yöntemi geliştirmiştir.",
    "platon idealar dünyası ile gölgeler dünyası arasındaki ayrımı ünlü mağara alegorisi ile açıklar.",
    "aristoteles mantığın kurucusu olarak kategoriler ve tasımlar üzerinden sistematik felsefe yapmıştır.",
    "farabi el-medinetü'l-fazıla eserinde erdemli şehri ve ideal devlet yöneticisini tasvir etmiştir.",
    "immanuel kant saf aklın eleştirisi eserinde aklın sınırlarını ve ahlakın kategorik buyruğunu incelemiştir.",
    "özgür irade ve determinizm insanın kararlarında ne derece bağımsız olduğunu tartışır.",
    
    # Doğa, Coğrafya, Evren ve Astronomi
    "evren milyarlarca galaksi yıldız kümesi gezegen ve kara delikten oluşan sonsuz bir kozmostur.",
    "samanyolu galaksisi güneş sistemi ile birlikte yüz milyarlarca yıldıza ev sahipliği yapar.",
    "güneş sistemimizde merkür venüs dünya mars jüpiter satürn uranüs ve neptün bulunur.",
    "ay dünyanın tek doğal uydusu olup denizlerde gelgit olaylarını meydana getirir.",
    "james webb ve hubble uzay teleskopları derin uzayın ve ilk galaksilerin görüntülerini yakalar.",
    "yerçekimi kütleli cisimlerin birbirini çekmesini sağlayan temel fiziksel kuvvettir.",
    "dünyanın manyetik alanı atmosferi güneş rüzgarlarından ve zararlı kozmik radyasyondan korur.",
    "okyanus ve denizler gezegenin su döngüsünü iklimini ve zengin biyolojik çeşitliliğini besler.",
    "akarsu nehir ve göller tatlı su kaynakları olarak tarım ve insan yaşamı için vazgeçilmezdir.",
    "dağ orman ve vadi yaban hayatının dengesini ve ekolojik çeşitliliği korur.",
    "iklim değişikliği ve küresel ısınma sera gazı emisyonlarının azaltılmasını ve yenilenebilir enerjiye geçişi zorunlu kılar.",
    "güneş enerjisi rüzgar türbinleri ve hidroelektrik santraller temiz ve sürdürülebilir enerji üretir.",
    
    # Ekonomi, Finans ve Ticaret
    "ekonomi sınırlı kaynakların toplumun ihtiyaçlarını karşılamak üzere nasıl dağıtılacağını inceler.",
    "merkez bankası para politikasını yönetir fiyat istikrarını sağlar ve enflasyonu düşürmeyi hedefler.",
    "enflasyon mal ve hizmet fiyatlarının genel düzeyindeki sürekli artışı ifade eder.",
    "faiz oranları yatırımları tüketimi ve tasarruf tercihlerini doğrudan etkileyen temel finansal göstergedir.",
    "borsa şirketlerin hisse senetlerinin alınıp satıldığı ve sermaye piyasalarının çalıştığı kurumsal pazardır.",
    "yatırımcı portföyünü çeşitlendirerek hisse senedi tahvil altın ve döviz arasında risk dengesi kurar.",
    "ihracat ülkenin ürettiği ürünleri yurt dışına satması ithalat ise yabancı malların ülkeye getirilmesidir.",
    "dış ticaret dengesi ihracatın ithalatı karşılama oranı ve cari denge üzerinde belirleyicidir.",
    "girişimcilik yenilikçi fikirleri karlı ve sürdürülebilir iş modellerine dönüştürme cesaretidir.",
    "banka mevduat toplar kredi kullandırır ve para transfer işlemlerine aracılık eder.",
    
    # Sanat, Müzik, Sinema ve Mimarlık
    "sanat insanın estetik duygularını hayal gücünü ve dünya görüşünü dışa vurma biçimidir.",
    "klasik müzik senfoni konçerto ve opera gibi formlarla dinleyiciye derin bir armoni yaşatır.",
    "türk sanat müziği makamlar usuller ney kanun ud ve tambur gibi geleneksel enstrümanlarla icra edilir.",
    "türk halk müziği bağlama eşliğinde türküler bozlaklar ve ağıtlarla milletin duygusunu terennüm eder.",
    "sinema yönetmen senarist oyuncu ve görüntü yönetmeninin ortak vizyonuyla perdeye yansıyan yedinci sanattır.",
    "tiyatro oyuncuların sahnede seyirciyle kurduğu canlı ve doğrudan iletişimle etkileyici bir sanattır.",
    "resim tuval fırça ve renk paleti ile ışık ve gölgenin tuval üzerindeki estetik dansıdır.",
    "heykel mermer bronz ve kil gibi malzemelerin yontulmasıyla üç boyutlu sanatsal formlar oluşturur.",
    "mimarlık mekan tasarımı estetik oranlar ve dayanıklı strüktürler ile insanın yaşam alanını inşa eder.",
    "mimar sinan süleymaniye ve selimiye camileri ile dünya mimarlık tarihinin en büyük dehalarından biridir.",
    "ebru sanatı kitreli su üzerine serpilen boyaların kağıda aktarılmasıyla oluşan geleneksel bir süsleme sanatıdır.",
    
    # Günlük Yaşam, İnsani Değerler ve Sosyal Birliktelik
    "aile fertleri sevgi saygı ve dayanışma içinde birbirine destek olarak huzurlu bir yuva kurar.",
    "dostluk ve arkadaşlık dürüstlük ve fedakarlık temeline dayanan en kıymetli insani bağdır.",
    "komşuluk ilişkileri zor günlerde yardımlaşmayı ve bayramlarda sevinçleri paylaşmayı pekiştirir.",
    "hoşgörü farklı fikirlere ve yaşam tarzlarına saygı göstererek barış içinde bir arada yaşamayı sağlar.",
    "dürüstlük ve adalet güvenilir bir karakterin ve erdemli bir insanın en belirgin nitelikleridir.",
    "çevre temizliği geri dönüşüm ve doğaya saygı gelecek nesillere yaşanabilir bir dünya bırakmanın anahtarıdır.",
    "kitap okuma alışkanlığı kelime hazinesini zenginleştirir eleştirel düşünceyi ve empati yeteneğini besler.",
    "sağlıklı beslenme düzenli yürüyüş ve kaliteli uyku beden ve zihin sağlığını dinç tutar."
]

def main():
    corpus_path = os.path.join(DATA_DIR, "corpus.txt")
    print(f"[Corpus Expander] Mevcut derlem okunuyor: {corpus_path}")
    
    existing_lines = []
    if os.path.exists(corpus_path):
        with open(corpus_path, "r", encoding="utf-8") as f:
            for line in f:
                line_str = line.strip()
                if line_str:
                    existing_lines.append(line_str)
                    
    print(f"[Corpus Expander] Mevcut satır sayısı: {len(existing_lines)}")
    existing_set = set(existing_lines)
    
    added_count = 0
    for s in ADDITIONAL_CORPUS_SENTENCES:
        s_clean = s.strip()
        if s_clean and s_clean not in existing_set:
            existing_lines.append(s_clean)
            existing_set.add(s_clean)
            added_count += 1
            
    print(f"[Corpus Expander] Eklenen yeni zengin cümle sayısı: {added_count}")
    print(f"[Corpus Expander] Toplam satır sayısı: {len(existing_lines)}")
    
    with open(corpus_path, "w", encoding="utf-8") as f:
        for line in existing_lines:
            f.write(line + "\n")
            
    print(f"[Corpus Expander] data/corpus.txt güncellendi. Model yeniden eğitiliyor...")
    
    report = train_word2vec_model(
        corpus_path=corpus_path,
        params={
            "vector_size": 100,
            "window": 5,
            "min_count": 1,
            "negative": 5,
            "sg": 1,
            "epochs": 40,
            "workers": 2,
            "seed": 42
        }
    )
    print(f"[Corpus Expander] Eğitim tamamlandı!")
    print(f"  Toplam Belirteç (Tokens): {report['corpus_statistics']['total_tokens_count']}")
    print(f"  Sözlük Kelime Sayısı (Vocab Size): {report['vocabulary_size']}")
    print(f"  Eğitim Süresi: {report['training_time_seconds']}s")
    
    eval_res = report['evaluation']
    print(f"[Corpus Expander] Benchmark Değerlendirme:")
    print(f"  Toplam Test Çifti: {eval_res['total_test_pairs']}")
    print(f"  Yüksek Tier Ortalama Benzerlik: {eval_res['avg_similarity_high_tier']}")
    print(f"  Düşük Tier Ortalama Benzerlik: {eval_res['avg_similarity_low_tier']}")
    print(f"  Ayrım Marjı: {eval_res['discrimination_margin']}")
    print(f"  Teorik Geçerlilik: {'Evet' if eval_res['is_theoretically_sound'] else 'Hayır'}")

if __name__ == "__main__":
    main()
