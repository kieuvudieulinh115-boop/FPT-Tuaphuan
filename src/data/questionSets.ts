import { QuestionSet } from '../types';
import { INITIAL_STEM_QUESTIONS } from './initialQuestions';

export const DEFAULT_QUESTION_SETS: QuestionSet[] = [
  {
    id: 'set_lop3_tinhoc',
    title: 'Tin học Lớp 3 - Khám phá máy tính & thao tác cơ bản',
    gradeBadge: 'Lớp 3',
    category: 'Tin học & Thao tác máy tính',
    description: 'Tìm hiểu các bộ phận cơ bản của máy tính, cách cầm chuột và tư thế ngồi chuẩn công thái học.',
    isSaved: true,
    createdAt: 1715000000000,
    questions: [
      {
        id: 'th3_1',
        content: 'Một máy tính để bàn thông thường gồm có mấy bộ phận cơ bản?',
        options: {
          A: '2 bộ phận (Màn hình và chuột)',
          B: '3 bộ phận (Màn hình, bàn phím, chuột)',
          C: '4 bộ phận (Thân máy, màn hình, bàn phím, chuột)',
          D: '5 bộ phận (Thân máy, màn hình, bàn phím, chuột, loa)'
        },
        correctOption: 'C',
        subject: 'Tin học Lớp 3',
        explanation: 'Máy tính để bàn gồm 4 bộ phận chính: Thân máy (CPU), Màn hình, Bàn phím và Chuột.'
      },
      {
        id: 'th3_2',
        content: 'Bộ phận nào của máy tính có chức năng hiển thị kết quả làm việc, hình ảnh và video cho em xem?',
        options: {
          A: 'Bàn phím',
          B: 'Màn hình máy tính',
          C: 'Thân máy',
          D: 'Chuột máy tính'
        },
        correctOption: 'B',
        subject: 'Tin học Lớp 3',
        explanation: 'Màn hình là thiết bị xuất hiển thị văn bản, hình ảnh, video ra ngoài cho người dùng nhìn thấy.'
      },
      {
        id: 'th3_3',
        content: 'Bộ phận nào chứa "bộ não" của máy tính để xử lý mọi dữ liệu và chỉ thị?',
        options: {
          A: 'Thân máy (chứa bộ xử lý CPU)',
          B: 'Màn hình',
          C: 'Bàn phím',
          D: 'Con chuột'
        },
        correctOption: 'A',
        subject: 'Tin học Lớp 3',
        explanation: 'Thân máy chứa bộ vi xử lý (CPU) và bộ nhớ, đóng vai trò đầu não tiếp nhận và xử lý thông tin.'
      },
      {
        id: 'th3_4',
        content: 'Chuột máy tính thường có những nút bấm cơ bản nào?',
        options: {
          A: 'Chỉ có 1 nút bấm duy nhất',
          B: 'Nút trái, nút phải và bánh lăn ở giữa',
          C: 'Nút nguồn và nút âm lượng',
          D: '10 phím số'
        },
        correctOption: 'B',
        subject: 'Tin học Lớp 3',
        explanation: 'Chuột máy tính tiêu chuẩn có nút chuột trái, nút chuột phải và nút cuộn (bánh lăn) ở giữa.'
      },
      {
        id: 'th3_5',
        content: 'Khi sử dụng chuột, ngón tay trỏ của bàn tay phải thường được đặt lên nút nào?',
        options: {
          A: 'Nút chuột trái',
          B: 'Nút chuột phải',
          C: 'Bánh lăn',
          D: 'Thân chuột'
        },
        correctOption: 'A',
        subject: 'Tin học Lớp 3',
        explanation: 'Ngón trỏ đặt lên nút chuột trái, ngón giữa đặt lên nút chuột phải để thao tác tự nhiên nhất.'
      },
      {
        id: 'th3_6',
        content: 'Thao tác nhấn nhanh nút chuột trái hai lần liên tiếp rồi thả tay ra được gọi là gì?',
        options: {
          A: 'Nháy chuột',
          B: 'Kéo thả chuột',
          C: 'Nháy đúp chuột (Double click)',
          D: 'Nháy nút phải chuột'
        },
        correctOption: 'C',
        subject: 'Tin học Lớp 3',
        explanation: 'Nháy đúp chuột (Double-click) thường dùng để mở một tệp, phần mềm hoặc thư mục trên màn hình nền.'
      },
      {
        id: 'th3_7',
        content: 'Tư thế ngồi học máy tính nào sau đây là đúng chuẩn để bảo vệ cột sống và mắt?',
        options: {
          A: 'Ngồi khom lưng, mắt nhìn thật sát màn hình',
          B: 'Lưng thẳng, mắt nhìn ngang tầm màn hình cách khoảng 50 - 80cm',
          C: 'Nằm dài ra bàn khi gõ phím',
          D: 'Vắt chéo chân và tựa sát vào màn hình'
        },
        correctOption: 'B',
        subject: 'Tin học Lớp 3',
        explanation: 'Ngồi thẳng lưng, hai bàn chân chạm sàn và giữ khoảng cách màn hình 50-80cm giúp tránh mỏi mắt và gù lưng.'
      },
      {
        id: 'th3_8',
        content: 'Để tắt máy tính đúng cách và an toàn, em nên thực hiện thao tác nào?',
        options: {
          A: 'Rút phích cắm điện ngay lập tức',
          B: 'Bấm nút Start -> chọn nút Nguồn (Power) -> chọn Shut down',
          C: 'Nhấn giữ nút nguồn trên thân máy trong 10 giây',
          D: 'Chỉ cần tắt công tắc màn hình'
        },
        correctOption: 'B',
        subject: 'Tin học Lớp 3',
        explanation: 'Tắt máy qua Start -> Shut down giúp hệ điều hành lưu lại các tiến trình và đóng các tệp an toàn trước khi tắt nguồn.'
      },
      {
        id: 'th3_9',
        content: 'Biểu tượng của phần mềm diệt virus hoặc thùng rác (Recycle Bin) nằm ở đâu trên máy tính?',
        options: {
          A: 'Bên trong bàn phím',
          B: 'Trên màn hình nền (Desktop)',
          C: 'Dưới gầm bàn làm việc',
          D: 'Trong dây cắm mạng'
        },
        correctOption: 'B',
        subject: 'Tin học Lớp 3',
        explanation: 'Màn hình nền (Desktop) là nơi hiển thị các biểu tượng (icon) của các tệp, thư mục và chương trình ứng dụng.'
      },
      {
        id: 'th3_10',
        content: 'Khi gặp sự cố máy tính bốc khói hoặc dây điện bị hở, hành động an toàn đầu tiên em cần làm là gì?',
        options: {
          A: 'Dùng tay không túm lấy dây điện để cắm lại',
          B: 'Đổ nước ngọt vào thân máy để dập lửa',
          C: 'Báo ngay cho thầy cô giáo hoặc người lớn xử lý an toàn',
          D: 'Tiếp tục ngồi chơi trò chơi'
        },
        correctOption: 'C',
        subject: 'Tin học Lớp 3',
        explanation: 'Luôn báo ngay cho giáo viên hoặc người lớn khi có sự cố điện để đảm bảo an toàn tuyệt đối.'
      }
    ]
  },
  {
    id: 'set_lop4_tep_thumuc',
    title: 'Tin học Lớp 4 - Tệp, Thư mục & Internet An Toàn',
    gradeBadge: 'Lớp 4',
    category: 'Tin học & An toàn Internet',
    description: 'Quản lý cây thư mục, tệp tin khoa học và quy tắc vàng khi sử dụng Internet an toàn cho người chơi.',
    isSaved: true,
    createdAt: 1715000001000,
    questions: [
      {
        id: 'th4_1',
        content: 'Trong máy tính, tệp (file) được dùng để làm gì?',
        options: {
          A: 'Chỉ để xem giờ quốc tế',
          B: 'Lưu trữ các thông tin như văn bản, hình ảnh, âm thanh, video',
          C: 'Làm mát thân máy tính',
          D: 'Thay thế pin của chuột'
        },
        correctOption: 'B',
        subject: 'Tin học Lớp 4',
        explanation: 'Tệp (file) là đơn vị lưu trữ dữ liệu thông tin trên bộ nhớ máy tính gồm tên tệp và phần mở rộng.'
      },
      {
        id: 'th4_2',
        content: 'Thư mục (Folder) trong máy tính thường có biểu tượng màu gì đặc trưng?',
        options: {
          A: 'Màu đen',
          B: 'Màu vàng hình chiếc kẹp tài liệu',
          C: 'Màu tím hình bông hoa',
          D: 'Màu đỏ hình dấu chéo'
        },
        correctOption: 'B',
        subject: 'Tin học Lớp 4',
        explanation: 'Hệ điều hành Windows biểu diễn thư mục dưới dạng hình chiếc kẹp tệp giấy màu vàng.'
      },
      {
        id: 'th4_3',
        content: 'Để tạo một thư mục mới trong cửa sổ File Explorer, em sử dụng tổ hợp phím tắt hoặc nút lệnh nào?',
        options: {
          A: 'Nhấn Ctrl + Shift + N hoặc nút New Folder',
          B: 'Nhấn phím Delete',
          C: 'Nhấn Alt + F4',
          D: 'Nhấn phím Space'
        },
        correctOption: 'A',
        subject: 'Tin học Lớp 4',
        explanation: 'Tổ hợp phím Ctrl + Shift + N giúp tạo nhanh thư mục mới trong thư mục hiện hành.'
      },
      {
        id: 'th4_4',
        content: 'Thao tác nào sau đây giúp em đổi tên một tệp hoặc thư mục đã chọn?',
        options: {
          A: 'Nhấn phím F2 hoặc nhấp chuột phải chọn Rename',
          B: 'Nhấn phím Esc',
          C: 'Kéo tệp vào thùng rác',
          D: 'Rút chuột ra cắm lại'
        },
        correctOption: 'A',
        subject: 'Tin học Lớp 4',
        explanation: 'Phím F2 hoặc lệnh Rename trong menu chuột phải cho phép em gõ tên mới cho tệp/thư mục.'
      },
      {
        id: 'th4_5',
        content: 'Một thư mục có thể chứa những gì bên trong nó?',
        options: {
          A: 'Chỉ chứa được duy nhất 1 tệp hình ảnh',
          B: 'Có thể chứa nhiều tệp tin và các thư mục con khác',
          C: 'Không chứa được bất kỳ thứ gì',
          D: 'Chỉ chứa được chữ viết tay'
        },
        correctOption: 'B',
        subject: 'Tin học Lớp 4',
        explanation: 'Thư mục có thể chứa cả các tệp tin và các thư mục con theo cấu trúc cây phân cấp khoa học.'
      },
      {
        id: 'th4_6',
        content: 'Mạng Internet mang lại lợi ích gì lớn nhất cho người chơi?',
        options: {
          A: 'Giúp tìm kiếm tài liệu học tập, xem bài giảng bổ ích và kết nối bạn bè',
          B: 'Giúp không cần phải học bài mà vẫn đạt điểm 10',
          C: 'Tự động làm bài tập hộ người chơi',
          D: 'Làm hỏng sách giáo khoa'
        },
        correctOption: 'A',
        subject: 'Tin học Lớp 4',
        explanation: 'Internet là kho tàng tri thức khổng lồ hỗ trợ đắc lực cho việc tra cứu, học tập và mở rộng hiểu biết.'
      },
      {
        id: 'th4_7',
        content: 'Mật khẩu tài khoản cá nhân nào sau đây được coi là an toàn và khó đoán?',
        options: {
          A: '123456',
          B: 'Họ tên và ngày sinh của chính mình',
          C: 'Chuỗi kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt (VD: Stem@2026!)',
          D: '000000'
        },
        correctOption: 'C',
        subject: 'Tin học Lớp 4',
        explanation: 'Mật khẩu mạnh cần có độ dài tối thiểu 8 ký tự, kết hợp chữ hoa, chữ thường, chữ số và ký tự đặc biệt.'
      },
      {
        id: 'th4_8',
        content: 'Khi đang lướt mạng bỗng thấy một cửa sổ thông báo: "Em đã trúng thưởng 100 triệu, hãy bấm vào đây và nhập số điện thoại của bố mẹ", em nên làm gì?',
        options: {
          A: 'Lập tức bấm vào và khai báo toàn bộ thông tin nhà mình',
          B: 'Không bấm vào liên kết lạ và báo ngay cho bố mẹ hoặc thầy cô vì đây có thể là lừa đảo',
          C: 'Gửi liên kết đó cho tất cả các bạn cùng lớp',
          D: 'Chuyển tiền tiết kiệm vào tài khoản đó'
        },
        correctOption: 'B',
        subject: 'Tin học Lớp 4',
        explanation: 'Đây là hình thức lừa đảo qua mạng phổ biến. Tuyệt đối không nhấp vào đường link lạ và không tiết lộ thông tin cá nhân.'
      },
      {
        id: 'th4_9',
        content: 'Thông tin nào sau đây TUYỆT ĐỐI KHÔNG NÊN công khai cho người lạ trên mạng xã hội?',
        options: {
          A: 'Tên bài hát thiếu nhi em yêu thích',
          B: 'Địa chỉ nhà riêng, trường lớp, số điện thoại và mật khẩu của gia đình',
          C: 'Màu sắc yêu thích của em',
          D: 'Tên một nhân vật hoạt hình'
        },
        correctOption: 'B',
        subject: 'Tin học Lớp 4',
        explanation: 'Thông tin cá nhân, địa chỉ và mật khẩu cần được giữ bí mật tuyệt đối để bảo vệ an toàn cho bản thân và gia đình.'
      },
      {
        id: 'th4_10',
        content: 'Trình duyệt web nào sau đây phổ biến được dùng để truy cập Internet?',
        options: {
          A: 'Google Chrome, Microsoft Edge, Cốc Cốc',
          B: 'Máy giặt',
          C: 'Máy photocopy',
          D: 'Bảng đen và phấn trắng'
        },
        correctOption: 'A',
        subject: 'Tin học Lớp 4',
        explanation: 'Google Chrome, Microsoft Edge, Cốc Cốc, Safari là các trình duyệt web phổ biến giúp duyệt web.'
      }
    ]
  },
  {
    id: 'set_lop3_banphim',
    title: 'Tin học Lớp 3 - Bàn phím & Luyện gõ 10 ngón',
    gradeBadge: 'Lớp 3',
    category: 'Kỹ năng sử dụng bàn phím',
    description: 'Quy tắc hàng phím cơ sở, các phím có gờ định vị và phân công nhiệm vụ 10 ngón tay khi soạn thảo.',
    isSaved: true,
    createdAt: 1715000002000,
    questions: [
      {
        id: 'bp3_1',
        content: 'Hai phím nào trên hàng phím cơ sở có gờ nhô lên để đặt ngón trỏ định vị bàn tay?',
        options: {
          A: 'Phím A và phím S',
          B: 'Phím F và phím J',
          C: 'Phím G và phím H',
          D: 'Phím Enter và phím Shift'
        },
        correctOption: 'B',
        subject: 'Tin học Lớp 3',
        explanation: 'Phím F (ngón trỏ trái) và phím J (ngón trỏ phải) có gờ nổi để nhận biết vị trí chuẩn mà không cần nhìn bàn phím.'
      },
      {
        id: 'bp3_2',
        content: 'Hàng phím nào sau đây được gọi là "Hàng phím cơ sở"?',
        options: {
          A: 'Hàng phím có chứa: A S D F G H J K L ;',
          B: 'Hàng phím số 1 2 3 4 5 6 7 8 9 0',
          C: 'Hàng phím chứa phím cách Spacebar',
          D: 'Hàng phím F1 F2 F3... F12'
        },
        correctOption: 'A',
        subject: 'Tin học Lớp 3',
        explanation: 'Hàng phím cơ sở là hàng phím chuẩn nơi 8 ngón tay luôn sẵn sàng xuất phát và quay về.'
      },
      {
        id: 'bp3_3',
        content: 'Phím dài nhất trên bàn phím máy tính là phím gì và có tác dụng gì?',
        options: {
          A: 'Phím Enter (xuống dòng)',
          B: 'Phím Space bar (tạo dấu cách giữa các từ)',
          C: 'Phím Shift (viết hoa)',
          D: 'Phím Backspace (xóa lùi)'
        },
        correctOption: 'B',
        subject: 'Tin học Lớp 3',
        explanation: 'Phím cách (Spacebar) nằm ở hàng phím dưới cùng, thường do 2 ngón tay cái phụ trách.'
      },
      {
        id: 'bp3_4',
        content: 'Hai ngón tay cái được phân công nhiệm vụ gõ phím nào?',
        options: {
          A: 'Phím phím cách (Space bar)',
          B: 'Phím Enter',
          C: 'Phím số 1',
          D: 'Phím Escape (Esc)'
        },
        correctOption: 'A',
        subject: 'Tin học Lớp 3',
        explanation: 'Hai ngón cái luôn đặt hờ trên phím cách (Space bar) và chịu trách nhiệm tạo khoảng cách giữa các từ.'
      },
      {
        id: 'bp3_5',
        content: 'Để xuống một dòng mới khi đang gõ văn bản, em nhấn phím nào?',
        options: {
          A: 'Phím Enter',
          B: 'Phím Caps Lock',
          C: 'Phím Tab',
          D: 'Phím Ctrl'
        },
        correctOption: 'A',
        subject: 'Tin học Lớp 3',
        explanation: 'Phím Enter giúp kết thúc một đoạn văn bản hoặc xuống dòng mới khi soạn thảo.'
      },
      {
        id: 'bp3_6',
        content: 'Phím Caps Lock khi được bật sáng đèn có tác dụng gì?',
        options: {
          A: 'Tắt màn hình máy tính',
          B: 'Cho phép gõ chữ in hoa liên tục',
          C: 'Tự động xóa hết văn bản',
          D: 'Tăng âm lượng loa'
        },
        correctOption: 'B',
        subject: 'Tin học Lớp 3',
        explanation: 'Khi đèn Caps Lock bật, các chữ cái gõ ra đều tự động trở thành chữ IN HOA.'
      },
      {
        id: 'bp3_7',
        content: 'Phím Backspace (có mũi tên trỏ sang trái ⟵) dùng để làm gì?',
        options: {
          A: 'Xóa ký tự nằm bên trái con trỏ soạn thảo',
          B: 'Thêm một dòng trống',
          C: 'In tài liệu ra giấy',
          D: 'Lưu bài tập'
        },
        correctOption: 'A',
        subject: 'Tin học Lớp 3',
        explanation: 'Phím Backspace xóa ký tự ngay trước (bên trái) con trỏ văn bản.'
      },
      {
        id: 'bp3_8',
        content: 'Lợi ích của việc luyện tập gõ bàn phím bằng 10 ngón đúng cách là gì?',
        options: {
          A: 'Gõ nhanh hơn, ít bị nhầm lẫn và không cần phải cúi gằm mắt nhìn bàn phím',
          B: 'Làm hỏng bàn phím nhanh hơn',
          C: 'Khiến tay bị mỏi hơn bình thường',
          D: 'Chỉ để thi đấu thể thao'
        },
        correctOption: 'A',
        subject: 'Tin học Lớp 3',
        explanation: 'Gõ 10 ngón giúp tăng tốc độ soạn thảo vượt bậc, bảo vệ mắt và cổ tay thoải mái.'
      }
    ]
  },
  {
    id: 'set_lop4_powerpoint',
    title: 'Tin học Lớp 4 - Trình chiếu đa phương tiện (PowerPoint)',
    gradeBadge: 'Lớp 4',
    category: 'Phần mềm trình chiếu & Sáng tạo',
    description: 'Các bước thiết kế bài thuyết trình sinh động, chèn hình ảnh, tạo hiệu ứng chuyển trang và trình chiếu toàn màn hình.',
    isSaved: true,
    createdAt: 1715000003000,
    questions: [
      {
        id: 'ppt4_1',
        content: 'Phần mềm Microsoft PowerPoint chủ yếu được dùng để làm công việc gì?',
        options: {
          A: 'Soạn thảo văn bản đơn thuần',
          B: 'Tạo các bài trình chiếu (thuyết trình) bằng hình ảnh, chữ và video sinh động',
          C: 'Tính toán bảng lương kế toán',
          D: 'Vẽ hình kỹ thuật xây dựng'
        },
        correctOption: 'B',
        subject: 'Tin học Lớp 4',
        explanation: 'PowerPoint là công cụ trình chiếu đa phương tiện hàng đầu giúp thuyết trình bài học trực quan.'
      },
      {
        id: 'ppt4_2',
        content: 'Một trang trong bài trình chiếu PowerPoint được gọi là gì?',
        options: {
          A: 'Trang sách (Page)',
          B: 'Trang chiếu (Slide)',
          C: 'Ô tính (Cell)',
          D: 'Đoạn phim (Scene)'
        },
        correctOption: 'B',
        subject: 'Tin học Lớp 4',
        explanation: 'Mỗi trang trình chiếu trong PowerPoint được gọi là một Slide.'
      },
      {
        id: 'ppt4_3',
        content: 'Để thêm một trang chiếu mới (Slide mới) vào bài thuyết trình, em bấm lệnh nào ở thẻ Home?',
        options: {
          A: 'New Slide',
          B: 'Delete Slide',
          C: 'Save',
          D: 'Print'
        },
        correctOption: 'A',
        subject: 'Tin học Lớp 4',
        explanation: 'Lệnh New Slide (hoặc phím tắt Ctrl + M) dùng để tạo thêm một trang chiếu mới.'
      },
      {
        id: 'ppt4_4',
        content: 'Để chèn một bức tranh hoặc hình ảnh từ máy tính vào trang chiếu, em mở thẻ nào?',
        options: {
          A: 'Thẻ Insert -> chọn Pictures',
          B: 'Thẻ Review',
          C: 'Thẻ View',
          D: 'Thẻ Help'
        },
        correctOption: 'A',
        subject: 'Tin học Lớp 4',
        explanation: 'Thẻ Insert chứa các công cụ chèn đối tượng: Pictures (ảnh), Shapes (hình khối), Video, Audio.'
      },
      {
        id: 'ppt4_5',
        content: 'Để bài trình chiếu thêm sinh động và hấp dẫn, em có thể tạo hiệu ứng xuất hiện cho chữ và ảnh ở thẻ nào?',
        options: {
          A: 'Thẻ Animations',
          B: 'Thẻ File',
          C: 'Thẻ Home',
          D: 'Thẻ Design'
        },
        correctOption: 'A',
        subject: 'Tin học Lớp 4',
        explanation: 'Thẻ Animations chuyên dùng tạo các hiệu ứng chuyển động cho từng đối tượng văn bản hoặc hình ảnh.'
      },
      {
        id: 'ppt4_6',
        content: 'Hiệu ứng chuyển từ trang chiếu này sang trang chiếu tiếp theo được thiết lập ở thẻ nào?',
        options: {
          A: 'Thẻ Transitions',
          B: 'Thẻ Font',
          C: 'Thẻ Draw',
          D: 'Thẻ Format'
        },
        correctOption: 'A',
        subject: 'Tin học Lớp 4',
        explanation: 'Thẻ Transitions cung cấp các hiệu ứng chuyển tiếp giữa các trang chiếu (Slide).'
      },
      {
        id: 'ppt4_7',
        content: 'Phím tắt nào trên bàn phím dùng để bắt đầu trình chiếu bài thuyết trình từ trang đầu tiên ra toàn màn hình?',
        options: {
          A: 'Phím F5',
          B: 'Phím F1',
          C: 'Phím Esc',
          D: 'Phím Tab'
        },
        correctOption: 'A',
        subject: 'Tin học Lớp 4',
        explanation: 'Nhấn F5 để trình chiếu toàn màn hình từ Slide đầu tiên; Shift + F5 để chiếu từ Slide hiện hành.'
      },
      {
        id: 'ppt4_8',
        content: 'Khi đang chiếu toàn màn hình, để thoát khỏi chế độ trình chiếu và quay về màn hình soạn thảo, em nhấn phím gì?',
        options: {
          A: 'Phím Escape (Esc)',
          B: 'Phím Enter',
          C: 'Phím Space',
          D: 'Phím mũi tên lên'
        },
        correctOption: 'A',
        subject: 'Tin học Lớp 4',
        explanation: 'Phím Esc (Escape) ở góc trên cùng bên trái bàn phím dùng để hủy hoặc thoát chế độ trình chiếu.'
      }
    ]
  },
  {
    id: 'set_stem_khampha',
    title: 'STEM Vũ trụ & Khoa học Tự nhiên',
    gradeBadge: 'STEM',
    category: 'Khoa học & Kỹ thuật',
    description: 'Khám phá các hành tinh, sự quang hợp của cây xanh, năng lượng tái tạo và cấu trúc máy tính thông minh.',
    isSaved: true,
    createdAt: 1715000004000,
    questions: INITIAL_STEM_QUESTIONS
  }
];
