import React, { useEffect, useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { useExperience } from '../context/ExperienceContext';
import { listEvents } from '../services/events';
import { createCheckoutForm } from '../services/payments';
import { createReservation, updateReservationStatus } from '../services/reservations';
import { EventScheduleItem } from '../types/event';

const toISODate = (date: Date) => {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().split('T')[0];
};

const getMonthLabel = (year: number, monthIndex: number) =>
  new Date(year, monthIndex, 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric'
  });

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const PENDING_RESERVATION_KEY = 'gye_pending_reservation';

const formatISODateLabel = (isoDate: string) => {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
};

const isValidPhoneNumber = (value: string) => /^[+]?[\d\s()-]{7,20}$/.test(value.trim());
const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const parseEventDetailsLines = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return [];

  let normalized = trimmed.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // If admin entered a single-line payload, split by common bullet markers.
  if (!normalized.includes('\n')) {
    normalized = normalized
      .replace(/\s+(?=(✅|✔|❌|⚠️|⚠|🧳|🥤|\+|•))/g, '\n')
      .replace(
        /\s+(?=(Included|Not Included|Important Information|What Should You Bring\?|Additional Info))/gi,
        '\n'
      );
  }

  return normalized
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
};

type EventCalendarPanelProps = {
  embedded?: boolean;
};

type ReservationFormState = {
  pickupStop: string;
  participants: string;
  fullName: string;
  email: string;
  hotelName: string;
  phone: string;
  referralCode: string;
};

type GeneratedTicket = {
  reference: string;
  category: string;
  eventTitle: string;
  date: string;
  time: string;
  durationHours: number;
  pickupStop: string;
  fullName: string;
  email: string;
  hotelName: string;
  phone: string;
  participants: number;
  amount: number;
  serviceStops: string[];
};

const buildTicketPayload = (
  event: EventScheduleItem,
  form: ReservationFormState,
  activeDate: string
): GeneratedTicket => ({
  reference: `GYE-${Date.now().toString().slice(-8)}`,
  category: event.category,
  eventTitle: event.title,
  date: activeDate,
  time: event.time,
  durationHours: event.durationHours,
  pickupStop: form.pickupStop,
  fullName: form.fullName,
  email: form.email,
  hotelName: form.hotelName,
  phone: form.phone,
  participants: Number(form.participants),
  amount: event.price * Number(form.participants),
  serviceStops: event.serviceStops
});

const toTicketQrText = (ticket: GeneratedTicket) =>
  [
    `Ref:${ticket.reference}`,
    `Category:${ticket.category}`,
    `Event:${ticket.eventTitle}`,
    `Date:${ticket.date} ${ticket.time}`,
    `Pickup:${ticket.pickupStop}`,
    `Name:${ticket.fullName}`,
    `Email:${ticket.email}`,
    `Hotel:${ticket.hotelName || '-'}`,
    `Phone:${ticket.phone}`,
    `Seats:${ticket.participants}`,
    `Amount:TRY ${ticket.amount}`
  ].join('|');

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const createTicketCanvas = async (ticket: GeneratedTicket, accent: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1800;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#091320');
  gradient.addColorStop(1, '#0f2336');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, canvas.width, 22);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '700 52px sans-serif';
  ctx.fillText('GET YOUR EXTREME', 72, 120);
  ctx.font = '600 34px sans-serif';
  ctx.fillStyle = '#93c5fd';
  ctx.fillText('EVENT ACCESS TICKET', 72, 176);

  ctx.fillStyle = '#0b1726';
  ctx.strokeStyle = '#24364a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(56, 230, 1088, 1500, 28);
  ctx.fill();
  ctx.stroke();

  const qrDataUrl = await QRCode.toDataURL(toTicketQrText(ticket), {
    width: 360,
    margin: 1,
    color: {
      dark: '#0f172a',
      light: '#ffffff'
    }
  });
  const qrImage = await loadImage(qrDataUrl);
  ctx.drawImage(qrImage, 760, 300, 320, 320);

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 36px sans-serif';
  ctx.fillText(ticket.eventTitle, 96, 320);
  ctx.font = '600 22px sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`Reference: ${ticket.reference}`, 96, 365);
  ctx.fillText(`${ticket.date}  ${ticket.time}`, 96, 402);
  ctx.fillText(`Category: ${ticket.category}`, 96, 439);

  const rows = [
    ['Passenger', ticket.fullName],
    ['Email', ticket.email],
    ...(ticket.hotelName ? [['Hotel', ticket.hotelName]] : []),
    ['Phone', ticket.phone],
    ['Participants', String(ticket.participants)],
    ['Pickup Stop', ticket.pickupStop],
    ['Duration', `${ticket.durationHours} hours`],
    ['Amount', `EUR ${ticket.amount}`]
  ];

  let y = 535;
  rows.forEach(([label, value]) => {
    ctx.fillStyle = '#60a5fa';
    ctx.font = '700 20px sans-serif';
    ctx.fillText(label, 96, y);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '600 24px sans-serif';
    ctx.fillText(value, 320, y);
    y += 74;
  });

  ctx.fillStyle = '#60a5fa';
  ctx.font = '700 20px sans-serif';
  ctx.fillText('Service Route', 96, y + 8);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '600 21px sans-serif';
  ctx.fillText(ticket.serviceStops.join('  ->  '), 96, y + 52);

  ctx.strokeStyle = '#334155';
  ctx.beginPath();
  ctx.moveTo(96, 1300);
  ctx.lineTo(1104, 1300);
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 20px sans-serif';
  ctx.fillText('Please present this QR ticket at check-in. This ticket is generated for demo flow.', 96, 1360);
  ctx.fillText('For changes, contact operations before event start time.', 96, 1400);

  return canvas;
};

const EventCalendarPanel: React.FC<EventCalendarPanelProps> = ({ embedded = false }) => {
  const { activeCategory, activeDate, setActiveDate, theme } = useExperience();
  const [viewYearMonth, setViewYearMonth] = useState(activeDate.slice(0, 7));
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEventsLoading, setIsEventsLoading] = useState(true);
  const [eventsLoadError, setEventsLoadError] = useState<string | null>(null);
  const [events, setEvents] = useState<EventScheduleItem[]>([]);
  const [generatedTicket, setGeneratedTicket] = useState<GeneratedTicket | null>(null);
  const [reservationForm, setReservationForm] = useState<ReservationFormState>({
    pickupStop: '',
    participants: '1',
    fullName: '',
    email: '',
    hotelName: '',
    phone: '',
    referralCode: ''
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [isAgreementOpen, setIsAgreementOpen] = useState(false);
  const [agreementLang, setAgreementLang] = useState<'tr' | 'en'>('tr');

  const agreementTextTr = `MESAFELİ SATIŞ VE HİZMET SÖZLEŞMESİ
1. TARAFLAR
İşbu sözleşme, [AKTİVİTE ANTALYA DOĞA SPORLARI TURİZM OTELCİLİK LTD. ŞTİ.] (“Satıcı”) ile www.getyourextreme.com üzerinden hizmet satın alan kullanıcı (“Kullanıcı”) arasında elektronik ortamda kurulmuştur.
2. KONU
İşbu sözleşmenin konusu; Satıcı tarafından sunulan ekstrem spor aktiviteleri (SUP, kaya tırmanışı, dağ bisikleti, foil board vb.), bu aktivitelere ilişkin eğitim hizmetleri ve ekipman kiralama hizmetlerinin satışına ilişkin tarafların hak ve yükümlülüklerinin belirlenmesidir.
3. HİZMET VE KİRALAMA KAPSAMI
3.1. Sunulan tüm hizmetler rezervasyon esasına tabidir.
3.2. Hizmetler belirli tarih, saat ve lokasyonda fiziksel olarak sunulur.
3.3. Satıcı, gerekli gördüğü hallerde hizmet içeriğinde değişiklik yapma hakkını saklı tutar.
3.4. Ekipman kiralama hizmetleri kapsamında SUP board, bisiklet, tırmanış ekipmanları ve yan ekipmanlar Kullanıcı’ya geçici olarak tahsis edilir.
4. REZERVASYON VE ÖDEME
4.1. Kullanıcı, web sitesi üzerinden rezervasyon oluşturur ve ödeme ile birlikte sözleşme yürürlüğe girer.
4.2. Ödeme tamamlanmadan rezervasyon kesinleşmez.
5. CAYMA HAKKI
Sunulan hizmetler belirli bir tarihte ifa edilen boş zaman değerlendirme hizmetleri kapsamında olup, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve ilgili Mesafeli Sözleşmeler Yönetmeliği uyarınca cayma hakkı bulunmamaktadır.
6. İPTAL VE İADE KOŞULLARI
6.1. Etkinlik tarihinden en az 24 saat önce yapılan iptallerde ücret iadesi yapılır.
6.2. 24 saatten kısa süre kala yapılan iptallerde iade yapılmaz.
6.3. Kullanıcının etkinliğe katılmaması halinde ücret iadesi yapılmaz.
6.4. Hava koşulları, güvenlik veya operasyonel sebeplerle etkinliğin iptal edilmesi halinde:
• Tam iade yapılabilir veya
• Kullanıcıya alternatif tarih sunulabilir.
6.5. Satıcı, gerekli gördüğü durumlarda iade yerine tarih değişikliği teklif etme hakkını saklı tutar.
7. GECİKME VE KATILMAMA
Kullanıcının etkinliğe geç kalması veya katılmaması durumunda hizmet verilmemiş olsa dahi ücret iadesi yapılmaz.
8. EKİPMAN KİRALAMA VE DEPOZİTO
8.1. Kiralanan ekipmanlar Kullanıcıya sağlam ve kullanıma hazır şekilde teslim edilir.
8.2. Kullanıcı, ekipmanı özenle kullanmakla yükümlüdür.
8.3. Ekipmanın hasar görmesi, kaybolması veya eksik iade edilmesi halinde doğan zarar Kullanıcı tarafından karşılanır.
8.4. Satıcı, ekipman kiralamalarında depozito talep edebilir. Depozito, ekipmanın eksiksiz ve hasarsız iadesi sonrası iade edilir.
8.5. Hasar tespiti halinde depozitodan mahsup yapılabilir.
9. KULLANICI YÜKÜMLÜLÜKLERİ
9.1. Kullanıcı, aktiviteye katılmak için gerekli fiziksel yeterliliğe sahip olduğunu beyan eder.
9.2. Kullanıcı, sağlık durumunun aktiviteye uygun olduğunu kabul eder.
9.3. Kullanıcı, eğitmen ve rehberlerin tüm talimatlarına uymakla yükümlüdür.
9.4. Talimatlara aykırı davranan kullanıcı etkinlikten çıkarılabilir ve bu durumda iade yapılmaz.
10. RİSK KABULÜ VE SORUMLULUK SINIRLAMASI
10.1. Kullanıcı, ekstrem spor faaliyetlerinin doğası gereği risk içerdiğini kabul eder.
10.2. Bu faaliyetler sırasında yaralanma, sakatlanma, düşme, ekipman hasarı gibi riskler bulunduğunu bilerek katılım sağlar.
10.3. Kullanıcı, kendi kusuru, talimatlara aykırı davranışı veya üçüncü kişilerden kaynaklanan zararlar bakımından Satıcı’nın sorumlu olmadığını kabul eder.
10.4. Satıcı yalnızca kastı ve ağır ihmali bulunan durumlarda sorumlu tutulabilir.
11. HAVA KOŞULLARI VE GÜVENLİK
Etkinliğin güvenli şekilde gerçekleştirilebilmesi için gerekli koşulların oluşup oluşmadığına Satıcı tek taraflı olarak karar verir.
12. MÜCBİR SEBEP
Doğal afetler, kötü hava koşulları, salgın hastalıklar, kamu otoritelerinin kararları ve benzeri mücbir sebepler halinde Satıcı sorumlu tutulamaz.
13. FOTOĞRAF VE VİDEO KULLANIMI
Kullanıcı, etkinlik sırasında çekilen fotoğraf ve videoların tanıtım amacıyla kullanılmasına izin verdiğini kabul eder.
14. KİŞİSEL VERİLERİN KORUNMASI
Kullanıcı’ya ait kişisel veriler, ilgili mevzuata uygun olarak işlenir ve korunur. Detaylı bilgi Gizlilik Politikası’nda yer almaktadır.
15. UYUŞMAZLIK ÇÖZÜMÜ
Uyuşmazlıklarda Antalya ve ilçelerindeki Tüketici Hakem Heyetleri ve Antalya Mahkemeleri yetkilidir.
16. YÜRÜRLÜK
Kullanıcı, ödeme yaparak işbu sözleşme hükümlerini kabul etmiş sayılır.

KİŞİSEL VERİLERİN KORUNMASI AYDINLATMA METNİ
1. VERİ SORUMLUSU
6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, kişisel verileriniz veri sorumlusu sıfatıyla [Şirket Unvanı] (“Şirket”) tarafından aşağıda açıklanan kapsamda işlenebilecektir.
2. İŞLENEN KİŞİSEL VERİLER
Şirket tarafından işlenebilecek kişisel verileriniz şunlardır:
• Kimlik bilgileri (ad, soyad)
• İletişim bilgileri (telefon, e-posta)
• İşlem bilgileri (rezervasyon, ödeme bilgileri)
• Lokasyon bilgisi (etkinlik alanına ilişkin sınırlı veri)
• Görsel ve işitsel kayıtlar (fotoğraf, video)
• Sağlık beyanı (katılım uygunluğu kapsamında sınırlı beyan)
3. KİŞİSEL VERİLERİN İŞLENME AMAÇLARI
Toplanan kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
• Rezervasyon ve hizmet süreçlerinin yürütülmesi
• Ekipman kiralama işlemlerinin gerçekleştirilmesi
• Ödeme işlemlerinin tamamlanması
• Katılımcı güvenliğinin sağlanması
• İletişim faaliyetlerinin yürütülmesi
• Yasal yükümlülüklerin yerine getirilmesi
• Olası uyuşmazlıklarda delil oluşturulması
• Tanıtım ve pazarlama faaliyetleri (fotoğraf/video kullanımı dahil)
4. KİŞİSEL VERİLERİN AKTARILMASI
Kişisel verileriniz, yukarıda belirtilen amaçların gerçekleştirilmesi doğrultusunda:
• Yetkili kamu kurum ve kuruluşlarına
• Ödeme hizmet sağlayıcılarına
• İş ortaklarına ve hizmet sağlayıcılara
KVKK’nın 8 ve 9. maddelerine uygun olarak aktarılabilir.
5. KİŞİSEL VERİ TOPLAMA YÖNTEMİ VE HUKUKİ SEBEP
Kişisel verileriniz;
• Web sitesi üzerinden rezervasyon sırasında,
• Etkinlik kayıt formları aracılığıyla,
• Sözlü, yazılı veya elektronik ortamda
KVKK’nın 5. ve 6. maddelerinde belirtilen:
• Sözleşmenin kurulması ve ifası
• Hukuki yükümlülüklerin yerine getirilmesi
• Açık rıza
hukuki sebeplerine dayanılarak işlenmektedir.
6. KVKK KAPSAMINDA HAKLARINIZ
KVKK’nın 11. maddesi uyarınca veri sahibi olarak:
• Kişisel verilerinizin işlenip işlenmediğini öğrenme
• İşlenmişse bilgi talep etme
• İşlenme amacını öğrenme
• Verilerin düzeltilmesini veya silinmesini isteme
• İşlemenin hukuka aykırı olması halinde zararın giderilmesini talep etme
haklarına sahipsiniz.
7. BAŞVURU YOLLARI
Yukarıda belirtilen haklarınıza ilişkin taleplerinizi [e-posta adresi] üzerinden Şirket’e iletebilirsiniz.
8. VERİ SAKLAMA SÜRESİ
Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca ve ilgili mevzuatta öngörülen süreler kadar saklanır.
9. GÜVENLİK
Şirket, kişisel verilerinizin hukuka aykırı olarak işlenmesini ve erişilmesini önlemek amacıyla gerekli teknik ve idari tedbirleri almaktadır.
10. YÜRÜRLÜK
İşbu Aydınlatma Metni, web sitesi üzerinden yayımlandığı tarihte yürürlüğe girer.
`;

  const agreementTextEn = `DISTANCE SALES AND SERVICE AGREEMENT
1. PARTIES
This Agreement is concluded electronically between [AKTİVİTE ANTALYA DOĞA SPORLARI TURİZM OTELCİLİK LTD. ŞTİ.] ("Seller") and the user ("User") who purchases services via www.getyourextreme.com.
2. SUBJECT
The subject of this Agreement is to determine the rights and obligations of the parties regarding the sale of extreme sports activities (such as SUP, rock climbing, mountain biking, foil board, etc.), related training services, and equipment rental services provided by the Seller.
3. SCOPE OF SERVICES AND RENTALS
3.1. All services are subject to reservation.
3.2. Services are provided physically at specific dates, times, and locations.
3.3. The Seller reserves the right to make changes to the service content when deemed necessary.
3.4. Within the scope of equipment rental, SUP boards, bicycles, climbing equipment, and related accessories are temporarily allocated to the User.
4. RESERVATION AND PAYMENT
4.1. The User creates a reservation via the website, and the Agreement enters into force upon payment.
4.2. Reservations are not confirmed until payment is completed.
5. RIGHT OF WITHDRAWAL
The services provided fall under leisure services performed on a specific date; therefore, pursuant to Law No. 6502 on Consumer Protection and the Distance Contracts Regulation, the right of withdrawal does not apply.
6. CANCELLATION AND REFUND CONDITIONS
6.1. Refunds are granted for cancellations made at least 24 hours before the event.
6.2. No refunds are given for cancellations made less than 24 hours prior to the event.
6.3. No refunds are provided if the User fails to attend the event.
6.4. If the event is canceled due to weather conditions, safety, or operational reasons:
A full refund may be issued, or
An alternative date may be offered to the User.
6.5. The Seller reserves the right to offer a date change instead of a refund where deemed appropriate.
7. DELAY AND NON-ATTENDANCE
If the User is late or does not attend the event, no refund will be provided even if the service has not been received.
8. EQUIPMENT RENTAL AND DEPOSIT
8.1. Rental equipment is delivered in good condition and ready for use.
8.2. The User is responsible for using the equipment with due care.
8.3. Any damage, loss, or incomplete return of the equipment shall be compensated by the User.
8.4. The Seller may require a deposit for equipment rentals. The deposit will be refunded upon the return of the equipment in full and undamaged condition.
8.5. In case of damage, deductions may be made from the deposit.
9. USER OBLIGATIONS
9.1. The User declares that they have the necessary physical capability to participate in the activity.
9.2. The User accepts that their health condition is suitable for participation.
9.3. The User agrees to comply with all instructions given by instructors and guides.
9.4. Users who fail to comply with instructions may be removed from the activity without any refund.
10. RISK ACCEPTANCE AND LIMITATION OF LIABILITY
10.1. The User acknowledges that extreme sports inherently involve risks.
10.2. The User participates with full awareness of risks such as injury, accidents, falls, and equipment damage.
10.3. The User agrees that the Seller is not liable for damages arising from the User's own fault, non-compliance with instructions, or third parties.
10.4. The Seller shall only be held liable in cases of intent or gross negligence.
11. WEATHER CONDITIONS AND SAFETY
The Seller has the sole discretion to determine whether conditions are suitable for safely conducting the activity.
12. FORCE MAJEURE
The Seller shall not be held liable for events such as natural disasters, adverse weather conditions, pandemics, or decisions of public authorities.
13. PHOTO AND VIDEO USAGE
The User consents to the use of photos and videos taken during the activity for promotional purposes.
14. PERSONAL DATA PROTECTION
The User's personal data shall be processed and protected in accordance with applicable legislation. Detailed information is provided in the Privacy Policy.
15. DISPUTE RESOLUTION
In case of disputes, Consumer Arbitration Committees and Courts of Antalya shall have jurisdiction.
16. ENTRY INTO FORCE
The User shall be deemed to have accepted the terms of this Agreement upon making payment.

PERSONAL DATA PROTECTION INFORMATION NOTICE
1. DATA CONTROLLER
Pursuant to the Personal Data Protection Law No. 6698 ("KVKK"), your personal data may be processed by [Company Name] ("Company") as the data controller within the scope described below.
2. PROCESSED PERSONAL DATA
The Company may process the following personal data:
Identity information (name, surname)
Contact information (phone, email)
Transaction information (reservation, payment details)
Location data (limited to activity area)
Visual and audio records (photos, videos)
Health declaration (limited to participation suitability)
3. PURPOSES OF PROCESSING PERSONAL DATA
Your personal data are processed for the following purposes:
Execution of reservation and service processes
Conducting equipment rental operations
Completing payment transactions
Ensuring participant safety
Managing communication activities
Fulfilling legal obligations
Providing evidence in case of disputes
Conducting marketing and promotional activities (including photo/video use)
4. TRANSFER OF PERSONAL DATA
Your personal data may be transferred, in accordance with Articles 8 and 9 of KVKK, to:
Authorized public institutions and organizations
Payment service providers
Business partners and service providers
5. METHOD AND LEGAL BASIS FOR DATA COLLECTION
Your personal data are collected:
During reservation via the website,
Through event registration forms,
Via verbal, written, or electronic means
Based on the legal grounds specified in Articles 5 and 6 of KVKK:
Establishment and performance of a contract
Fulfillment of legal obligations
Explicit consent
6. YOUR RIGHTS UNDER KVKK
Pursuant to Article 11 of KVKK, you have the right to:
Learn whether your personal data are processed
Request information if processed
Learn the purpose of processing
Request correction or deletion of data
Request compensation in case of unlawful processing
7. APPLICATION METHODS
You may submit your requests regarding your rights via [email address].
8. DATA RETENTION PERIOD
Your personal data will be stored for the duration required by the processing purpose and in accordance with applicable legislation.
9. SECURITY
The Company takes necessary technical and administrative measures to prevent unlawful processing and access to personal data.
10. ENTRY INTO FORCE
This Information Notice enters into force on the date it is published on the website.
`;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    if (!paymentStatus) return;

    const rawPending = localStorage.getItem(PENDING_RESERVATION_KEY);
    const cleanupUrl = () => {
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.delete('payment');
      nextUrl.searchParams.delete('conversationId');
      nextUrl.searchParams.delete('paymentId');
      window.history.replaceState({}, document.title, nextUrl.pathname + nextUrl.search);
    };

    if (!rawPending) {
      cleanupUrl();
      return;
    }

    const finalizeReservation = async () => {
      setIsSubmitting(true);
      try {
        const pending = JSON.parse(rawPending) as {
          reservationId: number;
          ticket: GeneratedTicket;
        };

        if (paymentStatus === 'success') {
          try {
            await updateReservationStatus(pending.reservationId, 'Confirmed');
          } catch {
            // Webhook will also update; ignore client update failures.
          }
          setGeneratedTicket(pending.ticket);
          localStorage.removeItem(PENDING_RESERVATION_KEY);
          alert('Payment successful. Your ticket is ready to download.');
        } else {
          try {
            await updateReservationStatus(pending.reservationId, 'Cancelled');
          } catch {
            // Webhook will also update; ignore client update failures.
          }
          localStorage.removeItem(PENDING_RESERVATION_KEY);
          alert('Payment failed. Please try again.');
        }
      } catch {
        alert('Payment confirmation failed. Please contact support.');
      } finally {
        cleanupUrl();
        setIsSubmitting(false);
      }
    };

    void finalizeReservation();
  }, []);

  const [viewYear, viewMonth] = viewYearMonth.split('-').map(Number);
  const todayIsoDate = toISODate(new Date());
  const firstDayOfMonth = new Date(viewYear, viewMonth - 1, 1);
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const leadingEmptyCells = firstDayOfMonth.getDay();

  const datesWithEvents = useMemo(() => {
    return new Set(
      events.filter((item) => item.category === activeCategory).map((item) => item.date)
    );
  }, [events, activeCategory]);
  const selectedDayEvents = useMemo(
    () =>
      events.filter((item) => item.date === activeDate && item.category === activeCategory),
    [events, activeDate, activeCategory]
  );
  const selectedEvent = useMemo(
    () => selectedDayEvents.find((item) => item.id === selectedEventId) ?? selectedDayEvents[0] ?? null,
    [selectedDayEvents, selectedEventId]
  );

  useEffect(() => {
    setViewYearMonth(activeDate.slice(0, 7));
  }, [activeDate]);

  useEffect(() => {
    let isMounted = true;
    const fetchEvents = async () => {
      setIsEventsLoading(true);
      setEventsLoadError(null);
      try {
        const loaded = await listEvents();
        if (isMounted) {
          setEvents(loaded);
        }
      } catch {
        if (isMounted) {
          setEventsLoadError('Events could not be loaded.');
        }
      } finally {
        if (isMounted) {
          setIsEventsLoading(false);
        }
      }
    };

    fetchEvents();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setSelectedEventId(selectedDayEvents[0]?.id ?? null);
  }, [selectedDayEvents]);

  useEffect(() => {
    if (!selectedEvent) return;
    setReservationForm((current) => ({
      ...current,
      pickupStop: selectedEvent.serviceStops.includes(current.pickupStop)
        ? current.pickupStop
        : selectedEvent.serviceStops[0]
    }));
  }, [selectedEvent]);

  const goToPreviousMonth = () => {
    const previous = new Date(viewYear, viewMonth - 2, 1);
    setViewYearMonth(`${previous.getFullYear()}-${String(previous.getMonth() + 1).padStart(2, '0')}`);
  };

  const goToNextMonth = () => {
    const next = new Date(viewYear, viewMonth, 1);
    setViewYearMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setReservationForm((current) => ({
      ...current,
      [e.target.name]: e.target.value
    }));
  };

  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    const seatsRequested = Number(reservationForm.participants);
    const seatsLeft = selectedEvent.capacity - selectedEvent.booked;
    const fullName = reservationForm.fullName.trim();
    const email = reservationForm.email.trim();
    const phone = reservationForm.phone.trim();
    const referralCode = reservationForm.referralCode.trim().toUpperCase();

    if (!reservationForm.pickupStop || !fullName || !email || !phone || !seatsRequested) {
      alert('Please complete pickup, participant count, name, email and phone.');
      return;
    }
    if (!termsAccepted || !kvkkAccepted) {
      alert('Please confirm that you have read and accepted the required terms.');
      return;
    }

    if (!Number.isInteger(seatsRequested) || seatsRequested < 1) {
      alert('Participant count must be at least 1.');
      return;
    }

    if (seatsRequested > seatsLeft) {
      alert(`Only ${seatsLeft} seats available for this event.`);
      return;
    }

    if (!isValidEmail(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    if (!isValidPhoneNumber(phone)) {
      alert('Please enter a valid phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const ticket = buildTicketPayload(
        selectedEvent,
        { ...reservationForm, fullName, email, phone, participants: String(seatsRequested) },
        activeDate
      );

      const reservationDraft = {
        customerName: fullName,
        customerPhone: phone,
        activity: `${theme.label} Event: ${selectedEvent.title}`,
        route: `Pickup ${reservationForm.pickupStop}${reservationForm.hotelName.trim() ? ` | Hotel ${reservationForm.hotelName.trim()}` : ''} | Seats ${seatsRequested} | ${selectedEvent.serviceStops.join(' -> ')}`,
        date: activeDate,
        source: 'event' as const,
        amount: selectedEvent.price * seatsRequested,
        eventId: selectedEvent.id,
        referredByCode: referralCode || undefined
      };

      const createdReservation = await createReservation({
        ...reservationDraft,
        status: 'Pending'
      });

      localStorage.setItem(
        PENDING_RESERVATION_KEY,
        JSON.stringify({
          reservationId: createdReservation.id,
          ticket
        })
      );

      const checkout = await createCheckoutForm({
        amount: reservationDraft.amount ?? 0,
        currency: 'TRY',
        buyer: {
          fullName,
          email,
          phone,
          address: reservationDraft.route,
          city: 'Antalya',
          country: 'Turkey'
        },
        item: {
          id: String(selectedEvent.id),
          name: selectedEvent.title,
          category: selectedEvent.category,
          price: reservationDraft.amount ?? 0
        },
        conversationId: String(createdReservation.id)
      });

      if (checkout.paymentPageUrl) {
        window.location.href = checkout.paymentPageUrl;
        return;
      }

      throw new Error(checkout.errorMessage || 'Checkout initialization failed.');
    } catch {
      const rawPending = localStorage.getItem(PENDING_RESERVATION_KEY);
      if (rawPending) {
        try {
          const pending = JSON.parse(rawPending) as { reservationId: number };
          await updateReservationStatus(pending.reservationId, 'Cancelled');
        } catch {
          // Ignore; reservation might be in Supabase and updated by webhook.
        }
        localStorage.removeItem(PENDING_RESERVATION_KEY);
      }
      alert('Payment could not be started. Please try again.');
      setIsSubmitting(false);
    }
  };

  const downloadTicketImage = async () => {
    if (!generatedTicket) return;
    try {
      const canvas = await createTicketCanvas(generatedTicket, theme.accent);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${generatedTicket.category.toLowerCase()}-${generatedTicket.date}-${generatedTicket.fullName
        .replace(/\s+/g, '-')
        .toLowerCase()}-ticket.png`;
      link.click();
    } catch {
      alert('Ticket image could not be generated. Please try again.');
    }
  };

  const downloadTicketPdf = async () => {
    if (!generatedTicket) return;
    try {
      const canvas = await createTicketCanvas(generatedTicket, theme.accent);
      const imageData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 24;
      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2;
      const imageRatio = canvas.height / canvas.width;
      let imageWidth = availableWidth;
      let imageHeight = imageWidth * imageRatio;

      if (imageHeight > availableHeight) {
        imageHeight = availableHeight;
        imageWidth = imageHeight / imageRatio;
      }

      const x = (pageWidth - imageWidth) / 2;
      const y = (pageHeight - imageHeight) / 2;
      pdf.addImage(imageData, 'PNG', x, y, imageWidth, imageHeight);
      pdf.save(
        `${generatedTicket.category.toLowerCase()}-${generatedTicket.date}-${generatedTicket.fullName
          .replace(/\s+/g, '-')
          .toLowerCase()}-ticket.pdf`
      );
    } catch {
      alert('Ticket PDF could not be generated. Please try again.');
    }
  };

  return (
    <section className={embedded ? '' : 'py-16 bg-white dark:bg-[#0f171e]'}>
      <div className={embedded ? '' : 'max-w-[1200px] mx-auto px-6'}>
        {!embedded && (
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
              Event Calendar
            </h2>
            <p className="text-slate-600 dark:text-white/70 mt-2">
              Select a day to see {theme.label} events and available slots.
            </p>
          </div>
        )}

        <div
          className={`grid grid-cols-1 gap-6 ${embedded ? 'lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch text-white' : 'lg:grid-cols-[1.2fr_1fr] items-start'}`}
        >
          <div
            className={`rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131d26] p-4 md:p-5 ${
              embedded ? 'lg:h-[520px]' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="rounded-md border border-slate-300 dark:border-white/15 px-3 py-1.5 text-sm font-bold text-slate-700 dark:text-white"
              >
                Prev
              </button>
              <p className="text-lg font-black text-slate-900 dark:text-white">
                {getMonthLabel(viewYear, viewMonth - 1)}
              </p>
              <button
                type="button"
                onClick={goToNextMonth}
                className="rounded-md border border-slate-300 dark:border-white/15 px-3 py-1.5 text-sm font-bold text-slate-700 dark:text-white"
              >
                Next
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center mb-2">
              {weekDays.map((item) => (
                <div key={item} className="text-[11px] md:text-xs font-bold text-slate-500 dark:text-white/60">
                  {item}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: leadingEmptyCells }).map((_, idx) => (
                <div key={`empty-${idx}`} className={`${embedded ? 'h-10 md:h-11' : 'h-12 md:h-14'} rounded-md bg-transparent`}></div>
              ))}

              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const isoDate = toISODate(new Date(viewYear, viewMonth - 1, day));
                const hasEvent = datesWithEvents.has(isoDate);
                const isActive = isoDate === activeDate;
                const isPastDate = isoDate < todayIsoDate;

                return (
                  <button
                    key={isoDate}
                    type="button"
                    onClick={() => {
                      if (!isPastDate) {
                        setActiveDate(isoDate);
                      }
                    }}
                    disabled={isPastDate}
                    className={`${embedded ? 'h-10 md:h-11' : 'h-12 md:h-14'} rounded-md border text-sm font-bold relative ${
                      embedded ? 'text-white' : ''
                    } ${isPastDate ? 'opacity-45 cursor-not-allowed' : ''}`}
                    style={
                      isPastDate
                        ? {
                            borderColor: 'rgba(148,163,184,0.22)',
                            color: embedded ? 'rgba(226,232,240,0.5)' : 'rgba(51,65,85,0.55)'
                          }
                        : isActive
                          ? { borderColor: theme.accent, backgroundColor: theme.accentSoft, color: theme.accent }
                          : {
                              borderColor: 'rgba(148,163,184,0.35)',
                              color: embedded ? 'rgba(226,232,240,0.9)' : '#334155'
                            }
                    }
                  >
                    {day}
                    {hasEvent && (
                      <span
                        className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: '#facc15' }}
                      ></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className={`rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131d26] p-5 ${
              embedded ? 'lg:h-[520px] lg:overflow-y-auto lg:pr-3' : ''
            }`}
          >
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {formatISODateLabel(activeDate)}
            </h3>
            <p className="text-sm mt-1" style={{ color: theme.accent }}>
              {theme.label} schedule
            </p>

            <div className="mt-4 space-y-3">
              {eventsLoadError && (
                <div className="rounded-xl border border-red-300/30 px-4 py-3 text-sm text-red-300 bg-red-500/10">
                  {eventsLoadError}
                </div>
              )}

              {isEventsLoading && (
                <div className="rounded-xl border border-dashed border-slate-300 dark:border-white/20 px-4 py-6 text-center">
                  <p className="text-slate-600 dark:text-white/70 text-sm font-medium">
                    Loading events...
                  </p>
                </div>
              )}

              {!isEventsLoading && selectedDayEvents.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 dark:border-white/20 px-4 py-6 text-center">
                  <p className="text-slate-600 dark:text-white/70 text-sm font-medium">
                    No event published for this day.
                  </p>
                </div>
              )}

              {selectedDayEvents.length > 0 && (
                <>
                  <div className="space-y-2">
                    {selectedDayEvents.map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => setSelectedEventId(event.id)}
                        className="w-full rounded-xl border p-3 text-left"
                        style={
                          selectedEvent?.id === event.id
                            ? { borderColor: theme.accent, backgroundColor: `${theme.accent}18` }
                            : { borderColor: 'rgba(148,163,184,0.25)' }
                        }
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-slate-900 dark:text-white">{event.title}</p>
                          <span className="text-xs font-bold" style={{ color: theme.accent }}>
                            {event.time}
                          </span>
                        </div>
                        <p className="text-xs mt-1 text-slate-600 dark:text-white/70">{event.summary}</p>
                      </button>
                    ))}
                  </div>

                  {selectedEvent && (
                    <>
                      {(() => {
                        const detailLines = parseEventDetailsLines(selectedEvent.details);
                        return (
                      <article className="rounded-xl border border-slate-200 dark:border-white/10 p-4 bg-slate-50 dark:bg-[#0f1922] text-left">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-bold text-slate-900 dark:text-white">{selectedEvent.title}</h4>
                          <span
                            className="rounded-full px-2.5 py-1 text-xs font-bold"
                            style={{ color: theme.accent, backgroundColor: theme.accentSoft }}
                          >
                            {selectedEvent.time}
                          </span>
                        </div>
                        <p className="mt-2 text-left text-sm text-slate-600 dark:text-white/70">{selectedEvent.summary}</p>
                        {detailLines.length > 0 && (
                          <div className="mt-2 space-y-1.5 text-left text-sm text-slate-600 dark:text-white/80">
                            {detailLines.map((line) => (
                              <p key={`${selectedEvent.id}-${line}`} className="leading-relaxed text-left">
                                {line}
                              </p>
                            ))}
                          </div>
                        )}
                        <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                          <span className="text-slate-700 dark:text-white/80">Duration: {selectedEvent.durationHours}h</span>
                          <span className="text-slate-700 dark:text-white/80">
                            Seats: {selectedEvent.capacity - selectedEvent.booked}/{selectedEvent.capacity}
                          </span>
                          <span className="font-bold text-right" style={{ color: theme.accent }}>
                            EUR {selectedEvent.price}
                          </span>
                        </div>
                      </article>
                        );
                      })()}

                      <div className="rounded-xl border border-slate-200 dark:border-white/10 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide mb-2 text-slate-500 dark:text-white/60">
                          Service Route
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          {selectedEvent.serviceStops.map((stop, idx) => (
                            <React.Fragment key={stop}>
                              <span className="rounded-md bg-slate-100 dark:bg-[#0f1922] px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-white/85">
                                {stop}
                              </span>
                              {idx < selectedEvent.serviceStops.length - 1 && (
                                <span className="text-slate-400 text-xs">---</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>

                      <form className="rounded-xl border border-slate-200 dark:border-white/10 p-4 space-y-3" onSubmit={handleReservationSubmit}>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Complete Reservation</p>

                        <div className="grid grid-cols-1 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-white/60">
                              Pickup Stop
                            </label>
                            <select
                              name="pickupStop"
                              value={reservationForm.pickupStop}
                              onChange={handleFormChange}
                              className="w-full rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-[#16202a] px-3 py-2 text-slate-900 dark:text-white"
                            >
                              {selectedEvent.serviceStops.map((stop) => (
                                <option key={stop} value={stop}>{stop}</option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-white/60">
                                Participants
                              </label>
                              <input
                                type="number"
                                min={1}
                                max={selectedEvent.capacity - selectedEvent.booked}
                                name="participants"
                                value={reservationForm.participants}
                                onChange={handleFormChange}
                                className="w-full rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-[#16202a] px-3 py-2 text-slate-900 dark:text-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-white/60">
                                Total
                              </label>
                              <div className="h-[42px] rounded-lg border border-slate-300 dark:border-white/15 px-3 flex items-center font-bold" style={{ color: theme.accent }}>
                                TRY {selectedEvent.price * (Number(reservationForm.participants) || 0)}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-white/60">
                              Full Name
                            </label>
                            <input
                              type="text"
                              name="fullName"
                              value={reservationForm.fullName}
                              onChange={handleFormChange}
                              placeholder="Name Surname"
                              className="w-full rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-[#16202a] px-3 py-2 text-slate-900 dark:text-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-white/60">
                              Email
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={reservationForm.email}
                              onChange={handleFormChange}
                              placeholder="name@example.com"
                              className="w-full rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-[#16202a] px-3 py-2 text-slate-900 dark:text-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-white/60">
                              Hotel Name (Optional)
                            </label>
                            <input
                              type="text"
                              name="hotelName"
                              value={reservationForm.hotelName}
                              onChange={handleFormChange}
                              placeholder="e.g. Rixos Sungate"
                              className="w-full rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-[#16202a] px-3 py-2 text-slate-900 dark:text-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-white/60">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              name="phone"
                              value={reservationForm.phone}
                              onChange={handleFormChange}
                                placeholder="+90 5xx xxx xx xx"
                                className="w-full rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-[#16202a] px-3 py-2 text-slate-900 dark:text-white"
                              />
                            </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-white/60">
                              Referral Code (Optional)
                            </label>
                            <input
                              type="text"
                              name="referralCode"
                              value={reservationForm.referralCode}
                              onChange={handleFormChange}
                              placeholder="GYE-XXXXXX"
                              className="w-full rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-[#16202a] px-3 py-2 text-slate-900 dark:text-white uppercase"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsAgreementOpen(true)}
                          className="w-full rounded-lg border border-slate-200/70 dark:border-white/10 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-white/80 hover:border-slate-300"
                        >
                          Read Distance Sales & Service Agreement (KVKK)
                        </button>

                        <label className="flex items-start gap-3 rounded-lg border border-slate-200/60 dark:border-white/10 bg-slate-50/70 dark:bg-[#0f1922] px-3 py-2 text-xs text-slate-600 dark:text-white/70">
                          <input
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            className="mt-0.5 size-4 rounded border-slate-300 text-[#1183d4] focus:ring-[#1183d4]"
                          />
                          <span>
                            I have read and accept the Distance Sales and Service Agreement.
                          </span>
                        </label>

                        <label className="flex items-start gap-3 rounded-lg border border-slate-200/60 dark:border-white/10 bg-slate-50/70 dark:bg-[#0f1922] px-3 py-2 text-xs text-slate-600 dark:text-white/70">
                          <input
                            type="checkbox"
                            checked={kvkkAccepted}
                            onChange={(e) => setKvkkAccepted(e.target.checked)}
                            className="mt-0.5 size-4 rounded border-slate-300 text-[#1183d4] focus:ring-[#1183d4]"
                          />
                          <span>
                            I have read and understood the Personal Data Protection Information Notice.
                          </span>
                        </label>

                        <button
                          type="submit"
                          disabled={isSubmitting || !termsAccepted || !kvkkAccepted}
                          className="w-full rounded-lg text-white font-bold py-2.5 disabled:opacity-60"
                          style={{ backgroundColor: theme.accent }}
                        >
                          {isSubmitting ? 'Redirecting to Payment...' : 'Pay & Complete Reservation'}
                        </button>

                        {generatedTicket && (
                          <div className="space-y-2">
                            <p className="rounded-lg border border-sky-300/35 bg-sky-400/10 px-3 py-2 text-xs font-medium text-sky-200">
                              Odeme bilgileri mail olarak tarafiniza iletilecektir ve rezervasyon isleminiz tamamlanacaktir.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={downloadTicketImage}
                                className="w-full inline-flex items-center justify-center rounded-lg border font-bold py-2.5"
                                style={{ borderColor: theme.accent, color: theme.accent }}
                              >
                                Download QR Image
                              </button>
                              <button
                                type="button"
                                onClick={downloadTicketPdf}
                                className="w-full inline-flex items-center justify-center rounded-lg border font-bold py-2.5"
                                style={{ borderColor: theme.accent, color: theme.accent }}
                              >
                                Download PDF
                              </button>
                            </div>
                          </div>
                        )}
                      </form>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {isAgreementOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#0f1922] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
              <h4 className="text-sm font-bold text-white">
                {agreementLang === 'tr'
                  ? 'Mesafeli Satış ve Hizmet Sözleşmesi'
                  : 'Distance Sales & Service Agreement'}
              </h4>
              <button
                type="button"
                onClick={() => setIsAgreementOpen(false)}
                className="rounded-full border border-white/20 px-2 py-1 text-xs text-white/70 hover:text-white"
              >
                {agreementLang === 'tr' ? 'Kapat' : 'Close'}
              </button>
            </div>
            <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3">
              <div className="inline-flex rounded-full border border-white/15 bg-black/30 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setAgreementLang('tr')}
                  className={`rounded-full px-3 py-1 font-semibold ${
                    agreementLang === 'tr' ? 'bg-white text-slate-900' : 'text-white/70'
                  }`}
                >
                  Türkçe
                </button>
                <button
                  type="button"
                  onClick={() => setAgreementLang('en')}
                  className={`rounded-full px-3 py-1 font-semibold ${
                    agreementLang === 'en' ? 'bg-white text-slate-900' : 'text-white/70'
                  }`}
                >
                  English
                </button>
              </div>
              <span className="text-[11px] text-white/50">Swipe to switch language</span>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
              <pre className="whitespace-pre-wrap text-left text-xs leading-relaxed text-white/80">
                {agreementLang === 'tr' ? agreementTextTr : agreementTextEn}
              </pre>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-white/10 px-5 py-3">
              <button
                type="button"
                onClick={() => setIsAgreementOpen(false)}
                className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/80 hover:text-white"
              >
                {agreementLang === 'tr' ? 'Kapat' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default EventCalendarPanel;
