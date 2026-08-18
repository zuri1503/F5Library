// Dữ liệu tĩnh: sách, tin tức, độc giả, phiếu mượn

const BOOKS = [
    { id: 1, title: "Tư duy phản biện", author: "Zoe McKey", category: "Kỹ năng sống", stock: 5, cover: "images/sach/book1.jpg", description: "Cuốn sách giúp bạn rèn luyện khả năng suy nghĩ độc lập, logic và đưa ra những quyết định sáng suốt.", location: "Kệ A1 - Tầng 1", featured: true, isNew: false },
    { id: 2, title: "Tiểu sử Elon Musk", author: "Walter Isaacson", category: "Tiểu sử", stock: 5, cover: "images/sach/book2.jpg", description: "Cuốn tiểu sử kể về hành trình đầy tham vọng và những quyết định táo bạo của Elon Musk.", location: "Kệ B2 - Tầng 2", featured: true, isNew: false },
    { id: 3, title: "Nhật ký trong tù", author: "Hồ Chí Minh", category: "Văn học", stock: 5, cover: "images/sach/book3.jpg", description: "Tác phẩm viết trong thời gian Bác Hồ bị giam giữ, thể hiện tinh thần lạc quan, ý chí kiên cường.", location: "Kệ C1 - Tầng 1", featured: true, isNew: false },
    { id: 4, title: "Bí mật triệu phú", author: "T. Harv Eker", category: "Kỹ năng sống", stock: 5, cover: "images/sach/book4.jpg", description: "Chia sẻ những nguyên tắc tài chính giúp thay đổi tư duy về tiền bạc và xây dựng sự giàu có.", location: "Kệ A2 - Tầng 1", featured: true, isNew: false },
    { id: 5, title: "Truyện Kiều", author: "Nguyễn Du", category: "Văn học", stock: 5, cover: "images/sach/book5.jpg", description: "Tác phẩm văn học kinh điển, kể về cuộc đời đầy thăng trầm của nàng Kiều.", location: "Kệ C2 - Tầng 2", featured: false, isNew: true },
    { id: 6, title: "Cậu bé vàng", author: "Nguyễn Nhật Ánh", category: "Văn học", stock: 5, cover: "images/sach/book6.jpg", description: "Cuốn tiểu thuyết nhẹ nhàng, trong sáng về tuổi học trò và những kỷ niệm đẹp.", location: "Kệ C3 - Tầng 2", featured: false, isNew: true },
    { id: 7, title: "Master chef", author: "Gordon Ramsay", category: "Nấu ăn", stock: 5, cover: "images/sach/book7.jpg", description: "Cẩm nang nấu ăn từ đầu bếp nổi tiếng thế giới Gordon Ramsay.", location: "Kệ D1 - Tầng 3", featured: false, isNew: true },
    { id: 8, title: "Apple hậu Steve Jobs", author: "Brian Merchant", category: "Tin học", stock: 5, cover: "images/sach/book8.jpg", description: "Cuốn sách kể về hậu trường và những bí mật bên trong công ty Apple sau khi Steve Jobs qua đời.", location: "Kệ E1 - Tầng 3", featured: false, isNew: true }
];

const NEWS = [
    { id: 1, title: "Ưu đãi gia hạn tất cả sách tháng 8", summary: "Tặng gia hạn thêm 1 tuần cho sách thuộc danh mục CNTT trong tháng 8.", image: "images/tintuc/news1.jpg", date: "2026-08-10", author: "Ban quản lý" },
    { id: 2, title: "Top 10 cuốn sách nên đọc mùa tựu trường", summary: "Gợi ý 10 cuốn sách hay nhất giúp phát triển bản thân và định hướng sự nghiệp.", image: "images/tintuc/news2.jpg", date: "2026-08-05", author: "Thủ thư Hương" },
    { id: 3, title: "Hơn 200 đầu sách mới vừa được cập nhật", summary: "Thư viện vừa bổ sung hơn 200 đầu sách mới trải dài nhiều thể loại.", image: "images/tintuc/news3.jpg", date: "2026-08-01", author: "Ban quản lý" }
];

const READERS = [
    { id: 1, name: "Nguyễn Văn A", email: "nguyenvana@example.com", phone: "0901234567", joinDate: "2026-01-15", status: "active" },
    { id: 2, name: "Trần Thị B", email: "tranthib@example.com", phone: "0912345678", joinDate: "2026-02-20", status: "active" },
    { id: 3, name: "Lê Văn C", email: "levanc@example.com", phone: "0923456789", joinDate: "2026-03-10", status: "locked" }
];

const LOANS = [
    { id: 1, reader: "Nguyễn Văn A", book: "Tư duy phản biện", borrowDate: "2026-08-01", dueDate: "2026-08-15", status: "Đang mượn" },
    { id: 2, reader: "Trần Thị B", book: "Tiểu sử Elon Musk", borrowDate: "2026-07-20", dueDate: "2026-08-03", status: "Quá hạn" },
    { id: 3, reader: "Lê Văn C", book: "Truyện Kiều", borrowDate: "2026-07-15", dueDate: "2026-07-29", status: "Đã trả" }
];

/* Ham tien ich */
function getBookById(id) { return BOOKS.find(b => b.id === parseInt(id)); }
function getFeaturedBooks() { return BOOKS.filter(b => b.featured); }
function getNewBooks() { return BOOKS.filter(b => b.isNew); }
function getCategories() { return [...new Set(BOOKS.map(b => b.category))]; }
function searchBooks(kw) {
    if (!kw) return [];
    kw = kw.toLowerCase();
    return BOOKS.filter(b =>
        b.title.toLowerCase().includes(kw) ||
        b.author.toLowerCase().includes(kw) ||
        b.category.toLowerCase().includes(kw)
    );
}