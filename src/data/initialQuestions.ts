import { Question } from '../types';

export const INITIAL_STEM_QUESTIONS: Question[] = [
  {
    id: 'q1',
    content: 'Trong hệ Mặt Trời, hành tinh nào được mệnh danh là "Hành tinh Đỏ" vì bề mặt chứa nhiều oxit sắt?',
    options: {
      A: 'Sao Kim (Venus)',
      B: 'Sao Hỏa (Mars)',
      C: 'Sao Mộc (Jupiter)',
      D: 'Sao Thủy (Mercury)'
    },
    correctOption: 'B',
    subject: 'Thiên văn học & STEM Vũ trụ',
    explanation: 'Sao Hỏa có màu đỏ cam đặc trưng do bề mặt chứa rất nhiều khoáng chất sắt bị oxy hóa (gỉ sắt).'
  },
  {
    id: 'q2',
    content: 'Cây xanh hấp thụ khí nào sau đây từ không khí để thực hiện quá trình quang hợp tạo ra thức ăn và khí oxy?',
    options: {
      A: 'Khí Cacbonic (CO2)',
      B: 'Khí Nitơ (N2)',
      C: 'Khí Heli (He)',
      D: 'Khí Metan (CH4)'
    },
    correctOption: 'A',
    subject: 'Sinh học & Môi trường',
    explanation: 'Nhờ có chất diệp lục và ánh sáng mặt trời, lá cây hấp thụ khí Cacbonic và nước để tạo thành tinh bột và giải phóng khí Oxy.'
  },
  {
    id: 'q3',
    content: 'Thiết bị nào sau đây dùng để quan sát những vật thể siêu nhỏ như vi khuẩn, tế bào mà mắt thường không nhìn thấy?',
    options: {
      A: 'Kính viễn vọng',
      B: 'Kính tiềm vọng',
      C: 'Kính hiển vi',
      D: 'Kính lúp cầm tay cỡ lớn'
    },
    correctOption: 'C',
    subject: 'Khoa học thực nghiệm',
    explanation: 'Kính hiển vi có thể phóng to hình ảnh lên hàng trăm đến hàng nghìn lần, giúp chúng ta nhìn rõ tế bào vi sinh.'
  },
  {
    id: 'q4',
    content: 'Nước bắt đầu chuyển từ thể lỏng sang thể hơi (sôi) ở điều kiện áp suất tiêu chuẩn là bao nhiêu độ C?',
    options: {
      A: '50°C',
      B: '80°C',
      C: '100°C',
      D: '120°C'
    },
    correctOption: 'C',
    subject: 'Vật lý & Hóa học',
    explanation: 'Ở áp suất khí quyển tiêu chuẩn, nước nguyên chất sôi và bốc hơi mạnh ở 100 độ C và đóng băng ở 0 độ C.'
  },
  {
    id: 'q5',
    content: 'Bộ phận nào trong máy tính được coi là "bộ não" thực hiện tính toán và điều khiển mọi hoạt động của hệ thống?',
    options: {
      A: 'Màn hình (Monitor)',
      B: 'Bộ xử lý trung tâm (CPU)',
      C: 'Bàn phím (Keyboard)',
      D: 'Chuột máy tính (Mouse)'
    },
    correctOption: 'B',
    subject: 'Công nghệ & Tin học',
    explanation: 'CPU (Central Processing Unit) là bộ vi xử lý đóng vai trò như bộ não, tiếp nhận và xử lý hàng tỷ phép tính mỗi giây.'
  },
  {
    id: 'q6',
    content: 'Loài chim cánh cụt sống chủ yếu ở vùng cực nào của Trái Đất?',
    options: {
      A: 'Bắc Cực',
      B: 'Nam Cực',
      C: 'Đường Xích Đạo',
      D: 'Rừng nhiệt đới Amazon'
    },
    correctOption: 'B',
    subject: 'Tự nhiên & Trái Đất',
    explanation: 'Hầu hết các loài chim cánh cụt sống tại Nam Bán Cầu, đặc biệt là quanh vùng băng giá Nam Cực.'
  },
  {
    id: 'q7',
    content: 'Cây cầu dây văng hoặc cầu treo giữ được sự cân bằng vững chãi là nhờ nguyên lý nào trong kỹ thuật STEM?',
    options: {
      A: 'Sức căng của dây cáp và lực nén của trụ cầu',
      B: 'Chỉ nhờ nam châm hút chặt',
      C: 'Nhờ vào sức đẩy của gió',
      D: 'Chỉ nhờ lớp sơn chống nước'
    },
    correctOption: 'A',
    subject: 'Kỹ thuật Xây dựng',
    explanation: 'Cầu dây văng truyền tải trọng lượng của mặt cầu và xe cộ qua các dây cáp chịu lực căng xuống các trụ tháp chịu lực nén cắm sâu xuống đất.'
  },
  {
    id: 'q8',
    content: 'Nguồn năng lượng nào sau đây là nguồn năng lượng tái tạo sạch, vô tận và thân thiện với môi trường?',
    options: {
      A: 'Than đá',
      B: 'Dầu mỏ',
      C: 'Năng lượng ánh sáng Mặt Trời',
      D: 'Khí đốt tự nhiên'
    },
    correctOption: 'C',
    subject: 'Năng lượng Xanh',
    explanation: 'Năng lượng Mặt Trời, gió và thủy triều là những nguồn năng lượng tái tạo tự nhiên, không gây phát thải khí nhà kính độc hại.'
  },
  {
    id: 'q9',
    content: 'Robot tự hành Rover trên Sao Hỏa (như Perseverance hay Curiosity) di chuyển bằng bao nhiêu bánh xe?',
    options: {
      A: '2 bánh',
      B: '4 bánh',
      C: '6 bánh',
      D: '8 bánh'
    },
    correctOption: 'C',
    subject: 'Robotics & Vũ trụ',
    explanation: 'Các xe tự hành của NASA dùng hệ thống 6 bánh rocker-bogie giúp leo qua các tảng đá gập ghềnh mà không bị lật.'
  },
  {
    id: 'q10',
    content: 'Âm thanh không thể truyền đi qua môi trường nào sau đây?',
    options: {
      A: 'Chân không ngoài vũ trụ',
      B: 'Nước biển',
      C: 'Không khí',
      D: 'Thanh sắt'
    },
    correctOption: 'A',
    subject: 'Vật lý Sóng âm',
    explanation: 'Âm thanh là sóng cơ học cần có các phân tử vật chất để dao động và truyền đi. Trong chân không không có hạt vật chất nên sóng âm không thể truyền được.'
  },
  {
    id: 'q11',
    content: 'Ong mật thu thập mật hoa và phấn hoa từ các bông hoa, đồng thời giúp cây thực hiện điều gì rất quan trọng?',
    options: {
      A: 'Làm mát rễ cây',
      B: 'Thụ phấn để tạo hoa kết quả',
      C: 'Làm cây mọc lá nhanh hơn',
      D: 'Tưới nước cho cây'
    },
    correctOption: 'B',
    subject: 'Hệ sinh thái & Đa dạng sinh học',
    explanation: 'Khi bay từ hoa này sang hoa khác, hạt phấn dính trên cơ thể ong giúp cây thụ phấn, giúp duy trì mùa màng và cây xanh trên Trái Đất.'
  },
  {
    id: 'q12',
    content: 'Trong toán học và lập trình, một hình đa giác đều có 6 cạnh bằng nhau và 6 góc bằng nhau gọi là hình gì?',
    options: {
      A: 'Hình ngũ giác đều',
      B: 'Hình lục giác đều',
      C: 'Hình bát giác đều',
      D: 'Hình thoi'
    },
    correctOption: 'B',
    subject: 'Toán học & Hình học tự nhiên',
    explanation: 'Lục giác (lục = 6) có 6 cạnh đều. Đây cũng chính là cấu trúc siêu bền vững tự nhiên của tổ ong và tinh thể tuyết!'
  }
];
