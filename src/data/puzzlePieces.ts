import { PuzzlePiece } from '../types';
import { STEM_ARTWORK_URL } from './stemArtwork';

// 9 pieces matching the 3x3 jigsaw grid for the official STEM mystery puzzle
export const DEFAULT_PUZZLE_PIECES: PuzzlePiece[] = [
  {
    id: 1,
    position: 1,
    unlocked: false,
    label: 'Chữ S màu cam & Mô hình nguyên tử (Góc trên trái)',
    imageUrl: STEM_ARTWORK_URL
  },
  {
    id: 2,
    position: 2,
    unlocked: false,
    label: 'Chữ T màu xanh lá & Mũi tên vươn cao (Mép trên)',
    imageUrl: STEM_ARTWORK_URL
  },
  {
    id: 3,
    position: 3,
    unlocked: false,
    label: 'Chữ E xanh dương & Chữ M vàng có thước đo (Góc trên phải)',
    imageUrl: STEM_ARTWORK_URL
  },
  {
    id: 4,
    position: 4,
    unlocked: false,
    label: 'Huy hiệu SCIENCE - Bình thí nghiệm hóa học (Mép trái)',
    imageUrl: STEM_ARTWORK_URL
  },
  {
    id: 5,
    position: 5,
    unlocked: false,
    label: 'Huy hiệu TECHNOLOGY - Chảo ăng-ten vệ tinh (Trung tâm)',
    imageUrl: STEM_ARTWORK_URL
  },
  {
    id: 6,
    position: 6,
    unlocked: false,
    label: 'Huy hiệu ENGINEERING - Cụm bánh răng cơ khí (Mép phải)',
    imageUrl: STEM_ARTWORK_URL
  },
  {
    id: 7,
    position: 7,
    unlocked: false,
    label: 'Chân bình thí nghiệm & Chữ SCIENCE đỏ (Góc dưới trái)',
    imageUrl: STEM_ARTWORK_URL
  },
  {
    id: 8,
    position: 8,
    unlocked: false,
    label: 'Huy hiệu MATHEMATICS - Máy tính bỏ túi số (Mép dưới)',
    imageUrl: STEM_ARTWORK_URL
  },
  {
    id: 9,
    position: 9,
    unlocked: false,
    label: 'Bàn phím máy tính số & Chữ MATHEMATICS vàng (Góc dưới phải)',
    imageUrl: STEM_ARTWORK_URL
  }
];

