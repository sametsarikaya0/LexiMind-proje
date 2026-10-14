"""
LexiMind — Zengin Türkçe Derlem Genişletici ve Word2Vec Eğitici
Bu betik, günlük Türkçe ve akademik kavramları içeren yüksek kaliteli
cümlelerle data/corpus.txt dosyasını genişletir ve Gensim Word2Vec modelini eğitir.
"""

import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

DATA_DIR = os.path.join(BASE_DIR, "data")
CORPUS_PATH = os.path.join(DATA_DIR, "corpus.txt")
MODEL_PATH = os.path.join(BASE_DIR, "models", "word2vec_tr.model")

from nlp.train import train_word2vec_model

ENRICHED_SENTENCES = [
    # Okul, Eğitim ve Kırtasiye
    "öğrenci kalem ve defter ile ders notlarını dikkatle yazar.",
    "kalem mürekkep veya kurşun ile kağıt üzerine yazı yazmaya yarayan temel araçtır.",
    "tükenmez kalem dolma kalem ve kurşun kalem yazı yazarken farklı kullanım sunar.",
    "defter sayfaları çizgili kareli veya çizgisiz olarak not tutmak için kullanılır.",
    "öğretmen tahtada tebeşir ve kalem kullanarak ders anlatır öğrencilere bilgi aktarır.",
    "okul sınıflarında sıralar masalar sandalyeler ve yazı tahtası bulunur.",
    "kütüphane raflarında binlerce kitap ansiklopedi ve dergi sessizce okunmayı bekler.",
    "sınav haftasında öğrenciler kütüphanede toplanır ders çalışır ve notlarını paylaşır.",
    "üniversite amfisinde yüzlerce öğrenci profesörün verdiği dersi dinler.",
    "çanta içinde kitap defter kalem silgi ve cetvel taşınır.",

    # Ulaşım, Taşıtlar ve Şehir
    "araba asfalt yol üzerinde motor gücüyle hızla ilerler.",
    "otomobil sürücüsü direksiyonu çevirir fren ve gaza basarak aracı yönlendirir.",
    "otobüs durakta yolcuları alır ve şehir içinde belirlenen güzergahta seyreder.",
    "tren demiryolu rayları üzerinde lokomotif çekişiyle vagonları taşır.",
    "yüksek hızlı tren ankara ve istanbul arasında hızlı ve konforlu ulaşım sağlar.",
    "uçak havalimanı pistinden gökyüzüne havalanır ve bulutların üzerinde uçar.",
    "pilot uçağın kokpitinde göstergeleri izler ve uçağı güvenle indirir.",
    "gemi limandan denize açılır dalgalar arasında rotasında ilerler.",
    "trafik lambası kırmızıda dur sarıda hazırlan yeşilde geç kuralını hatırlatır.",
    "şehir caddeleri sokakları kaldırımları ve parkları ile canlı bir yaşam alanıdır.",
    "köprü nehir üzerinden geçen araçları ve yayaları karşı kıyıya bağlar.",

    # Ev, Eşyalar ve Mimari
    "ev ailenin huzur içinde yaşadığı güvenli sıcak bir yuvadır.",
    "ev odaları salon yatak odası mutfak banyo ve balkondan meydana gelir.",
    "masa üzerinde bilgisayar çalışma lambası kalemlik ve kitaplar yer alır.",
    "sandalye masanın yanında oturmak için tasarlanmış rahat bir mobilyadır.",
    "kapı anahtar ile kilitlenir ve zille çalınarak açılır.",
    "pencere odaya güneş ışığı ve temiz hava girmesini sağlar perde ile örtülür.",
    "bina tuğla beton ve demir ile sağlam temeller üzerine inşa edilir.",
    "apartman daireleri kat kat yükselir asansör ve merdivenle ulaşılır.",

    # Doğa, Coğrafya ve Çevre
    "ağaç kökleriyle toprağa tutunur gövdesi ve yeşil yapraklarıyla gölge verir.",
    "çiçek rengarenk taç yaprakları ve mis gibi kokusuyla doğayı süsler.",
    "orman binlerce ağaç bitki kuş ve vahşi hayvana ev sahipliği yapar.",
    "dağ dorukları karlarla kaplı heybetli zirveleriyle gökyüzüne yükselir.",
    "deniz masmavi suları kumsalları ve dalgalarıyla serinlik verir.",
    "göl dağların arasında biriken durgun ve tatlı su kütlesidir.",
    "nehir ve ırmak dağlardan doğar vadiler boyunca akarak denize dökülür.",
    "güneş gündüz dünyayı aydınlatır ve ısıtır hayatın temel enerji kaynağıdır.",
    "ay gece gökyüzünde hilal veya dolunay şeklinde parıldar.",
    "yıldızlar gece karanlığında gökyüzünde ışıldayan uzaktaki gök cisimleridir.",
    "yağmur bulutlardan damlalar halinde toprağa düşer bereketi getirir.",
    "kar kış mevsiminde beyaz taneler halinde yeryüzünü bembeyaz bir örtüyle kaplar.",
    "rüzgar havada esintiler oluşturur yaprakları hışırdatır ve değirmenleri döndürür.",

    # Bilişim, Teknoloji ve İletişim
    "telefon arama yapmak mesaj göndermek ve internete bağlanmak için kullanılır.",
    "akıllı telefon dokunmatik ekranı ve mobil uygulamaları ile hayatı kolaylaştırır.",
    "bilgisayar işlemci bellek ve sabit disk ile verileri işler ve saklar.",
    "klavye harfler ve rakamlarla metin yazmaya yarayan donanım birimidir.",
    "fare ekrandaki imleci hareket ettirerek komut vermeyi sağlar.",
    "ekran yüksek çözünürlüklü pikseller ile görüntüleri ve grafikleri gösterir.",
    "internet dünya genelindeki bilgisayar ağlarını birbirine bağlayan devasa yapıdır.",
    "yazılım bilgisayarın çalışmasını sağlayan kod ve programlar bütünüdür.",
    "yapay zeka verileri analiz ederek öğrenen ve problem çözen akıllı sistemlerdir.",
    "algoritma adım adım takip edilen mantıksal işlem basamaklarıdır.",
    "doğal dil işleme metinleri anlayan özetleyen ve çeviren nlp alanıdır.",
    "word2vec kelimeleri vektör uzayında temsil eden güçlü bir yapay sinir ağıdır.",
    "kosinüs benzerliği iki kelime vektörünün anlamsal yakınlığını matematiksel olarak ölçer.",

    # Sağlık, Tıp ve Yaşam
    "sağlık insanın bedenen ve ruhen tam bir iyilik halinde olması durumudur.",
    "hastane acil servis poliklinik ve ameliyathane bölümleriyle şifa dağıtır.",
    "doktor hastaları dinler stetoskopla muayene eder ve teşhis koyar.",
    "hemşire hastaların bakımını üstlenir tansiyon ölçer ve iğne yapar.",
    "ilaç eczaneden reçete ile alınır ve hastalığın tedavisinde kullanılır.",
    "tedavi doktor kontrolünde ilaç dinlenme ve cerrahi yöntemlerle yürütülür.",
    "beslenme taze sebze meyve protein ve bol su tüketimiyle dengelenir.",
    "spor yürüyüş koşu ve egzersiz kalp sağlığını ve kasları güçlendirir.",

    # Hukuk, Adalet ve Toplum
    "hukuk kuralları toplumda düzeni barışı ve adaleti sağlamak için konulur.",
    "adalet herkese hakkını teslim etmek eşit ve tarafsız davranmaktır.",
    "mahkeme salonunda hakim karar verir savcı iddia makamını temsil eder.",
    "avukat müvekkilini savunur haklarını korur ve yasal süreçleri takip eder.",
    "kanun meclis tarafından kabul edilir ve resmi gazetede yayınlanarak yürürlüğe girer.",
    "özgürlük bireyin başkalarının haklarına zarar vermeden kendi kararlarını almasıdır.",
    "demokrasi halkın kendi kendini yönettiği ve temel hakların korunduğu rejimdir.",

    # Besin, Yiyecek ve İçecek
    "ekmek fırında un su maya ve tuz karıştırılarak pişirilen temel besindir.",
    "su insan vücudunun ve tüm canlıların yaşaması için en vazgeçilmez içecektir.",
    "çay demlikte demlenir ince belli bardakta sıcak sıcak içilir.",
    "kahve kavrulmuş çekirdeklerin öğütülmesiyle cezvede veya makinada pişirilir.",
    "süt kalsiyum bakımından zengin kemik gelişimini destekleyen faydalı bir içecektir.",
    "meyve elma armut muz çilek ve portakal gibi vitamin deposu tatlı gıdalardır.",
    "sebze domates salatalık biber ıspanak ve havuç gibi mineraller içeren besinlerdir.",
    "yemek ocakta tencerede veya fırında pişirilir sofrada ailece afiyetle yenir."
]

def main():
    print("[Enrich Corpus] Derlem genişletme başlatılıyor...")
    existing_lines = []
    if os.path.exists(CORPUS_PATH):
        with open(CORPUS_PATH, "r", encoding="utf-8") as f:
            for l in f:
                s = l.strip()
                if s:
                    existing_lines.append(s)

    existing_set = set(existing_lines)
    added = 0
    for s in ENRICHED_SENTENCES:
        clean_s = s.strip()
        if clean_s and clean_s not in existing_set:
            existing_lines.append(clean_s)
            existing_set.add(clean_s)
            added += 1

    with open(CORPUS_PATH, "w", encoding="utf-8") as f:
        for l in existing_lines:
            f.write(l + "\n")

    print(f"[Enrich Corpus] {added} adet yeni zengin Türkçe cümle eklendi. Toplam: {len(existing_lines)} cümle.")
    print("[Enrich Corpus] Word2Vec Skip-gram modeli yeniden eğitiliyor...")

    report = train_word2vec_model(
        corpus_path=CORPUS_PATH,
        model_save_path=MODEL_PATH,
        params={
            "vector_size": 100,
            "window": 5,
            "min_count": 1,
            "negative": 5,
            "sg": 1,
            "epochs": 45,
            "workers": 2,
            "seed": 42
        }
    )

    print(f"[Enrich Corpus] Model başarıyla eğitildi ve kaydedildi:")
    print(f"  - Vocab Size: {report['vocabulary_size']} kelime")
    print(f"  - Total Tokens: {report['corpus_statistics']['total_tokens_count']}")
    print(f"  - Süre: {report['training_time_seconds']}s")

if __name__ == "__main__":
    main()
