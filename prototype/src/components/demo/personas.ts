import type { UserId } from '../../lib/domain/types';

/**
 * Demo giriş ekranında sunulan personalar.
 * ⚠️ Kimlik doğrulama değildir — backend yok. Bu liste yalnızca prototipin
 * hangi kullanıcı gözüyle test edileceğini seçtirir.
 */
export interface Persona {
  id: UserId;
  color: string;
  /** Bu personayla neyin test edilebileceği */
  can: string;
}

export const PERSONAS: Persona[] = [
  {
    id: 'usr_deniz', color: '#0058B8',
    can: 'Etkinlik oluştur, oda ayır, takvim paylaş. Onay gerektiren oda seçince talep gönderir.',
  },
  {
    id: 'usr_zeynep', color: '#177066',
    can: 'Boğaziçi odasının onaylayıcısı. Deniz’in Kick-off talebini onaylayabilir veya reddedebilir.',
  },
  {
    id: 'usr_ahmet', color: '#A83E69',
    can: 'Topkapı odasının onaylayıcısı. Mert’in Ürün Roadmap talebi onayını bekliyor.',
  },
  {
    id: 'usr_mert', color: '#7A3E9D',
    can: 'Paylaşan taraf. “Ürün” takvimini Deniz ile paylaşmış; paylaşımı yönetebilir.',
  },
];

/** Giriş ekranındaki kısa tur — DEMO-GUIDE.md'nin özeti. */
export const TEST_STEPS = [
  'Hafta oklarıyla gezin, **Bugün** ile geri dönün. Bir etkinliğin üzerinde bekleyin — önizleme kartı açılır.',
  'Boş bir saate tıklayın, hızlı oluşturmadan detaylı forma geçin, katılımcı ekleyin.',
  '**Oda seç** deyin: dolu, yetkisiz ve onay gerektiren odalar aynı listede farklı davranır.',
  'Onay gerektiren odayı seçip kaydedin — etkinlik “onay bekliyor” olarak ızgarada görünür.',
  'Sol alttan **Zeynep Aksoy**’a geçip Talepler’den onaylayın, sonra takvimde rezerve olduğunu görün.',
];
