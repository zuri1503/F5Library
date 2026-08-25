// Main JS cho Thư viện F5 - xử lý giỏ mượn, render sách/tin tức, form, menu mobile, admin CRUD
document.addEventListener('DOMContentLoaded', () => {
    initCart();
    renderFeaturedBooks();
    renderNewBooks();
    renderNews();
    renderBookDetail();
    renderRelatedBooks();
    renderCartTable();
    initMenuToggle();
    initBackToTop();
    initContactForm();
    initAuthForms();
    renderAdminTables();
    initSearchPage();
    renderAccountPage();
    updateHeaderUser();
});

// User đăng nhập
function getCurrentUser() {
    const raw = localStorage.getItem('currentUser');
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
}

function setCurrentUser(user) {
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
        localStorage.removeItem('currentUser');
    }
    updateHeaderUser();
}

function updateHeaderUser() {
    const user = getCurrentUser();
    const link = document.querySelector('.header-actions a[href="dangnhap.html"]');
    if (!link) return;
    if (user) {
        link.setAttribute('href', 'taikhoan.html');
        link.setAttribute('title', user.name);
        link.setAttribute('aria-label', 'Tài khoản');
        const icon = link.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-user');
            icon.classList.add('fa-user-check');
        }
    }
}

function logout() {
    if (!confirm('Bạn có chắc muốn đăng xuất?')) return;
    setCurrentUser(null);
    location.href = 'index.html';
}

// Trang tài khoản
function renderAccountPage() {
    const el = document.getElementById('account-info');
    if (!el) return;
    const user = getCurrentUser();
    if (!user) {
        // Chưa đăng nhập → đẩy về trang đăng nhập
        location.href = 'dangnhap.html';
        return;
    }
    var html = '';
    html += '<div class="account-card">';
    html += '<div class="account-avatar"><i class="fa-solid fa-user-circle"></i></div>';
    html += '<h2 class="account-name">' + user.name + '</h2>';
    html += '<p class="account-role"><span class="role-badge role-' + user.role + '">';
    html += (user.role === 'admin' ? 'Quản trị viên' : 'Độc giả') + '</span></p>';
    html += '<div class="account-info-list">';
    html += '<div class="account-info-item"><i class="fa-solid fa-envelope"></i><span>' + user.email + '</span></div>';
    html += '<div class="account-info-item"><i class="fa-solid fa-phone"></i><span>' + user.phone + '</span></div>';
    html += '<div class="account-info-item"><i class="fa-solid fa-calendar"></i><span>Tham gia: ' + user.joinDate + '</span></div>';
    html += '</div>';
    html += '<div class="account-actions">';
    if (user.role === 'admin') {
        html += '<a href="admin.html" class="btn btn-primary"><i class="fa-solid fa-gauge-high"></i> Vào trang Quản trị</a>';
    }
    html += '<button class="btn btn-danger" onclick="logout()"><i class="fa-solid fa-right-from-bracket"></i> Đăng xuất</button>';
    html += '</div>';
    html += '</div>';
    el.innerHTML = html;
    // Hiển thị lịch sử mượn nếu có
    renderLoanHistory(user);
}

function renderLoanHistory(user) {
    const el = document.getElementById('loan-history');
    if (!el || typeof LOANS === 'undefined') return;
    var myLoans = LOANS.filter(function (l) {
        return l.reader.toLowerCase() === user.name.toLowerCase();
    });
    if (myLoans.length === 0) return;
    var html = '<div class="admin-section" style="margin-top:24px;">';
    html += '<h2><i class="fa-solid fa-clipboard-list"></i> Lịch sử mượn sách của bạn</h2>';
    html += '<table class="data-table"><thead><tr>';
    html += '<th>Sách</th><th>Ngày mượn</th><th>Hạn trả</th><th>Trạng thái</th>';
    html += '</tr></thead><tbody>';
    for (var i = 0; i < myLoans.length; i++) {
        var l = myLoans[i];
        var cls = (l.status === 'Đang mượn' || l.status === 'Đã trả') ? 'status-active' : 'status-locked';
        html += '<tr>';
        html += '<td>' + l.book + '</td>';
        html += '<td>' + l.borrowDate + '</td>';
        html += '<td>' + l.dueDate + '</td>';
        html += '<td><span class="status ' + cls + '">' + l.status + '</span></td>';
        html += '</tr>';
    }
    html += '</tbody></table></div>';
    el.innerHTML = html;
}

// Giỏ mượn (CRUD cơ bản)
function initCart() {
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
    updateCartCount();
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const el = document.getElementById('cart-count');
    if (el) el.textContent = cart.length;
}

function addToCart(id) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const book = getBookById(id);
    if (!book) { alert('Không tìm thấy sách!'); return; }
    if (book.stock <= 0) { alert('Sách đã hết, không thể mượn!'); return; }
    if (cart.includes(id)) { alert('Sách đã có trong giỏ mượn!'); return; }
    cart.push(id);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert('Đã thêm vào giỏ mượn!');
}

function removeFromCart(id) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart = cart.filter(x => x !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCartTable();
}

function clearCart() {
    if (confirm('Bạn có chắc muốn xóa toàn bộ giỏ mượn?')) {
        localStorage.setItem('cart', JSON.stringify([]));
        updateCartCount();
        renderCartTable();
    }
}

// Render danh sách sách - Card chỉ có nút Xem chi tiết
function bookCardHTML(b) {
    var img = '<img src="' + b.cover + '" alt="' + b.title + '" class="book-card-img">';
    var link = '<a href="chitietsach.html?id=' + b.id + '">' + img + '</a>';
    var body = '<div class="book-card-body">';
    body += '<h3 class="book-card-title"><a href="chitietsach.html?id=' + b.id + '">' + b.title + '</a></h3>';
    body += '<p class="book-card-author">' + b.author + '</p>';
    body += '<span class="book-card-cat">' + b.category + '</span>';
    body += '<p class="book-card-stock">' + (b.stock > 0 ? 'Còn ' + b.stock + ' cuốn' : 'Đã hết') + '</p>';
    body += '<a href="chitietsach.html?id=' + b.id + '" class="btn btn-primary btn-sm btn-block">';
    body += '<i class="fa-solid fa-eye"></i> Xem chi tiết</a>';
    body += '</div>';
    return '<div class="book-card">' + link + body + '</div>';
}

function renderFeaturedBooks() {
    const el = document.getElementById('featured-books');
    if (el) el.innerHTML = getFeaturedBooks().map(bookCardHTML).join('');
}

function renderNewBooks() {
    const el = document.getElementById('new-books');
    if (el) el.innerHTML = getNewBooks().map(bookCardHTML).join('');
}

function renderBookDetail() {
    const el = document.getElementById('book-detail');
    if (!el) return;
    const id = new URLSearchParams(location.search).get('id');
    if (!id) return;
    const b = getBookById(id);
    if (!b) { el.innerHTML = '<p>Không tìm thấy sách.</p>'; return; }
    var html = '<div class="book-detail">';
    html += '<img src="' + b.cover + '" alt="' + b.title + '" class="book-detail-img">';
    html += '<div>';
    html += '<h1>' + b.title + '</h1>';
    html += '<div class="book-detail-info">';
    html += '<p><strong>Tác giả:</strong> ' + b.author + '</p>';
    html += '<p><strong>Thể loại:</strong> ' + b.category + '</p>';
    html += '<p><strong>Số lượng:</strong> ' + (b.stock > 0 ? 'Còn ' + b.stock + ' cuốn' : 'Đã hết') + '</p>';
    html += '<p><strong>Vị trí:</strong> ' + b.location + '</p>';
    html += '</div>';
    html += '<p class="book-detail-desc">' + b.description + '</p>';
    var disabled = b.stock <= 0 ? 'disabled' : '';
    html += '<div class="book-detail-actions">';
    html += '<button class="btn btn-primary" onclick="addToCart(' + b.id + ')" ' + disabled + '>';
    html += '<i class="fa-solid fa-cart-plus"></i> Mượn sách</button>';
    html += '<a href="danhmuc.html" class="btn btn-secondary">';
    html += '<i class="fa-solid fa-arrow-left"></i> Quay lại</a>';
    html += '</div></div></div>';
    el.innerHTML = html;
}

function renderRelatedBooks() {
    const el = document.getElementById('related-books');
    if (!el) return;
    const id = new URLSearchParams(location.search).get('id');
    if (!id) return;
    const b = getBookById(id);
    if (!b) return;
    const related = BOOKS.filter(x => x.category === b.category && x.id !== b.id).slice(0, 4);
    if (related.length === 0) return;
    el.innerHTML = related.map(bookCardHTML).join('');
}

function renderCartTable() {
    const el = document.getElementById('cart-list');
    if (!el) return;
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
        el.innerHTML = '<div class="empty-cart"><i class="fa-solid fa-cart-shopping"></i>' +
            '<p>Giỏ mượn đang trống</p>' +
            '<a href="danhmuc.html" class="btn btn-primary">Mượn sách ngay</a></div>';
        return;
    }
    var rows = '';
    for (var i = 0; i < cart.length; i++) {
        const b = getBookById(cart[i]);
        if (!b) continue;
        var status = b.stock > 0
            ? '<span class="status status-active">Còn ' + b.stock + '</span>'
            : '<span class="status status-locked">Hết</span>';
        rows += '<tr>';
        rows += '<td><img src="' + b.cover + '" class="thumb"></td>';
        rows += '<td><a href="chitietsach.html?id=' + b.id + '">' + b.title + '</a></td>';
        rows += '<td>' + b.author + '</td>';
        rows += '<td>' + status + '</td>';
        rows += '<td><button class="btn btn-danger btn-sm" onclick="removeFromCart(' + b.id + ')">';
        rows += '<i class="fa-solid fa-trash"></i></button></td>';
        rows += '</tr>';
    }
    el.innerHTML = '<div class="cart-table-wrap"><table class="data-table">' +
        '<thead><tr><th>Ảnh</th><th>Tên sách</th><th>Tác giả</th><th>Trạng thái</th><th></th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table></div>';
}

// Render tin tức
function renderNews() {
    const el = document.getElementById('news-list');
    if (!el) return;
    var html = '';
    for (var i = 0; i < NEWS.length; i++) {
        const n = NEWS[i];
        html += '<div class="news-card">';
        html += '<img src="' + n.image + '" alt="' + n.title + '" class="news-card-img">';
        html += '<div class="news-card-body">';
        html += '<h3 class="news-card-title">' + n.title + '</h3>';
        html += '<p class="news-card-sum">' + n.summary + '</p>';
        html += '<p class="news-card-meta"><i class="fa-solid fa-calendar"></i> ' + n.date + ' | ' + n.author + '</p>';
        html += '</div></div>';
    }
    el.innerHTML = html;
}

// Tìm kiếm + lọc sách
function initSearchPage() {
    const searchInput = document.getElementById('search-keyword');
    const catSelect = document.getElementById('filter-category');
    const stockSelect = document.getElementById('filter-stock');
    const resetBtn = document.getElementById('btn-reset');

    if (!searchInput) return;

    if (catSelect) {
        var opts = '<option value="">-- Tất cả thể loại --</option>';
        var cats = getCategories();
        for (var i = 0; i < cats.length; i++) {
            opts += '<option value="' + cats[i] + '">' + cats[i] + '</option>';
        }
        catSelect.innerHTML = opts;
    }

    const q = new URLSearchParams(location.search).get('q');
    if (q) searchInput.value = q;

    const apply = () => filterAndRenderBooks();
    searchInput.addEventListener('input', apply);
    if (catSelect) catSelect.addEventListener('change', apply);
    if (stockSelect) stockSelect.addEventListener('change', apply);
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            searchInput.value = '';
            if (catSelect) catSelect.value = '';
            if (stockSelect) stockSelect.value = '';
            apply();
        });
    }

    const headerForm = document.getElementById('header-search-form');
    if (headerForm) {
        headerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const v = headerForm.querySelector('input[name=q]').value.trim();
            location.href = 'danhmuc.html?q=' + encodeURIComponent(v);
        });
    }

    filterAndRenderBooks();
}

function filterAndRenderBooks() {
    const el = document.getElementById('book-list');
    if (!el) return;

    const kw = (document.getElementById('search-keyword') ? document.getElementById('search-keyword').value : '').toLowerCase().trim();
    const cat = document.getElementById('filter-category') ? document.getElementById('filter-category').value : '';
    const stock = document.getElementById('filter-stock') ? document.getElementById('filter-stock').value : '';

    var result = BOOKS.slice();
    if (kw) {
        result = result.filter(b =>
            b.title.toLowerCase().includes(kw) ||
            b.author.toLowerCase().includes(kw) ||
            b.category.toLowerCase().includes(kw));
    }
    if (cat) result = result.filter(b => b.category === cat);
    if (stock === 'con') result = result.filter(b => b.stock > 0);
    else if (stock === 'het') result = result.filter(b => b.stock <= 0);

    const countEl = document.getElementById('result-count');
    if (countEl) countEl.textContent = result.length;

    if (result.length === 0) {
        el.innerHTML = '<p class="no-results">Không tìm thấy sách phù hợp. Vui lòng thử từ khóa khác.</p>';
        return;
    }
    el.innerHTML = result.map(bookCardHTML).join('');
}

// UI chung (menu mobile, back-to-top)
function initMenuToggle() {
    const btn = document.getElementById('menu-toggle');
    const nav = document.getElementById('main-nav');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => {
        nav.classList.toggle('active');
        btn.innerHTML = nav.classList.contains('active')
            ? '<i class="fa-solid fa-times"></i>'
            : '<i class="fa-solid fa-bars"></i>';
    });
}

function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        btn.style.display = window.scrollY > 300 ? 'flex' : 'none';
    });
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Validate + xử lý form
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const msg = form.message.value.trim();
        if (name.length < 2) return alert('Vui lòng nhập họ và tên!');
        if (!/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(email)) return alert('Email không hợp lệ!');
        if (msg.length < 10) return alert('Nội dung phải ít nhất 10 ký tự!');
        alert('Cảm ơn bạn đã liên hệ!');
        form.reset();
    });
}

function initAuthForms() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = loginForm.email.value.trim();
            const pass = loginForm.password.value;
            if (!/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(email)) return alert('Email không hợp lệ!');
            if (pass.length < 6) return alert('Mật khẩu phải ít nhất 6 ký tự!');
            // Tài khoản demo để test nhanh
            var user = null;
            if (email === 'admin@f5.vn' && pass === '123456') {
                user = {
                    id: 0,
                    name: 'Admin F5',
                    email: email,
                    phone: '0909000000',
                    joinDate: '2026-01-01',
                    role: 'admin'
                };
            } else if (email === 'user@f5.vn' && pass === '123456') {
                user = {
                    id: 1,
                    name: 'Nguyễn Văn A',
                    email: email,
                    phone: '0901234567',
                    joinDate: '2026-01-15',
                    role: 'user'
                };
            } else if (typeof READERS !== 'undefined') {
                var found = READERS.find(function (r) { return r.email === email && r.status === 'active'; });
                if (found) {
                    user = {
                        id: found.id,
                        name: found.name,
                        email: found.email,
                        phone: found.phone,
                        joinDate: found.joinDate,
                        role: 'user'
                    };
                }
            }
            if (!user) {
                alert('Email hoặc mật khẩu không đúng!\n\nTài khoản demo:\n- admin@f5.vn / 123456 (Admin)\n- user@f5.vn / 123456 (Độc giả)');
                return;
            }
            setCurrentUser(user);
            alert('Đăng nhập thành công! Chào mừng ' + user.name);
            location.href = 'taikhoan.html';
        });
        const toggleBtn = document.getElementById('toggle-password');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const input = loginForm.password;
                const icon = toggleBtn.querySelector('i');
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.replace('fa-eye', 'fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.replace('fa-eye-slash', 'fa-eye');
                }
            });
        }
    }

    const regForm = document.getElementById('register-form');
    if (regForm) {
        regForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = regForm.name.value.trim();
            const email = regForm.email.value.trim();
            const phone = regForm.phone.value.trim();
            const pass = regForm.password.value;
            const confirm = regForm.confirm.value;
            if (name.length < 2) return alert('Vui lòng nhập họ và tên!');
            if (!/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(email)) return alert('Email không hợp lệ!');
            if (!/^0\d{9,10}$/.test(phone)) return alert('Số điện thoại không hợp lệ!');
            if (pass.length < 6) return alert('Mật khẩu phải ít nhất 6 ký tự!');
            if (pass !== confirm) return alert('Mật khẩu xác nhận không khớp!');
            // Đăng ký xong thì đăng nhập luôn
            setCurrentUser({
                id: 99,
                name: name,
                email: email,
                phone: phone,
                joinDate: new Date().toISOString().slice(0, 10),
                role: 'user'
            });
            alert('Đăng ký thành công! Chào mừng ' + name);
            location.href = 'taikhoan.html';
        });
    }
}

// Trang admin (CRUD sách + độc giả + phiếu mượn) - Lưu localStorage
function getAdminBooks() {
    const raw = localStorage.getItem('adminBooks');
    if (!raw) {
        localStorage.setItem('adminBooks', JSON.stringify(BOOKS.slice()));
        return BOOKS.slice();
    }
    try { return JSON.parse(raw); } catch (e) { return BOOKS.slice(); }
}

function saveAdminBooks(arr) {
    localStorage.setItem('adminBooks', JSON.stringify(arr));
}

function getAdminReaders() {
    const raw = localStorage.getItem('adminReaders');
    if (!raw) {
        localStorage.setItem('adminReaders', JSON.stringify(READERS.slice()));
        return READERS.slice();
    }
    try { return JSON.parse(raw); } catch (e) { return READERS.slice(); }
}

function saveAdminReaders(arr) {
    localStorage.setItem('adminReaders', JSON.stringify(arr));
}

function getAdminLoans() {
    const raw = localStorage.getItem('adminLoans');
    if (!raw) {
        localStorage.setItem('adminLoans', JSON.stringify(LOANS.slice()));
        return LOANS.slice();
    }
    try { return JSON.parse(raw); } catch (e) { return LOANS.slice(); }
}

function saveAdminLoans(arr) {
    localStorage.setItem('adminLoans', JSON.stringify(arr));
}

// Kiểm tra quyền admin
function requireAdmin() {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
        alert('Bạn cần đăng nhập với tài khoản admin để truy cập!');
        location.href = 'dangnhap.html';
        return false;
    }
    return true;
}

// Modal helper
function openAdminModal(title, content) {
    let modal = document.getElementById('admin-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'admin-modal';
        modal.className = 'admin-modal';
        document.body.appendChild(modal);
    }
    modal.innerHTML = '<div class="admin-modal-content">' +
        '<div class="admin-modal-header"><h3>' + title + '</h3>' +
        '<button class="admin-modal-close" onclick="closeAdminModal()">&times;</button></div>' +
        '<div class="admin-modal-body">' + content + '</div></div>';
    modal.style.display = 'flex';
}

function closeAdminModal() {
    const modal = document.getElementById('admin-modal');
    if (modal) modal.style.display = 'none';
}

// Render bảng sách admin
function renderAdminBooksTable() {
    const bookTable = document.getElementById('admin-books');
    if (!bookTable) return;
    const books = getAdminBooks();
    var html = '';
    for (var i = 0; i < books.length; i++) {
        const b = books[i];
        const stockBadge = b.stock > 0
            ? '<span class="status status-active">Còn ' + b.stock + '</span>'
            : '<span class="status status-locked">Hết</span>';
        html += '<tr>';
        html += '<td>' + b.id + '</td>';
        html += '<td><img src="' + b.cover + '" class="thumb"></td>';
        html += '<td>' + b.title + '</td>';
        html += '<td>' + b.author + '</td>';
        html += '<td>' + b.category + '</td>';
        html += '<td>' + stockBadge + '</td>';
        html += '<td><button class="btn btn-sm btn-primary" onclick="editBook(' + b.id + ')" title="Sửa">';
        html += '<i class="fa-solid fa-edit"></i></button> ';
        html += '<button class="btn btn-sm btn-danger" onclick="deleteBook(' + b.id + ')" title="Xóa">';
        html += '<i class="fa-solid fa-trash"></i></button></td>';
        html += '</tr>';
    }
    bookTable.innerHTML = html;
}

// Render bảng độc giả admin
function renderAdminReadersTable() {
    const readerTable = document.getElementById('admin-readers');
    if (!readerTable) return;
    const readers = getAdminReaders();
    var html = '';
    for (var i = 0; i < readers.length; i++) {
        const r = readers[i];
        var status = r.status === 'active'
            ? '<span class="status status-active">Hoạt động</span>'
            : '<span class="status status-locked">Bị khóa</span>';
        html += '<tr>';
        html += '<td>' + r.id + '</td>';
        html += '<td>' + r.name + '</td>';
        html += '<td>' + r.email + '</td>';
        html += '<td>' + r.phone + '</td>';
        html += '<td>' + r.joinDate + '</td>';
        html += '<td>' + status + '</td>';
        html += '<td>';
        html += '<button class="btn btn-sm btn-primary" onclick="editReader(' + r.id + ')" title="Sửa">';
        html += '<i class="fa-solid fa-edit"></i></button> ';
        if (r.status === 'active') {
            html += '<button class="btn btn-sm btn-warning" onclick="toggleReaderStatus(' + r.id + ')" title="Khóa">';
            html += '<i class="fa-solid fa-lock"></i></button> ';
        } else {
            html += '<button class="btn btn-sm btn-success" onclick="toggleReaderStatus(' + r.id + ')" title="Mở khóa">';
            html += '<i class="fa-solid fa-lock-open"></i></button> ';
        }
        html += '<button class="btn btn-sm btn-danger" onclick="deleteReader(' + r.id + ')" title="Xóa">';
        html += '<i class="fa-solid fa-trash"></i></button>';
        html += '</td>';
        html += '</tr>';
    }
    readerTable.innerHTML = html;
}

// Render bảng phiếu mượn admin
function renderAdminLoansTable() {
    const loanTable = document.getElementById('admin-loans');
    if (!loanTable) return;
    const loans = getAdminLoans();
    var html = '';
    for (var i = 0; i < loans.length; i++) {
        const l = loans[i];
        var cls = (l.status === 'Đang mượn' || l.status === 'Đã trả') ? 'status-active' : 'status-locked';
        html += '<tr>';
        html += '<td>' + l.id + '</td>';
        html += '<td>' + l.reader + '</td>';
        html += '<td>' + l.book + '</td>';
        html += '<td>' + l.borrowDate + '</td>';
        html += '<td>' + l.dueDate + '</td>';
        html += '<td><span class="status ' + cls + '">' + l.status + '</span></td>';
        html += '<td>';
        html += '<button class="btn btn-sm btn-primary" onclick="editLoan(' + l.id + ')" title="Sửa">';
        html += '<i class="fa-solid fa-edit"></i></button> ';
        html += '<button class="btn btn-sm btn-danger" onclick="deleteLoan(' + l.id + ')" title="Xóa">';
        html += '<i class="fa-solid fa-trash"></i></button>';
        html += '</td>';
        html += '</tr>';
    }
    loanTable.innerHTML = html;
}

function renderAdminTables() {
    // Check quyền admin cho trang admin
    const adminPage = document.getElementById('admin-books');
    if (!adminPage) return;
    if (!requireAdmin()) return;

    renderAdminBooksTable();
    renderAdminReadersTable();
    renderAdminLoansTable();

    // Bind nút thêm
    const addBookBtn = document.getElementById('btn-add-book');
    if (addBookBtn) addBookBtn.onclick = () => openBookForm();
    const addReaderBtn = document.getElementById('btn-add-reader');
    if (addReaderBtn) addReaderBtn.onclick = () => openReaderForm();
    const addLoanBtn = document.getElementById('btn-add-loan');
    if (addLoanBtn) addLoanBtn.onclick = () => openLoanForm();
}

// CRUD SÁCH
function bookFormHTML(b) {
    b = b || {};
    return '<form id="book-form" onsubmit="submitBookForm(event, ' + (b.id || 'null') + ')">' +
        '<div class="form-group"><label>Tiêu đề</label>' +
        '<input type="text" name="title" required value="' + (b.title || '') + '"></div>' +
        '<div class="form-group"><label>Tác giả</label>' +
        '<input type="text" name="author" required value="' + (b.author || '') + '"></div>' +
        '<div class="form-group"><label>Thể loại</label>' +
        '<input type="text" name="category" required value="' + (b.category || '') + '"></div>' +
        '<div class="form-group"><label>Số lượng</label>' +
        '<input type="number" name="stock" min="0" required value="' + (b.stock || 0) + '"></div>' +
        '<div class="form-group"><label>Vị trí</label>' +
        '<input type="text" name="location" value="' + (b.location || '') + '"></div>' +
        '<div class="form-group"><label>Ảnh bìa (đường dẫn)</label>' +
        '<input type="text" name="cover" value="' + (b.cover || 'images/sach/book1.jpg') + '"></div>' +
        '<div class="form-group"><label>Mô tả</label>' +
        '<textarea name="description" rows="3">' + (b.description || '') + '</textarea></div>' +
        '<div class="form-group"><label><input type="checkbox" name="featured" ' + (b.featured ? 'checked' : '') + '"> Sách nổi bật</label></div>' +
        '<div class="form-group"><label><input type="checkbox" name="isNew" ' + (b.isNew ? 'checked' : '') + '"> Sách mới</label></div>' +
        '<button type="submit" class="btn btn-primary btn-block">Lưu</button>' +
        '</form>';
}

function openBookForm(book) {
    openAdminModal(book ? 'Sửa sách' : 'Thêm sách mới', bookFormHTML(book));
}

function editBook(id) {
    const books = getAdminBooks();
    const b = books.find(x => x.id === id);
    if (b) openBookForm(b);
}

function submitBookForm(e, id) {
    e.preventDefault();
    const form = e.target;
    const books = getAdminBooks();
    const data = {
        title: form.title.value.trim(),
        author: form.author.value.trim(),
        category: form.category.value.trim(),
        stock: parseInt(form.stock.value) || 0,
        location: form.location.value.trim(),
        cover: form.cover.value.trim(),
        description: form.description.value.trim(),
        featured: form.featured.checked,
        isNew: form.isNew.checked
    };
    if (id) {
        const idx = books.findIndex(x => x.id === id);
        if (idx >= 0) books[idx] = Object.assign({}, books[idx], data);
    } else {
        const maxId = books.reduce((m, b) => Math.max(m, b.id), 0);
        data.id = maxId + 1;
        books.push(data);
    }
    saveAdminBooks(books);
    closeAdminModal();
    renderAdminBooksTable();
    alert('Đã lưu sách!');
}

function deleteBook(id) {
    if (!confirm('Bạn có chắc muốn xóa sách này?')) return;
    const books = getAdminBooks().filter(b => b.id !== id);
    saveAdminBooks(books);
    renderAdminBooksTable();
    alert('Đã xóa sách!');
}

// CRUD ĐỘC GIẢ
function readerFormHTML(r) {
    r = r || {};
    return '<form id="reader-form" onsubmit="submitReaderForm(event, ' + (r.id || 'null') + ')">' +
        '<div class="form-group"><label>Họ tên</label>' +
        '<input type="text" name="name" required value="' + (r.name || '') + '"></div>' +
        '<div class="form-group"><label>Email</label>' +
        '<input type="email" name="email" required value="' + (r.email || '') + '"></div>' +
        '<div class="form-group"><label>Số điện thoại</label>' +
        '<input type="text" name="phone" required value="' + (r.phone || '') + '"></div>' +
        '<div class="form-group"><label>Ngày tham gia</label>' +
        '<input type="date" name="joinDate" value="' + (r.joinDate || new Date().toISOString().slice(0,10)) + '"></div>' +
        '<div class="form-group"><label>Trạng thái</label>' +
        '<select name="status"><option value="active" ' + (r.status === 'active' ? 'selected' : '') + '>Hoạt động</option>' +
        '<option value="locked" ' + (r.status === 'locked' ? 'selected' : '') + '>Bị khóa</option></select></div>' +
        '<button type="submit" class="btn btn-primary btn-block">Lưu</button>' +
        '</form>';
}

function openReaderForm(reader) {
    openAdminModal(reader ? 'Sửa độc giả' : 'Thêm độc giả mới', readerFormHTML(reader));
}

function editReader(id) {
    const readers = getAdminReaders();
    const r = readers.find(x => x.id === id);
    if (r) openReaderForm(r);
}

function submitReaderForm(e, id) {
    e.preventDefault();
    const form = e.target;
    const readers = getAdminReaders();
    const data = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        joinDate: form.joinDate.value,
        status: form.status.value
    };
    if (id) {
        const idx = readers.findIndex(x => x.id === id);
        if (idx >= 0) readers[idx] = Object.assign({}, readers[idx], data);
    } else {
        const maxId = readers.reduce((m, r) => Math.max(m, r.id), 0);
        data.id = maxId + 1;
        readers.push(data);
    }
    saveAdminReaders(readers);
    closeAdminModal();
    renderAdminReadersTable();
    alert('Đã lưu độc giả!');
}

function toggleReaderStatus(id) {
    const readers = getAdminReaders();
    const r = readers.find(x => x.id === id);
    if (!r) return;
    r.status = r.status === 'active' ? 'locked' : 'active';
    saveAdminReaders(readers);
    renderAdminReadersTable();
}

function deleteReader(id) {
    if (!confirm('Bạn có chắc muốn xóa độc giả này?')) return;
    const readers = getAdminReaders().filter(r => r.id !== id);
    saveAdminReaders(readers);
    renderAdminReadersTable();
    alert('Đã xóa độc giả!');
}

// CRUD PHIẾU MƯỢN
function loanFormHTML(l) {
    l = l || {};
    const books = getAdminBooks();
    const readers = getAdminReaders();
    let bookOpts = '<option value="">-- Chọn sách --</option>';
    for (let i = 0; i < books.length; i++) {
        bookOpts += '<option value="' + books[i].title + '" ' + (l.book === books[i].title ? 'selected' : '') + '>' + books[i].title + '</option>';
    }
    let readerOpts = '<option value="">-- Chọn độc giả --</option>';
    for (let i = 0; i < readers.length; i++) {
        readerOpts += '<option value="' + readers[i].name + '" ' + (l.reader === readers[i].name ? 'selected' : '') + '>' + readers[i].name + '</option>';
    }
    return '<form id="loan-form" onsubmit="submitLoanForm(event, ' + (l.id || 'null') + ')">' +
        '<div class="form-group"><label>Độc giả</label>' +
        '<select name="reader" required>' + readerOpts + '</select></div>' +
        '<div class="form-group"><label>Sách</label>' +
        '<select name="book" required>' + bookOpts + '</select></div>' +
        '<div class="form-group"><label>Ngày mượn</label>' +
        '<input type="date" name="borrowDate" required value="' + (l.borrowDate || new Date().toISOString().slice(0,10)) + '"></div>' +
        '<div class="form-group"><label>Hạn trả</label>' +
        '<input type="date" name="dueDate" required value="' + (l.dueDate || '') + '"></div>' +
        '<div class="form-group"><label>Trạng thái</label>' +
        '<select name="status"><option value="Đang mượn" ' + (l.status === 'Đang mượn' ? 'selected' : '') + '>Đang mượn</option>' +
        '<option value="Đã trả" ' + (l.status === 'Đã trả' ? 'selected' : '') + '>Đã trả</option>' +
        '<option value="Quá hạn" ' + (l.status === 'Quá hạn' ? 'selected' : '') + '>Quá hạn</option></select></div>' +
        '<button type="submit" class="btn btn-primary btn-block">Lưu</button>' +
        '</form>';
}

function openLoanForm(loan) {
    openAdminModal(loan ? 'Sửa phiếu mượn' : 'Thêm phiếu mượn mới', loanFormHTML(loan));
}

function editLoan(id) {
    const loans = getAdminLoans();
    const l = loans.find(x => x.id === id);
    if (l) openLoanForm(l);
}

function submitLoanForm(e, id) {
    e.preventDefault();
    const form = e.target;
    const loans = getAdminLoans();
    const data = {
        reader: form.reader.value,
        book: form.book.value,
        borrowDate: form.borrowDate.value,
        dueDate: form.dueDate.value,
        status: form.status.value
    };
    if (id) {
        const idx = loans.findIndex(x => x.id === id);
        if (idx >= 0) loans[idx] = Object.assign({}, loans[idx], data);
    } else {
        const maxId = loans.reduce((m, l) => Math.max(m, l.id), 0);
        data.id = maxId + 1;
        loans.push(data);
    }
    saveAdminLoans(loans);
    closeAdminModal();
    renderAdminLoansTable();
    alert('Đã lưu phiếu mượn!');
}

function deleteLoan(id) {
    if (!confirm('Bạn có chắc muốn xóa phiếu mượn này?')) return;
    const loans = getAdminLoans().filter(l => l.id !== id);
    saveAdminLoans(loans);
    renderAdminLoansTable();
    alert('Đã xóa phiếu mượn!');
}
