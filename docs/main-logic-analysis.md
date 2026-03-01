# Phân tích `js/main.js`

Tài liệu này mô tả luồng hoạt động của file `main.js` để dễ nắm logic tổng quan.

## 1) Vai trò của `main.js`

`main.js` là **entry point UI**: khởi tạo toàn bộ event listener khi `DOMContentLoaded`, điều hướng giữa các màn hình (start, chọn độ khó, chọn item, vào game), và nối các module `state`, `ui`, `game`, `admin` lại với nhau.

## 2) Các dependency chính

- `config.js`: lấy `DIFFICULTIES` và key localStorage cho NG+ (`NG_KEY`).
- `state.js`: đọc/ghi state toàn cục (`state`, `resetState`, bật/tắt sound, chọn item, ...).
- `ui.js`: render/chỉnh UI như badge AI, log panel.
- `game.js`: bắt đầu game (`initGame`) và render scene.
- `admin.js`: khởi tạo vùng quản trị (cheat/debug/toggle nội bộ).

## 3) Luồng người chơi từ đầu đến khi vào game

### 3.1 Start screen

- `initStartScreen()` gắn click cho nút Start.
- Khi click: ẩn `start-screen`, hiện `difficulty-screen`.

### 3.2 Difficulty screen

- `initDifficultyScreen()`:
  - Nút back: quay về start screen.
  - Nút `normal`, `expert`, `asian`: gọi `pickDifficulty(diffKey)`.

### 3.3 Hàm trung tâm `pickDifficulty(diffKey)`

`pickDifficulty` là điểm quyết định vào game theo 2 nhánh:

1. Ghi difficulty vào state bằng `setCurrentDiff(DIFFICULTIES[diffKey], diffKey)`.
2. Đọc toggle speed mode và cập nhật bằng `setSpeedModeEnabled(...)`.
3. Nếu đã unlock NG+ (`localStorage` có `NG_KEY`):
   - hiện `item-screen` để chọn item mở đầu.
4. Nếu chưa unlock NG+:
   - hiện `game-container`, `resetState()`, `initGame()`.

=> Nghĩa là người chơi thường vào game ngay sau khi chọn độ khó; còn NG+ phải qua thêm bước chọn item.

### 3.4 Item screen cho NG+

- `initItemScreen()` quản lý click card item:
  - card được chọn sẽ có class `selected`.
  - gọi `setSelectedItem(selectedCard)`.
  - bật nút confirm.
- Khi confirm:
  1. Ẩn item-screen, hiện game-container.
  2. `applyItemBonus(selectedCard)` (apply lần 1).
  3. `resetState()`.
  4. Set lại item + apply bonus lại (vì reset đã xóa hiệu lực lần 1).
  5. `setNgPlusActive(true)`.
  6. `initGame()`.

Lưu ý: apply bonus 2 lần là có chủ đích để xử lý việc `resetState` ghi đè state.

## 4) Logic item bonus

`applyItemBonus(itemKey)` tác động trực tiếp vào `state` rồi `updateUI()`:

- `budget`: +1.500.000 tiền, -10 quality (trade-off).
- `captain`: +20 morale.
- `redo`: không cộng chỉ số ngay; hiệu lực xử lý ở `game.js`.

## 5) Các thành phần UI phụ trợ

### 5.1 Log panel

`initLogPanel()` tạo open/close logic cho panel lịch sử quyết định:

- Mở panel sẽ gọi `renderDecisionLogPanel()` trước.
- Đóng bằng nút close hoặc click backdrop.

### 5.2 Sound toggle

`initSoundToggle()` đảo `soundEnabled` trong state và đổi label/icon nút.

### 5.3 Theme toggle

`initThemeToggle()` đổi class `theme-volunteer` trên `body`, đồng thời đổi text nút giữa 2 mode.

### 5.4 NG+ button và Replay

- `initNgPlusButton()`: ghi `NG_KEY` vào localStorage rồi reload để unlock flow NG+.
- `initReplayButton()`: chỉ reload trang.

### 5.5 AI badge

`initAIBadge()` chỉ mang tính hiển thị trạng thái `AI Mode`; click badge không thực hiện toggle thật (comment cho biết chỉ admin mới được tắt).

### 5.6 Keyboard shortcuts

`initKeyboard()` map phím `A/B/C/D` -> click nhanh choice button tương ứng (nếu chưa disabled).

## 6) Boot sequence khi `DOMContentLoaded`

Thứ tự khởi tạo:

1. Start screen
2. Difficulty screen
3. Item screen
4. Log panel
5. Sound toggle
6. Theme toggle
7. NG+ button
8. Replay button
9. Admin
10. AI badge
11. Keyboard
12. `updateLogBadge()` và `updateAIBadge()`
13. Nếu đã unlock NG+, thêm chip `⭐ New Game+` vào `start-brief`.

## 7) Kết luận ngắn

- `main.js` không chứa game rule chi tiết, mà đóng vai trò **orchestrator** cho luồng màn hình + binding event.
- Quy tắc gameplay nằm nhiều hơn ở `game.js` và `state.js`; `main.js` chịu trách nhiệm chuyển ngữ hành động người dùng thành lời gọi hàm module tương ứng.
