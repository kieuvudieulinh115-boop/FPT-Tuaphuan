export const SAMPLE_TEMPLATE_TEXT = `Câu 1: Thiết bị nào sau đây dùng để nhập văn bản và số vào máy tính?
A. Chuột máy tính
B. Bàn phím máy tính
C. Màn hình máy tính
D. Loa máy tính
Đáp án: B
Giải thích: Bàn phím là thiết bị ngoại vi dùng để nhập văn bản, ký tự và số liệu vào máy tính.

Câu 2: Đâu là hành vi đúng đắn và an toàn khi tham gia mạng Internet?
A. Tự ý chia sẻ mật khẩu tài khoản cho người lạ
B. Không cung cấp thông tin cá nhân cho người chưa quen biết
C. Bấm vào các đường link lạ có quà tặng miễn phí
D. Hẹn gặp trực tiếp người lạ quen qua mạng xã hội
Đáp án: B
Giải thích: Giữ kín thông tin cá nhân và mật khẩu là nguyên tắc hàng đầu để tự bảo vệ bản thân trên không gian số.

Câu 3: Bộ phận nào được xem như là "bộ não" điều khiển mọi hoạt động của máy tính?
A. Ổ cứng lưu trữ
B. Màn hình hiển thị
C. Bộ vi xử lý (CPU)
D. Nguồn điện máy tính
Đáp án: C
Giải thích: CPU (Central Processing Unit) xử lý toàn bộ dữ liệu và điều phối các bộ phận trong hệ thống máy tính.

Câu 4: Khi sử dụng máy tính, tư thế ngồi nào sau đây là chuẩn và tốt cho sức khỏe?
A. Ngồi gù lưng, mắt áp thật sát vào màn hình
B. Ngồi thẳng lưng, mắt cách màn hình khoảng 50-70 cm
C. Nằm trên giường để gõ bàn phím
D. Ngồi vắt chéo chân và tựa sát cằm vào bàn
Đáp án: B
Giải thích: Ngồi thẳng lưng và giữ khoảng cách màn hình từ 50-70cm giúp bảo vệ cột sống và thị lực.

Câu 5: Phần mềm nào sau đây thường được dùng để thiết kế bài thuyết trình sinh động?
A. Microsoft Word
B. Microsoft Excel
C. Microsoft PowerPoint
D. Bộ gõ Unikey
Đáp án: C
Giải thích: Microsoft PowerPoint là phần mềm chuyên dụng để tạo các trang trình chiếu, thuyết trình trực quan.

Câu 6: Để lưu lại một tệp văn bản đang soạn thảo trên máy tính, ta dùng tổ hợp phím nào?
A. Ctrl + C
B. Ctrl + V
C. Ctrl + Z
D. Ctrl + S
Đáp án: D
Giải thích: Tổ hợp phím Ctrl + S (Save) dùng để lưu lại tệp tin nhanh chóng trong hầu hết phần mềm.

Câu 7: Tệp hình ảnh chụp từ máy ảnh hoặc điện thoại thường có phần đuôi mở rộng là gì?
A. .mp3
B. .jpg hoặc .png
C. .docx
D. .exe
Đáp án: B
Giải thích: .jpg, .jpeg, .png là các định dạng phổ biến nhất của tệp hình ảnh kỹ thuật số.

Câu 8: Thùng rác Recycle Bin trên máy tính có chức năng gì?
A. Tự động sửa chữa phần mềm bị lỗi
B. Chứa các tệp tin và thư mục tạm thời bị xóa
C. Dọn dẹp bụi bẩn bên trong thân máy tính
D. Quét và diệt toàn bộ virus trên máy tính
Đáp án: B
Giải thích: Recycle Bin là nơi lưu trữ các tệp đã xóa tạm thời, giúp người dùng có thể khôi phục lại khi cần.

Câu 9: Robot dò đường trong các cuộc thi STEM thường sử dụng loại cảm biến nào để nhận biết vạch kẻ đen?
A. Cảm biến nhiệt độ
B. Cảm biến hồng ngoại dò line
C. Cảm biến áp suất khí quyển
D. Cảm biến độ ẩm đất
Đáp án: B
Giải thích: Cảm biến hồng ngoại thu phát ánh sáng để phân biệt sự phản xạ giữa nền sáng và vạch kẻ đen.`;

export function downloadSampleQuestionsDocx() {
  // We can download the nicely formatted text file or doc format compatible with Word
  const blob = new Blob([SAMPLE_TEMPLATE_TEXT], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Mau_Bo_Cau_Hoi_Chuan_STEM.txt';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadSampleQuestionsWordDoc() {
  // Create an HTML-based document that Microsoft Word opens directly as .doc with rich formatting
  const htmlContent = `
  <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head>
    <meta charset='utf-8'>
    <title>Mẫu Bộ Câu Hỏi Chuẩn STEM</title>
    <style>
      body { font-family: 'Times New Roman', Arial, sans-serif; line-height: 1.6; font-size: 13pt; }
      h2 { color: #1e3a8a; text-align: center; }
      p.instruction { background-color: #f1f5f9; padding: 10px; border-left: 4px solid #0284c7; }
      p.question { font-weight: bold; margin-top: 15px; margin-bottom: 5px; }
      p.option { margin: 2px 0 2px 20px; }
      p.answer { font-weight: bold; color: #047857; margin-left: 20px; }
      p.explanation { font-style: italic; color: #475569; margin-left: 20px; }
    </style>
  </head>
  <body>
    <h2>MẪU BỘ CÂU HỎI TRẮC NGHIỆM CHUẨN</h2>
    <p class="instruction">
      <strong>Quy tắc nhận diện:</strong><br/>
      1. Mỗi câu bắt đầu bằng <strong>Câu [số]:</strong> hoặc <strong>[số].</strong><br/>
      2. 4 phương án bắt đầu bằng <strong>A.</strong>, <strong>B.</strong>, <strong>C.</strong>, <strong>D.</strong> (hoặc A), B), C), D))<br/>
      3. Dòng đáp án ghi rõ <strong>Đáp án: [A/B/C/D]</strong> hoặc <strong>Đáp án đúng: [A/B/C/D]</strong><br/>
      4. Dòng giải thích (không bắt buộc) ghi <strong>Giải thích: [nội dung]</strong>
    </p>
    <hr/>
    ${SAMPLE_TEMPLATE_TEXT.split('\n\n').map(qBlock => {
      const lines = qBlock.split('\n');
      return `
        <div>
          <p class="question">${lines[0] || ''}</p>
          <p class="option">${lines[1] || ''}</p>
          <p class="option">${lines[2] || ''}</p>
          <p class="option">${lines[3] || ''}</p>
          <p class="option">${lines[4] || ''}</p>
          <p class="answer">${lines[5] || ''}</p>
          ${lines[6] ? `<p class="explanation">${lines[6]}</p>` : ''}
        </div>
      `;
    }).join('')}
  </body>
  </html>
  `;
  const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Mau_Bo_Cau_Hoi_Chuan_Word.doc';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
