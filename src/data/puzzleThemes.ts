import { COMPUTER_LAB_ARTWORK_URL } from './computerLabArt';
import { STEM_ARTWORK_URL, STEM_THEME_TITLE } from './stemArtwork';

// Master puzzle artworks for the Jigsaw Puzzle Board

export interface PuzzleTheme {
  id: string;
  title: string;
  artistOrTopic: string;
  description: string;
  imageUrl: string;
  previewThumbnail?: string;
  pieceLabels: string[];
}

// Renoir's Bal du moulin de la Galette
const RENOIR_IMAGE_URL =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Pierre-Auguste_Renoir%2C_Le_Moulin_de_la_Galette.jpg/1280px-Pierre-Auguste_Renoir%2C_Le_Moulin_de_la_Galette.jpg';

// Van Gogh's The Starry Night
const STARRY_NIGHT_URL =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg';

// STEM Space & Solar System Exploration
const SPACE_STEM_URL =
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop';

// STEM Robotics & AI World
const ROBOTICS_STEM_URL =
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1200&auto=format&fit=crop';

export const PUZZLE_THEMES: PuzzleTheme[] = [
  {
    id: 'stem-mystery-main',
    title: STEM_THEME_TITLE,
    artistOrTopic: 'Khoa học (Science), Công nghệ (Technology), Kỹ thuật (Engineering) & Toán học (Mathematics)',
    description: 'Bức tranh chính thức STEM với chữ nghệ thuật rực rỡ và 4 huy hiệu khoa học: Bình thí nghiệm hóa học (Science), Chảo ăng-ten vệ tinh (Technology), Bánh răng cơ khí (Engineering) và Máy tính cầm tay (Mathematics).',
    imageUrl: STEM_ARTWORK_URL,
    pieceLabels: [
      'Mảnh 1: Chữ S màu cam (Mô hình hạt nhân nguyên tử) & góc trên bên trái',
      'Mảnh 2: Chữ T màu xanh lá (Mũi tên vươn cao) & các chấm liên kết',
      'Mảnh 3: Chữ E màu xanh dương (Bánh răng) & Chữ M vàng (Thước kẻ đo)',
      'Mảnh 4: Huy hiệu SCIENCE (Bình hóa học tam giác chứa dung dịch tím sủi bọt)',
      'Mảnh 5: Huy hiệu TECHNOLOGY (Chảo ăng-ten vệ tinh thu phát sóng)',
      'Mảnh 6: Huy hiệu ENGINEERING (Cụm bánh răng cơ khí công nghiệp)',
      'Mảnh 7: Huy hiệu MATHEMATICS (Máy tính kỹ thuật số bỏ túi & phím số)',
      'Mảnh 8: Thước đo centimet trên chân chữ M & Chữ MATHEMATICS vàng',
      'Mảnh 9: Khung chữ định danh chuyên đề STEM hoàn chỉnh'
    ]
  },
  {
    id: 'future-computer-lab',
    title: 'Phòng thực hành Tin học tương lai',
    artistOrTopic: 'Không gian Sáng tạo & Lớp học STEM FPT Schools',
    description: 'Bức tranh sống động mô tả phòng tin học hiện đại với biểu ngữ vui nhộn, màn hình tương tác thân thiện, robot thông minh và các bạn trẻ say mê công nghệ.',
    imageUrl: COMPUTER_LAB_ARTWORK_URL,
    pieceLabels: [
      'Góc trên trái: Biểu trưng STEM LAB & dải đèn LED',
      'Mép trên: Biểu ngữ PHÒNG TIN HỌC VUI NHỘN rực rỡ',
      'Góc trên phải: Khung vòm công nghệ & slogan Sáng tạo',
      'Mép trái: Bạn Robot Buddy thông minh vẫy tay chào',
      'Trung tâm: Màn hình máy tính với nụ cười số thân thiện',
      'Mép phải: Người bạn nhỏ đội mũ ngôi sao chăm chú học tập',
      'Góc dưới trái: Bàn phím cơ khí & linh kiện robot',
      'Mép dưới: Bàn phím đèn LED RGB đa sắc màu',
      'Góc dưới phải: Chuột quang và góc bàn thực hành'
    ]
  },
  {
    id: 'renoir-galette',
    title: 'Bal du moulin de la Galette (1876)',
    artistOrTopic: 'Pierre-Auguste Renoir (Kiệt tác Hội họa Ấn tượng)',
    description: 'Bức danh họa kinh điển của danh họa Renoir mô tả buổi khiêu vũ rộn rã tràn ngập ánh nắng tại Paris.',
    imageUrl: RENOIR_IMAGE_URL,
    pieceLabels: [
      'Góc tranh khiêu vũ trên cao bên trái',
      'Những chiếc đèn lồng & tán cây ánh sáng',
      'Đôi bạn trẻ đang trò chuyện vui vẻ',
      'Góc phố Montmartre Paris cổ kính',
      'Nhóm người quây quần bên bàn tiệc',
      'Cặp đôi đang say sưa khiêu vũ trung tâm',
      'Nụ cười thiếu nữ bên trang phục dạ hội',
      'Góc sân khấu và sàn khiêu vũ ngoài trời',
      'Góc dưới bên phải sàn khiêu vũ ngoài trời'
    ]
  },
  {
    id: 'stem-space',
    title: 'Khám phá Vũ trụ & Hệ Mặt Trời STEM',
    artistOrTopic: 'Khoa học Không gian & Thiên văn học',
    description: 'Hành trình các nhà du hành vũ trụ nhí khám phá các vì sao, hố đen và dải ngân hà kỳ thú.',
    imageUrl: SPACE_STEM_URL,
    pieceLabels: [
      'Tinh vân rực rỡ và các vì sao xa',
      'Trạm vũ trụ quốc tế ISS quỹ đạo',
      'Kính viễn vọng không gian James Webb',
      'Dải Ngân hà Milky Way huyền bí',
      'Hành tinh Sao Hỏa và tàu thám hiểm Rover',
      'Trái Đất xanh nhìn từ quỹ đạo không gian',
      'Vòng đai lấp lánh của Sao Thổ',
      'Tàu thám hiểm Apollo hạ cánh Mặt Trăng'
    ]
  },
  {
    id: 'stem-robotics',
    title: 'Thế giới Robot & Tự động hóa thông minh',
    artistOrTopic: 'Kỹ thuật & Công nghệ Tương lai',
    description: 'Bức tranh về những người bạn Robot thông minh hỗ trợ con người trong phòng thí nghiệm STEM.',
    imageUrl: ROBOTICS_STEM_URL,
    pieceLabels: [
      'Bộ vi xử lý siêu tốc Quantum Core',
      'Mắt thần cảm biến quang học & Thị giác máy tính',
      'Cánh tay robot cơ khí chính xác cao',
      'Mạng lưới xử lý dữ liệu số Network',
      'Bánh đà năng lượng xanh sạch thân thiện',
      'Giao diện điều khiển Hologram tương tác',
      'Bộ giải thuật lập trình tự động hóa',
      'Trái tim năng lượng công nghệ tương lai'
    ]
  },
  {
    id: 'starry-night',
    title: 'Đêm đầy sao - The Starry Night (1889)',
    artistOrTopic: 'Vincent van Gogh (Hội họa Hậu Ấn tượng)',
    description: 'Bức họa nổi tiếng thế giới của Van Gogh với những vòng xoáy bầu trời đêm kỳ ảo và ánh trăng vàng rực rỡ.',
    imageUrl: STARRY_NIGHT_URL,
    pieceLabels: [
      'Cây bách đen vút cao huyền bí',
      'Vòng xoáy bầu trời đêm cuồn cuộn',
      'Ánh trăng lưỡi liềm vàng rực rỡ',
      'Chùm sao đêm tỏa sáng lấp lánh',
      'Ngọn tháp chuông nhà thờ Saint-Rémy',
      'Những mái nhà làng quê êm đềm trong đêm',
      'Những rặng đồi nhấp nhô dưới ánh sao',
      'Mặt đất tĩnh lặng dưới bầu trời thi ca'
    ]
  }
];

export const DEFAULT_PUZZLE_THEME = PUZZLE_THEMES[0]; // Renoir's Bal du moulin de la Galette
