# Instagram Reels: masa başı çalışanlar için fizyoterapist

Animasyonlu iki Reel (1080x1920, 30 fps).

- `videolar/reel1_video.mp4`, `videolar/reel2_video.mp4`: sessiz animasyonlar (altyazılı)
- `videolar/*_kadin_sesi.mp4`: Piper "fettah" (tr_TR, CC0) sesiyle seslendirilmiş sürümler
- `animasyon/`: canvas animasyon kodu. Render: `node render.js reel1.html cikti.mp4 video`
  (Playwright + ffmpeg). Ara kare: `node render.js reel1.html prev/r1 frames 1.5,4.5`
- `ses/lines.tsv`: seslendirme metinleri ve hangi cümlenin hangi sahneye ait olduğu
- `ses/select.py`: her cümle için aday üretip Whisper ile en anlaşılır olanı seçer

## Ses yerleşim zamanları (saniye)

Reel 1 (30.6 sn): r1_0 0.15, r1_1 3.3, r1_2 5.65, r1_3 9.25, r1_4 12.95, r1_5 16.75, r1_6 20.05, r1_7 22.95, r1_8 27.45
Reel 2 (34 sn): r2_0 0.1, r2_1 3.1, r2_2 6.1, r2_3 9.6, r2_4 13.1, r2_5 15.6, r2_6 19.2, r2_7 23.6, r2_8 26.6, r2_9 28.5, r2_10 31.1

## Sonraki adım

huggingface.co erişimi açıldıktan sonra Pocket TTS Turkish (`pip install pocket-tts-turkish`,
kadın sesleri female_1/2/3, CC-BY-4.0) ile cümleleri yeniden üretip aynı zamanlara yerleştirmek.

## Güncelleme: Pocket TTS Turkish sesi

`videolar/*_yeni_ses.mp4`: Pocket TTS Turkish `female_2` (sıcak, samimi; CC-BY-4.0) ile seslendirildi.
Cümleler `ses/select_pocket.py` ile üretildi (`ONLY=... NSEED=8 python select_pocket.py female_2 <whisper-klasörü>`),
klipler `ses/pocket_female_2/` içinde. Ses için atıf: "Ses: Pocket TTS Turkish (wite-tech), CC-BY-4.0".

## Güncelleme 2: canlı tasarım ve Ahenk sesi

- Animasyon yeni renk paleti ile yeniden tasarlandı: sahne başına canlı renk geçişleri, süzülen şekiller,
  çıkartma (sticker) başlıklar, parıltılar, renkli karakter ve kupa.
- `videolar/*_canli.mp4`: Ahenk (VoxCPM2 + Türkçe LoRA, `ozgurguler/ahenk-tts-tr`, CC-BY-4.0) kadın sesiyle,
  cümleye göre duygu talimatıyla (neşeli, sıcak, sakin) seslendirildi. `ses/ahenk_gen.py` ile üretildi.
- Animasyon zamanlaması sese göre yeniden hesaplandı (`KN` dizileri, `ses/ahenk_zamanlama.json`).
- Atıf: "Seslendirme: Ahenk (ozgurguler), CC-BY-4.0. Yapay zekâ ile üretilmiş ses."

## Güncelleme 3: son kontrol iyileştirmeleri

- `videolar/*_final.mp4`: paylaşılacak son sürümler.
- Cümle ses seviyeleri eşitlendi (-16 LUFS; önce -12 ile -20 arasıydı), cümle arası boşluklar kısaltıldı
  (Reel 1: 29.6 sn, Reel 2: 36.1 sn), sahne geçişlerine hafif efekt sesleri eklendi (`ses/ahenk_build.py`).
- İlk kare artık başlıkla açılıyor; "Eğme/Kaydır" sahnesinde masa ve sandalye eklendi; "Çeneyi geri it" oku başın üstüne alındı.
- `kapaklar/`: profil ızgarasında (3:4) düzgün görünecek kapak görselleri.

## Güncelleme 4: tek ses, "ilk gün" sahnesi çıkarıldı, diş hekimi videosu

- `videolar/*_tekses.mp4`: paylaşılacak son sürümler (3 video).
- Tüm cümleler VoxCPM2 "ultimate cloning" ile tek bir referans sesten üretildi (`ses/gen_clone.py`).
  Referans: Ahenk model kartındaki tasarlanmış (sentetik) f022 sesi örneği. Duygu talimatı kullanılmadı.
  Konuşmacı tutarlılığı (`ses/spk.py`, cümleler arası en düşük benzerlik): 0.56 → 0.66, ortalama 0.91.
- Reel 1'den "Ben fizyoterapistim. Bugün ilk günüm" sahnesi çıkarıldı (25 sn).
- `animasyon/reel3.js`: diş hekimlerinde duruş bozukluğu videosu (39 sn). Kaynaklar: Lietz ve ark. 2018
  (PLoS ONE meta-analizi: boyun %58,5, bel %56,4, omuz %43,1), FDI ergonomi rehberi.


## Güncelleme 5: üç yeni meslek videosu ve tam kalite kontrolü

Paylaşılacak son sürümler `videolar/` içinde, kapaklar `kapaklar/` içinde:

| # | Video | Süre | Kaynak (ekranda) |
|---|---|---|---|
| 1 | F1_masa_basi | 25 sn | - |
| 2 | F2_boyun | 33 sn | - |
| 3 | F3_dis_hekimi | 38 sn | Lietz ve ark., PLoS ONE 2018 |
| 4 | F4_ogretmen | 39 sn | Tahernejad ve ark., Front. Public Health 2024 |
| 5 | F5_kuafor | 38 sn | Kozak ve ark., J Occup Med Toxicol 2019 |
| 6 | F6_sofor | 39 sn | Joseph ve ark., J Occup Health 2020 |

- Tüm sesler tek referanstan (VoxCPM2 ultimate cloning) üretildi; `ses/klipler/`.
- `ses/qa.py` kalite kontrolü (59 cümle): telaffuz hatası yok (Whisper, sona sessizlik eklenerek),
  ses tutarlılığı ortalama 0.91, tüm videolar -14 LUFS, tepe en fazla -1.4 dBFS, cümle seviye farkı en fazla 2.5 dB,
  her cümle kendi altyazı penceresi içinde.
- Animasyon: `animasyon/prof.js` (ortak meslek parçaları), `reel_t.js`, `reel_k.js`, `reel_s.js`.
